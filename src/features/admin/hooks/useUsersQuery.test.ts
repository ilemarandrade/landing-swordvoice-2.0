import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import type { AcademyRole } from "@/common/api/auth.schema";
import { useUsersQuery } from "@/features/admin/hooks/useUsersQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const page = {
  items: [
    { id: "u1", email: "ana@example.com", name: "Ana", academyRole: "NEWCOMER", emailVerified: true, pathRoles: [] },
  ],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};
const ok = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

describe("useUsersQuery", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("omits an empty search and a null academyRole", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));
    const { result } = renderHook(
      () => useUsersQuery({ search: "", page: 1, academyRole: null }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users", { params: { page: 1, limit: 20 } });
    expect(result.current.data).toEqual(page);
  });

  it("sends the search and the page", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));
    const { result } = renderHook(
      () => useUsersQuery({ search: "ana", page: 2, academyRole: null }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users", { params: { page: 2, limit: 20, search: "ana" } });
  });

  it("sends academyRole only when it is set", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));
    const { result } = renderHook(
      () => useUsersQuery({ search: "", page: 1, academyRole: "MENTOR" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users", {
      params: { page: 1, limit: 20, academyRole: "MENTOR" },
    });
  });

  it("sends search and academyRole together", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));
    const { result } = renderHook(
      () => useUsersQuery({ search: "ana", page: 1, academyRole: "APPRENTICE" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users", {
      params: { page: 1, limit: 20, search: "ana", academyRole: "APPRENTICE" },
    });
  });

  it("requests again with the new role when the filter changes", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));
    const initialProps: { academyRole: AcademyRole | null } = { academyRole: null };
    const { result, rerender } = renderHook(
      ({ academyRole }: { academyRole: AcademyRole | null }) =>
        useUsersQuery({ search: "", page: 1, academyRole }),
      { wrapper, initialProps },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ academyRole: "MENTOR" });
    await waitFor(() =>
      expect(apiClient.get).toHaveBeenLastCalledWith("/users", {
        params: { page: 1, limit: 20, academyRole: "MENTOR" },
      }),
    );
  });

  it("exposes the ApiError and rejects an invalid page", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new ApiError(403, "x", "FORBIDDEN"));
    const forbidden = renderHook(
      () => useUsersQuery({ search: "", page: 1, academyRole: null }),
      { wrapper },
    );
    await waitFor(() => expect(forbidden.result.current.error).toBeInstanceOf(ApiError));

    vi.mocked(apiClient.get).mockResolvedValueOnce(ok({ items: [{ id: 1 }], meta: page.meta }));
    const invalid = renderHook(
      () => useUsersQuery({ search: "x", page: 1, academyRole: null }),
      { wrapper },
    );
    await waitFor(() => expect(invalid.result.current.isError).toBe(true));
  });

  it("keeps the previous page on screen while the next one loads", async () => {
    const nextPage = { ...page, meta: { ...page.meta, page: 2 } };
    let resolveNext: (value: unknown) => void = () => undefined;
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(ok(page))
      .mockReturnValueOnce(new Promise((resolve) => (resolveNext = resolve)));

    const { result, rerender } = renderHook(
      ({ current }: { current: number }) =>
        useUsersQuery({ search: "", page: current, academyRole: null }),
      { wrapper, initialProps: { current: 1 } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ current: 2 });
    expect(result.current.data).toEqual(page);
    expect(result.current.isPlaceholderData).toBe(true);

    resolveNext(ok(nextPage));
    await waitFor(() => expect(result.current.data).toEqual(nextPage));
    expect(result.current.isPlaceholderData).toBe(false);
  });
});
