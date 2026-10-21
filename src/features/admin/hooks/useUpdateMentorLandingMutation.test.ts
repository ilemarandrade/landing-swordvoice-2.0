import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import { useUpdateMentorLandingMutation } from "@/features/admin/hooks/useUpdateMentorLandingMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { patch: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const landing = { userId: "u1", showOnLanding: true, landingOrder: null };

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, ...renderHook(() => useUpdateMentorLandingMutation(), { wrapper }) };
}

describe("useUpdateMentorLandingMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
    vi.mocked(notifyError).mockReset();
    vi.mocked(toast.success).mockReset();
  });

  it("patches the landing settings with the given values", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: landing } as Awaited<
      ReturnType<typeof apiClient.patch>
    >);
    const { result } = setup();
    act(() =>
      result.current.mutate({ userId: "u1", showOnLanding: true, landingOrder: null }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.patch).toHaveBeenCalledWith("/mentors/u1/landing", {
      showOnLanding: true,
      landingOrder: null,
    });
  });

  it("writes the response into the landing cache, invalidates the mentor lists and toasts", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: landing } as Awaited<
      ReturnType<typeof apiClient.patch>
    >);
    const { client, invalidate, result } = setup();
    client.setQueryData(["mentors", "u1", "landing"], { ...landing, landingOrder: 9 });
    client.setQueryData(["mentors", "list"], { items: [] });
    act(() =>
      result.current.mutate({ userId: "u1", showOnLanding: true, landingOrder: null }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(["mentors", "u1", "landing"])).toEqual(landing);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["mentors"], exact: true });
    expect(toast.success).toHaveBeenCalledWith(adminMessages.LANDING_SAVED);
  });

  it("does not notify LANDING_ORDER_TAKEN (the form shows it)", async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(
      new ApiError(409, adminMessages.LANDING_ORDER_TAKEN, "LANDING_ORDER_TAKEN"),
    );
    const { result } = setup();
    act(() =>
      result.current.mutate({ userId: "u1", showOnLanding: true, landingOrder: 2 }),
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("notifies any other ApiError", async () => {
    const error = new ApiError(400, "Datos inválidos", "VALIDATION_ERROR");
    vi.mocked(apiClient.patch).mockRejectedValue(error);
    const { result } = setup();
    act(() =>
      result.current.mutate({ userId: "u1", showOnLanding: true, landingOrder: 2 }),
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).toHaveBeenCalledWith(error);
  });

  it("refetches /auth/me on FORBIDDEN and still notifies", async () => {
    const error = new ApiError(403, "Sin permisos", "FORBIDDEN");
    vi.mocked(apiClient.patch).mockRejectedValue(error);
    const { invalidate, result } = setup();
    act(() =>
      result.current.mutate({ userId: "u1", showOnLanding: true, landingOrder: 2 }),
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
    expect(notifyError).toHaveBeenCalledWith(error);
  });

  it("does not refetch /auth/me on other errors", async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new ApiError(500, "boom", "INTERNAL"));
    const { invalidate, result } = setup();
    act(() =>
      result.current.mutate({ userId: "u1", showOnLanding: true, landingOrder: 2 }),
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
  });
});
