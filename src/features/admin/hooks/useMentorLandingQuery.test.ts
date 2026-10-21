import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { useMentorLandingQuery } from "@/features/admin/hooks/useMentorLandingQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const landing = { userId: "u1", showOnLanding: true, landingOrder: 3 };
const ok = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

describe("useMentorLandingQuery", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("does not request anything when disabled", () => {
    const { result } = renderHook(() => useMentorLandingQuery("u1", { enabled: false }), {
      wrapper,
    });
    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isNotFound).toBe(false);
  });

  it("fetches the landing settings and validates them", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(landing));
    const { result } = renderHook(() => useMentorLandingQuery("u1", { enabled: true }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/mentors/u1/landing");
    expect(result.current.data).toEqual(landing);
  });

  it("flags USER_NOT_FOUND as isNotFound", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(404, "x", "USER_NOT_FOUND"));
    const { result } = renderHook(() => useMentorLandingQuery("u1", { enabled: true }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.isNotFound).toBe(true);
  });

  it("does not flag other ApiErrors as isNotFound", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(500, "boom", "INTERNAL"));
    const { result } = renderHook(() => useMentorLandingQuery("u1", { enabled: true }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);
  });

  it("errors with a ZodError when the response does not match the schema", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok({ userId: "u1", landingOrder: 3 }));
    const { result } = renderHook(() => useMentorLandingQuery("u1", { enabled: true }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ZodError);
    expect(result.current.isNotFound).toBe(false);
  });
});
