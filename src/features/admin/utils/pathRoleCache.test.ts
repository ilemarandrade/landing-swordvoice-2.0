import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import type { User } from "@/common/api/auth.schema";
import { notifyError } from "@/common/errors/notifyError";
import { applyUpdatedUser, handlePathRoleError } from "@/features/admin/utils/pathRoleCache";

vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

const user: User = { id: "u1", email: "ana@example.com", name: "Ana", role: "USER", emailVerified: true, pathRoles: [] };
const updated: User = { ...user, name: "Ana B" };
const listKey = ["users", { search: "", page: 1 }] as const;
const detailKey = ["users", "u1"] as const;

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("applyUpdatedUser", () => {
  beforeEach(() => {
    vi.mocked(notifyError).mockReset();
  });

  it("writes the detail with the response", () => {
    const client = createClient();
    applyUpdatedUser(client, updated);
    expect(client.getQueryData(detailKey)).toEqual(updated);
  });

  it("invalidates the list keys and leaves the detail untouched", () => {
    const client = createClient();
    client.setQueryData(listKey, { items: [], meta: {} });
    client.setQueryData(detailKey, user);
    applyUpdatedUser(client, updated);
    expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(detailKey)?.isInvalidated).toBe(false);
  });

  it("refetches an active list but does not refetch the active detail", async () => {
    const client = createClient();
    const listFn = vi.fn(async () => ({ items: [user], meta: {} }));
    const detailFn = vi.fn(async () => user);
    renderHook(
      () => {
        useQuery({ queryKey: listKey, queryFn: listFn });
        useQuery({ queryKey: detailKey, queryFn: detailFn });
      },
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          createElement(QueryClientProvider, { client }, children),
      },
    );
    await waitFor(() => expect(listFn).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(detailFn).toHaveBeenCalledTimes(1));

    applyUpdatedUser(client, updated);

    await waitFor(() => expect(listFn).toHaveBeenCalledTimes(2));
    expect(detailFn).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(detailKey)).toEqual(updated);
  });
});

describe("handlePathRoleError", () => {
  beforeEach(() => {
    vi.mocked(notifyError).mockReset();
  });

  it("refetches /auth/me on FORBIDDEN and notifies", () => {
    const client = createClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const error = new ApiError(403, "Sin permisos", "FORBIDDEN");
    handlePathRoleError(client, error);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ["paths"] });
    expect(notifyError).toHaveBeenCalledWith(error);
  });

  it("refetches the paths on PATH_NOT_FOUND and notifies", () => {
    const client = createClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const error = new ApiError(404, "El path no existe", "PATH_NOT_FOUND");
    handlePathRoleError(client, error);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["paths"] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
    expect(notifyError).toHaveBeenCalledWith(error);
  });

  it("only notifies for any other error", () => {
    const client = createClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const error = new ApiError(500, "Algo falló", "INTERNAL");
    handlePathRoleError(client, error);
    expect(invalidate).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith(error);
  });
});
