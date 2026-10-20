import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMyPathHref } from "@/features/dashboard/hooks/useMyPathHref";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

describe("useMyPathHref", () => {
  it("falls back to the first learning path while /auth/me loads", () => {
    me.data = undefined;
    expect(renderHook(() => useMyPathHref()).result.current).toEqual({
      myPathHref: "/dashboard/paths/initiated",
    });
  });

  it("links to the slug of the user's primary path", () => {
    me.data = {
      name: "Ana",
      pathRoles: [
        { path: { id: "p2", slug: "wanderer", name: "Wanderer" }, role: "APPRENTICE" },
      ],
    };
    expect(renderHook(() => useMyPathHref()).result.current).toEqual({
      myPathHref: "/dashboard/paths/wanderer",
    });
  });

  it("falls back to the first learning path when the user has no roles", () => {
    me.data = { name: "Ana", pathRoles: [] };
    expect(renderHook(() => useMyPathHref()).result.current.myPathHref).toBe(
      "/dashboard/paths/initiated",
    );
  });
});
