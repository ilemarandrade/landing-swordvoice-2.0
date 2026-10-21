import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useForgotPasswordMutation } from "@/features/auth/hooks/useForgotPasswordMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useForgotPasswordMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts the email", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = renderHook(() => useForgotPasswordMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/forgot", { email: "ana@example.com" });
  });

  it("notifies a 429", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = renderHook(() => useForgotPasswordMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });
});
