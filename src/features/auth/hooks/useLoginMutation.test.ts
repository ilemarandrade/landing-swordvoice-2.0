import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

function ok(data: unknown): Awaited<ReturnType<typeof apiClient.post>> {
  return { data } as Awaited<ReturnType<typeof apiClient.post>>;
}

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useLoginMutation(), { wrapper }) };
}

const credentials = { email: "ana@example.com", password: "secreta" };

describe("useLoginMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts the credentials and saves the tokens", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(
      ok({ accessToken: "a", refreshToken: "r", expiresIn: 900 }),
    );
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", credentials);
    expect(getTokens()).toMatchObject({ accessToken: "a", refreshToken: "r" });
  });

  it("drops the cached user of a previous session", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(
      ok({ accessToken: "a", refreshToken: "r", expiresIn: 900 }),
    );
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Usuario anterior" });
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
  });

  it("notifies the API error and saves nothing", async () => {
    const error = new ApiError(403, "Confirma tu correo", "EMAIL_NOT_VERIFIED");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
    expect(getTokens()).toBeNull();
  });

  it("fails and saves nothing when the response does not match the schema", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(ok({ accessToken: "a" }));
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getTokens()).toBeNull();
  });
});
