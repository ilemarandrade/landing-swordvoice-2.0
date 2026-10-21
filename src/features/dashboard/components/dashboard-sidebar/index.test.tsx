import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";

const user = vi.hoisted(() => ({
  name: "Ana",
  primaryPath: null as { slug: string; name: string } | null,
  isAdmin: false,
  hasPathRoles: false,
}));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({ useCurrentUser: () => user }));
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

describe("DashboardSidebar", () => {
  beforeEach(() => {
    Object.assign(user, {
      primaryPath: null,
      isAdmin: false,
      hasPathRoles: false,
    });
  });

  it("hides Paths and Usuarios for an account without roles", () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Paths" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Usuarios" })).not.toBeInTheDocument();
  });

  it("shows Usuarios to an admin without path roles", () => {
    Object.assign(user, { isAdmin: true });
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute(
      "href",
      "/dashboard/admin/users",
    );
    expect(screen.queryByRole("link", { name: "Paths" })).not.toBeInTheDocument();
  });

  it("links Paths to the primary path when there are roles", () => {
    Object.assign(user, {
      primaryPath: { slug: "wanderer", name: "Wanderer" },
      hasPathRoles: true,
    });
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: "Paths" })).toHaveAttribute(
      "href",
      "/dashboard/paths/wanderer",
    );
    expect(screen.queryByRole("link", { name: "Usuarios" })).not.toBeInTheDocument();
  });
});
