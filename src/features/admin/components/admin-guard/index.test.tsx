import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminGuard } from "@/features/admin/components/admin-guard";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

describe("AdminGuard", () => {
  beforeEach(() => {
    router.replace.mockReset();
  });

  it("renders nothing and does not redirect while /auth/me loads", () => {
    me.data = undefined;
    render(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.queryByText("zona admin")).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("sends a USER back to the dashboard", () => {
    me.data = { academyRole: "NEWCOMER" };
    render(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.queryByText("zona admin")).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("renders the area for an ADMIN", () => {
    me.data = { academyRole: "ADMIN" };
    render(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.getByText("zona admin")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("removes the area and redirects when the admin role is revoked after loading", () => {
    me.data = { academyRole: "ADMIN" };
    const { rerender } = render(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.getByText("zona admin")).toBeInTheDocument();

    // /auth/me se recarga tras un 403 y ya no trae el rol ADMIN.
    me.data = { academyRole: "NEWCOMER" };
    rerender(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.queryByText("zona admin")).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });
});
