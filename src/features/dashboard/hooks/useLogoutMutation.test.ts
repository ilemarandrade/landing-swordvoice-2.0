import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { useLogoutMutation } from "@/features/dashboard/hooks/useLogoutMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

type PostResponse = Awaited<ReturnType<typeof apiClient.post>>;
const okResponse = { data: null } as PostResponse;

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useLogoutMutation(), { wrapper }) };
}

describe("useLogoutMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("clears the tokens and the cache, then revokes the refresh token", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockResolvedValue(okResponse);
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Ana" });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTokens()).toBeNull();
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
    expect(apiClient.post).toHaveBeenCalledWith("/auth/logout", { refreshToken: "r" });
  });

  it("clears the local session before calling the API (local-first)", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    const tokensWhenCalled: unknown[] = [];
    vi.mocked(apiClient.post).mockImplementation(() => {
      tokensWhenCalled.push(getTokens());
      return Promise.resolve(okResponse);
    });
    const { result } = setup();
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tokensWhenCalled).toEqual([null]);
  });

  it("clears the tokens even when the API call fails", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(0, "sin conexión"));
    const { result } = setup();
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getTokens()).toBeNull();
  });

  it.each([
    { status: 0, message: "sin conexión" },
    { status: 500, message: "Error interno" },
  ])(
    "still clears the local session and the cache when POST /auth/logout fails with status $status",
    async ({ status, message }) => {
      saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError(status, message));
      const { client, result } = setup();
      client.setQueryData(["auth", "me"], { name: "Ana" });
      act(() => result.current.mutate());
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(ApiError);
      expect(getTokens()).toBeNull();
      expect(client.getQueryData(["auth", "me"])).toBeUndefined();
    },
  );

  it("does not notify the user when the API call fails", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(0, "sin conexión"));
    const { result } = setup();
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("does not call the API when there is no session", async () => {
    const { result } = setup();
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
