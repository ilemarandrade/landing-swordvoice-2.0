import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

const initiated = { id: "p1", slug: "initiated", name: "Initiated" };
const wanderer = { id: "p2", slug: "wanderer", name: "Wanderer" };

describe("useCurrentUser", () => {
  it("returns empty values while /auth/me loads", () => {
    me.data = undefined;
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "",
      primaryPath: null,
      primaryRole: null,
      isAdmin: false,
      hasPathRoles: false,
    });
  });

  it("uses the first path role as the primary one", () => {
    me.data = {
      name: "Ana Pérez",
      role: "USER",
      pathRoles: [
        { path: initiated, role: "MENTOR" },
        { path: wanderer, role: "APPRENTICE" },
      ],
    };
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "Ana Pérez",
      primaryPath: { slug: "initiated", name: "Initiated" },
      primaryRole: "MENTOR",
      isAdmin: false,
      hasPathRoles: true,
    });
  });

  it("reports no roles and no admin for a plain account without path roles", () => {
    me.data = { name: "Ana", role: "USER", pathRoles: [] };
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "Ana",
      primaryPath: null,
      primaryRole: null,
      isAdmin: false,
      hasPathRoles: false,
    });
  });

  it("detects an admin without path roles", () => {
    me.data = { name: "Admin", role: "ADMIN", pathRoles: [] };
    expect(renderHook(() => useCurrentUser()).result.current).toMatchObject({
      isAdmin: true,
      hasPathRoles: false,
      primaryPath: null,
    });
  });
});
