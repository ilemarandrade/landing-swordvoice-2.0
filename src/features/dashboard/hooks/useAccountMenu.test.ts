import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
const logout = vi.hoisted(() => ({ mutate: vi.fn() }));
const profile = vi.hoisted(() => ({
  data: undefined as { photoUrl: string | null } | undefined,
}));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));
vi.mock("@/common/hooks/useProfileQuery", () => ({
  useProfileQuery: () => profile,
}));
vi.mock("@/features/dashboard/hooks/useLogoutMutation", () => ({
  useLogoutMutation: () => logout,
}));

describe("useAccountMenu", () => {
  it("exposes the real user name", () => {
    me.data = { name: "Ana Pérez", pathRoles: [] };
    expect(renderHook(() => useAccountMenu()).result.current.name).toBe("Ana Pérez");
  });

  it("exposes an empty name while /auth/me loads", () => {
    me.data = undefined;
    expect(renderHook(() => useAccountMenu()).result.current.name).toBe("");
  });

  it("exposes the profile photo, or null without one", () => {
    profile.data = { photoUrl: "https://media.swordvoice.com/p.png" };
    expect(renderHook(() => useAccountMenu()).result.current.photoUrl).toBe(
      "https://media.swordvoice.com/p.png",
    );
    profile.data = undefined;
    expect(renderHook(() => useAccountMenu()).result.current.photoUrl).toBeNull();
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
