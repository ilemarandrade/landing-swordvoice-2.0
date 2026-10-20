import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
const logout = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));
vi.mock("@/features/dashboard/hooks/useLogoutMutation", () => ({
  useLogoutMutation: () => logout,
}));

describe("useAccountMenu", () => {
  it("derives the initials from the real user name", () => {
    me.data = { name: "Ana Pérez", pathRoles: [] };
    expect(renderHook(() => useAccountMenu()).result.current.initials).toBe("AP");
  });

  it("uses the SV fallback initials while /auth/me loads", () => {
    me.data = undefined;
    expect(renderHook(() => useAccountMenu()).result.current.initials).toBe("SV");
  });

  it("toggles the menu open state", () => {
    const { result } = renderHook(() => useAccountMenu());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
  });

  it("signOut runs the logout mutation", () => {
    const { result } = renderHook(() => useAccountMenu());
    act(() => result.current.signOut());
    expect(logout.mutate).toHaveBeenCalledTimes(1);
  });
});
