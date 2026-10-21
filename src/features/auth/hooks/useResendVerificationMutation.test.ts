import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useResendVerificationMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts the email and confirms with a neutral message", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = renderHook(() => useResendVerificationMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/email/verify/resend", { email: "ana@example.com" });
    expect(toast.success).toHaveBeenCalledWith(
      "Si la cuenta existe y no está confirmada, enviamos un correo nuevo",
    );
  });

  it("toasts a 429 with the API message", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = renderHook(() => useResendVerificationMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });
});
