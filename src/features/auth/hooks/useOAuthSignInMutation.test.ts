import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { useOAuthSignInMutation } from "@/features/auth/hooks/useOAuthSignInMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useOAuthSignInMutation(), { wrapper }) };
}

const redirectUri = "http://localhost:3000/auth/callback";
const body = {
  provider: "github" as const,
  code: "c1",
  redirectUri,
  codeVerifier: "v".repeat(43),
};

describe("useOAuthSignInMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it("posts to the provider endpoint, saves the tokens and drops the previous cache", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Otra persona" });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/oauth/github", {
      code: "c1",
      redirectUri,
      codeVerifier: "v".repeat(43),
    });
    expect(getTokens()).toMatchObject({ accessToken: "a" });
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
  });

  it("does not send a verifier key when none is given", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = setup();
    act(() => result.current.mutate({ provider: "linkedin", code: "c1", redirectUri }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(apiClient.post).mock.calls[0]?.[1]).not.toHaveProperty("codeVerifier");
  });

  it("returns the ApiError to the caller without toasting it", async () => {
    const error = new ApiError(503, "GitHub no responde", "OAUTH_PROVIDER_UNAVAILABLE");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(toast.error).not.toHaveBeenCalled();
    expect(getTokens()).toBeNull();
  });

  it("saves nothing and does not toast when the response does not match the schema", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: "a" } } as Awaited<
      ReturnType<typeof apiClient.post>
    >);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getTokens()).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
