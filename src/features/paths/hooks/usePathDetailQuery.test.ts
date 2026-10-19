import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { usePathDetailQuery } from "@/features/paths/hooks/usePathDetailQuery";
import { getPathDetail } from "@/features/paths/services/pathsService";

vi.mock("@/features/paths/services/pathsService", () => ({
  getPaths: vi.fn(),
  getPathDetail: vi.fn(),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe("usePathDetailQuery", () => {
  beforeEach(() => {
    vi.mocked(getPathDetail).mockReset();
  });

  it("sets isNotFound when the service rejects with a 404 ApiError", async () => {
    vi.mocked(getPathDetail).mockRejectedValue(new ApiError(404, "x"));

    const { result } = renderHook(() => usePathDetailQuery("no-existe"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(true);
    expect(getPathDetail).toHaveBeenCalledWith("no-existe");
  });

  it("does not set isNotFound for a 500 ApiError", async () => {
    vi.mocked(getPathDetail).mockRejectedValue(new ApiError(500, "x"));

    const { result } = renderHook(() => usePathDetailQuery("fundamentos"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);
  });
});
