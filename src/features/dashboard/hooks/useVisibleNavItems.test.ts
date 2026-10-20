import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVisibleNavItems } from "@/features/dashboard/hooks/useVisibleNavItems";

const user = vi.hoisted(() => ({ isAdmin: false, hasPathRoles: false }));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({ useCurrentUser: () => user }));
vi.mock("@/features/dashboard/hooks/useMyPathHref", () => ({
  useMyPathHref: () => ({ myPathHref: "/dashboard/paths/initiated" }),
}));

function visibleItems() {
  return renderHook(() => useVisibleNavItems()).result.current.items;
}

function ids() {
  return visibleItems().map((item) => item.id);
}

describe("useVisibleNavItems", () => {
  it("hides Usuarios and Mi path for an account without roles", () => {
    Object.assign(user, { isAdmin: false, hasPathRoles: false });
    expect(ids()).not.toContain("usuarios");
    expect(ids()).not.toContain("path");
  });

  it("shows Mi path with the primary path href when there are roles", () => {
    Object.assign(user, { isAdmin: false, hasPathRoles: true });
    const path = visibleItems().find((item) => item.id === "path");
    expect(path?.href).toBe("/dashboard/paths/initiated");
  });

  it("shows Usuarios to admins", () => {
    Object.assign(user, { isAdmin: true, hasPathRoles: false });
    expect(ids()).toContain("usuarios");
    expect(ids()).not.toContain("path");
  });

  it("keeps Usuarios hidden for a regular user who has path roles", () => {
    Object.assign(user, { isAdmin: false, hasPathRoles: true });
    expect(ids()).not.toContain("usuarios");
    expect(ids()).toContain("path");
  });

  it("always keeps the entries that do not depend on the role", () => {
    Object.assign(user, { isAdmin: false, hasPathRoles: false });
    expect(ids()).toEqual(expect.arrayContaining(["inicio", "perfil"]));
  });
});
