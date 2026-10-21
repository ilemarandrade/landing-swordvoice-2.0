import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { useResetPasswordMutation } from "@/features/auth/hooks/useResetPasswordMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useResetPasswordMutation(), { wrapper }) };
}

const body = { token: "t1", password: "nuevaclave" };

describe("useResetPasswordMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts token and password, clears the local session and confirms", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/reset", body);
    expect(getTokens()).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("Contraseña actualizada; inicia sesión de nuevo");
  });

  // Añadido al plan: onSuccess también vacía la caché de React Query (datos de la sesión anterior).
  it("drops the cached queries of the previous session on success", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Otra persona" });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
  });

  it("does not toast INVALID_EMAIL_TOKEN and keeps the session", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(400, "x", "INVALID_EMAIL_TOKEN"));
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(getTokens()).not.toBeNull();
  });

  it("toasts a 429", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });
});
