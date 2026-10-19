import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/common/api/apiClient";
import { usePathsQuery } from "@/features/paths/hooks/usePathsQuery";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

function ok(data: unknown): Awaited<ReturnType<typeof apiClient.get>> {
  return { data } as Awaited<ReturnType<typeof apiClient.get>>;
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe("usePathsQuery", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("requests the first page with limit 100 and returns the parsed list", async () => {
    const page = {
      items: [
        {
          id: "id-fundamentos",
          name: "Fundamentos",
          slug: "fundamentos",
          description: "Base del camino",
          currentVersion: 1,
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));

    const { result } = renderHook(() => usePathsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/paths", {
      params: { page: 1, limit: 100 },
    });
    expect(result.current.data).toEqual(page);
  });
});
