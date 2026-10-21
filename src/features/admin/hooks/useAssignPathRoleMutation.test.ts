import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useAssignPathRoleMutation } from "@/features/admin/hooks/useAssignPathRoleMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { put: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  role: "USER",
  emailVerified: true,
  pathRoles: [{ path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" }],
};

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, ...renderHook(() => useAssignPathRoleMutation(), { wrapper }) };
}

describe("useAssignPathRoleMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.put).mockReset();
  });

  it("puts the role, writes the detail and invalidates only the lists", async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: user } as Awaited<ReturnType<typeof apiClient.put>>);
    const { client, result } = setup();
    client.setQueryData(["users", { search: "", page: 1 }], { items: [], meta: {} });
    act(() => result.current.mutate({ userId: "u1", pathId: "p1", role: "MENTOR" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.put).toHaveBeenCalledWith("/users/u1/path-roles/p1", { role: "MENTOR" });
    expect(client.getQueryData(["users", "u1"])).toEqual(user);
    expect(client.getQueryState(["users", { search: "", page: 1 }])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["users", "u1"])?.isInvalidated).toBe(false);
  });

  it("refetches /auth/me on FORBIDDEN", async () => {
    vi.mocked(apiClient.put).mockRejectedValue(new ApiError(403, "x", "FORBIDDEN"));
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1", role: "MENTOR" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
    expect(notifyError).toHaveBeenCalled();
  });

  it("refetches the paths on PATH_NOT_FOUND", async () => {
    vi.mocked(apiClient.put).mockRejectedValue(new ApiError(404, "x", "PATH_NOT_FOUND"));
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p9", role: "APPRENTICE" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["paths"] });
  });
});
