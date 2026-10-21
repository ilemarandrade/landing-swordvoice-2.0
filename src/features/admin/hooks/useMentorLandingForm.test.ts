import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/common/api/apiClient";
import { useMentorLandingForm } from "@/features/admin/hooks/useMentorLandingForm";
import type { MentorLanding } from "@/features/admin/schemas/mentorLanding.schema";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn(), patch: vi.fn() },
}));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function setup(landing: MentorLanding) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return renderHook(() => useMentorLandingForm(landing), { wrapper });
}

describe("useMentorLandingForm", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
  });

  it("starts with Guardar disabled because nothing is dirty", () => {
    const { result } = setup({ userId: "u1", showOnLanding: true, landingOrder: 3 });
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("submits the saved numeric landingOrder with the userId", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { userId: "u1", showOnLanding: true, landingOrder: 3 },
    } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { result } = setup({ userId: "u1", showOnLanding: true, landingOrder: 3 });

    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith("/mentors/u1/landing", {
        showOnLanding: true,
        landingOrder: 3,
      }),
    );
  });

  it("maps a null landingOrder (empty field by default) to null in the payload", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { userId: "u1", showOnLanding: false, landingOrder: null },
    } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { result } = setup({ userId: "u1", showOnLanding: false, landingOrder: null });

    await act(() => result.current.onSubmit());

    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith("/mentors/u1/landing", {
        showOnLanding: false,
        landingOrder: null,
      }),
    );
  });
});
