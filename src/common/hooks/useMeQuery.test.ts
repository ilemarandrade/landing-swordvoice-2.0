import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { saveTokens } from "@/common/api/tokenStorage";
import { useMeQuery } from "@/common/hooks/useMeQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function ok(data: unknown): Awaited<ReturnType<typeof apiClient.get>> {
  return { data } as Awaited<ReturnType<typeof apiClient.get>>;
}

// renderWithClient solo renderiza UI; para renderHook hace falta un wrapper con QueryClient.
function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Pérez",
  role: "USER",
  emailVerified: true,
  pathRoles: [{ path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" }],
};

describe("useMeQuery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.get).mockReset();
  });

  it("does not request /auth/me without a session", () => {
    renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("returns the parsed user when there is a session", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockResolvedValue(ok(user));
    const { result } = renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/auth/me");
    expect(result.current.data).toEqual(user);
  });

  it("exposes the ApiError", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(500, "x"));
    const { result } = renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });

  it("fails when the response does not match the schema", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockResolvedValue(ok({ ...user, role: "OWNER" }));
    const { result } = renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
