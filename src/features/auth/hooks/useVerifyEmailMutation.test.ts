import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { useVerifyEmailMutation } from "@/features/auth/hooks/useVerifyEmailMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useVerifyEmailMutation(), { wrapper }) };
}

const body = { token: "t1", password: "secreta" };

describe("useVerifyEmailMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts token and password, saves the tokens and drops the previous cache", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Otra persona" });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/email/verify", body);
    expect(getTokens()).toMatchObject({ accessToken: "a" });
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
  });

  it.each(["INVALID_CREDENTIALS", "INVALID_EMAIL_TOKEN"])("does not toast %s", async (code) => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(400, "x", code));
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("toasts a 429", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });

  it("saves nothing when the response does not match the schema", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: "a" } } as Awaited<
      ReturnType<typeof apiClient.post>
    >);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getTokens()).toBeNull();
  });
});
