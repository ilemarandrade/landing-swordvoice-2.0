import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUsersAdminUrl } from "@/features/admin/hooks/useUsersAdminUrl";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const current = { search: "ana", page: 3, userId: null, academyRole: null };

describe("useUsersAdminUrl", () => {
  beforeEach(() => {
    router.replace.mockReset();
  });

  it("resets the page when the search changes", () => {
    renderHook(() => useUsersAdminUrl(current)).result.current.setSearch(
      "luis",
    );
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?search=luis",
      { scroll: false },
    );
  });

  it("drops an empty search and page 1 from the URL", () => {
    renderHook(() => useUsersAdminUrl(current)).result.current.setSearch("");
    expect(router.replace).toHaveBeenCalledWith("/dashboard/admin/users", {
      scroll: false,
    });
  });

  it("keeps search and page when opening and closing a user", () => {
    const { result } = renderHook(() => useUsersAdminUrl(current));
    result.current.openUser("u1");
    expect(router.replace).toHaveBeenLastCalledWith(
      "/dashboard/admin/users?search=ana&page=3&user=u1",
      { scroll: false },
    );

    renderHook(() =>
      useUsersAdminUrl({ ...current, userId: "u1" }),
    ).result.current.closeUser();
    expect(router.replace).toHaveBeenLastCalledWith(
      "/dashboard/admin/users?search=ana&page=3",
      { scroll: false },
    );
  });

  it("writes the page and omits it when it is 1", () => {
    const { result } = renderHook(() => useUsersAdminUrl(current));
    result.current.setPage(2);
    expect(router.replace).toHaveBeenLastCalledWith(
      "/dashboard/admin/users?search=ana&page=2",
      { scroll: false },
    );

    result.current.setPage(1);
    expect(router.replace).toHaveBeenLastCalledWith(
      "/dashboard/admin/users?search=ana",
      { scroll: false },
    );
  });

  it("sets academyRole in the URL and drops the page", () => {
    renderHook(() =>
      useUsersAdminUrl({ search: "", page: 3, userId: null, academyRole: null }),
    ).result.current.setAcademyRole("MENTOR");
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?academyRole=MENTOR",
      { scroll: false },
    );
  });

  it("removes academyRole from the URL when set to null", () => {
    renderHook(() =>
      useUsersAdminUrl({ ...current, academyRole: "MENTOR" }),
    ).result.current.setAcademyRole(null);
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?search=ana",
      { scroll: false },
    );
  });

  it("keeps the search when the role changes", () => {
    renderHook(() => useUsersAdminUrl(current)).result.current.setAcademyRole(
      "APPRENTICE",
    );
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?search=ana&academyRole=APPRENTICE",
      { scroll: false },
    );
  });

  it("keeps the role when the search changes", () => {
    renderHook(() =>
      useUsersAdminUrl({ ...current, academyRole: "MENTOR", page: 2 }),
    ).result.current.setSearch("luis");
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?search=luis&academyRole=MENTOR",
      { scroll: false },
    );
  });

  it("keeps the role when the page changes", () => {
    renderHook(() =>
      useUsersAdminUrl({ ...current, search: "", academyRole: "NEWCOMER" }),
    ).result.current.setPage(2);
    expect(router.replace).toHaveBeenCalledWith(
      "/dashboard/admin/users?academyRole=NEWCOMER&page=2",
      { scroll: false },
    );
  });
});
