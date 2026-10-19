import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { usePathDetailQuery } from "@/features/paths/hooks/usePathDetailQuery";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

function ok(data: unknown): Awaited<ReturnType<typeof apiClient.get>> {
  return { data } as Awaited<ReturnType<typeof apiClient.get>>;
}

const validDetail = {
  id: "id-fundamentos",
  name: "Fundamentos",
  slug: "fundamentos",
  description: null,
  version: 1,
  isCurrent: true,
  requiredCertifications: [],
  topics: [],
};

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
    vi.mocked(apiClient.get).mockReset();
  });

  it("returns the parsed path detail on success", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(validDetail));

    const { result } = renderHook(() => usePathDetailQuery("fundamentos"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(validDetail);
    expect(result.current.isNotFound).toBe(false);
    expect(apiClient.get).toHaveBeenCalledWith("/paths/fundamentos");
  });

  it("sets isNotFound when the request rejects with a 404 ApiError", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(404, "x"));

    const { result } = renderHook(() => usePathDetailQuery("no-existe"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(true);
    expect(apiClient.get).toHaveBeenCalledWith("/paths/no-existe");
  });

  it("does not set isNotFound for a 500 ApiError", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(500, "x"));

    const { result } = renderHook(() => usePathDetailQuery("fundamentos"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isNotFound).toBe(false);
  });

  it("sets isError without isNotFound when the payload does not match pathDetailSchema", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok({ id: "x", name: 123 }));

    const { result } = renderHook(() => usePathDetailQuery("fundamentos"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.name).toBe("ZodError");
    expect(result.current.isNotFound).toBe(false);
  });
});
