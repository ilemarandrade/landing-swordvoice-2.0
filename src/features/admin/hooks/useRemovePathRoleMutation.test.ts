import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useRemovePathRoleMutation } from "@/features/admin/hooks/useRemovePathRoleMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { delete: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const user = { id: "u1", email: "a@x.com", name: "Ana", role: "USER", emailVerified: true, pathRoles: [] };

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, ...renderHook(() => useRemovePathRoleMutation(), { wrapper }) };
}

describe("useRemovePathRoleMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.delete).mockReset();
  });

  it("deletes the role and writes the detail", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: user } as Awaited<ReturnType<typeof apiClient.delete>>);
    const { client, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.delete).toHaveBeenCalledWith("/users/u1/path-roles/p1");
    expect(client.getQueryData(["users", "u1"])).toEqual(user);
  });

  it("treats PATH_ROLE_NOT_FOUND as already removed: no toast, reload the user", async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(404, "x", "PATH_ROLE_NOT_FOUND"));
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["users", "u1"], exact: true });
  });

  it("does not show a success toast when the role was already removed", async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(404, "x", "PATH_ROLE_NOT_FOUND"));
    const { result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("reloads the open detail when PATH_ROLE_NOT_FOUND arrives", async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(404, "x", "PATH_ROLE_NOT_FOUND"));
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const detailFn = vi.fn(async () => user);
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(
      () => {
        useQuery({ queryKey: ["users", "u1"], queryFn: detailFn });
        return useRemovePathRoleMutation();
      },
      { wrapper },
    );
    await waitFor(() => expect(detailFn).toHaveBeenCalledTimes(1));

    act(() => result.current.mutate({ userId: "u1", pathId: "p1" }));
    await waitFor(() => expect(detailFn).toHaveBeenCalledTimes(2));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("refetches /auth/me on FORBIDDEN (admin revoked in another tab)", async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(403, "x", "FORBIDDEN"));
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });
});
