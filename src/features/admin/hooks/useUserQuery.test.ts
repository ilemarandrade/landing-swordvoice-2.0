import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { useUserQuery } from "@/features/admin/hooks/useUserQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  role: "USER",
  emailVerified: true,
  pathRoles: [],
};
const ok = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

describe("useUserQuery", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("does not request anything without an id", () => {
    const { result } = renderHook(() => useUserQuery(null), { wrapper });
    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isNotFound).toBe(false);
  });

  it("fetches the user and validates it", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(user));
    const { result } = renderHook(() => useUserQuery("u1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users/u1");
    expect(result.current.data).toEqual(user);
  });

  it("encodes the id in the path", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(user));
    const { result } = renderHook(() => useUserQuery("a/b"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users/a%2Fb");
  });

  it("flags USER_NOT_FOUND as isNotFound", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(404, "x", "USER_NOT_FOUND"));
    const { result } = renderHook(() => useUserQuery("u9"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.isNotFound).toBe(true);
  });

  it("does not flag other ApiErrors as isNotFound", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(500, "boom", "INTERNAL"));
    const { result } = renderHook(() => useUserQuery("u1"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);
  });

  it("errors when the response does not match the schema", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok({ id: "u1" }));
    const { result } = renderHook(() => useUserQuery("u1"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);
  });
});
