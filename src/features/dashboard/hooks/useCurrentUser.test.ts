import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

describe("useCurrentUser", () => {
  it("returns empty values while /auth/me loads", () => {
    me.data = undefined;
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "",
      primaryPath: null,
    });
  });

  it("uses the first path role as the primary path", () => {
    me.data = {
      name: "Ana Pérez",
      pathRoles: [
        { path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" },
        { path: { id: "p2", slug: "wanderer", name: "Wanderer" }, role: "APPRENTICE" },
      ],
    };
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "Ana Pérez",
      primaryPath: { slug: "initiated", name: "Initiated" },
    });
  });

  it("has no primary path for an account without roles", () => {
    me.data = { name: "Ana Pérez", pathRoles: [] };
    expect(renderHook(() => useCurrentUser()).result.current.primaryPath).toBeNull();
  });
});
