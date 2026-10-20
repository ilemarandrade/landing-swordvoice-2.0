import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";

const user = vi.hoisted(() => ({
  name: "Ana",
  primaryPath: null as { slug: string; name: string } | null,
  primaryRole: null as "MENTOR" | "APPRENTICE" | null,
  isAdmin: false,
  hasPathRoles: false,
}));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({ useCurrentUser: () => user }));
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

describe("DashboardSidebar", () => {
  beforeEach(() => {
    Object.assign(user, {
      primaryPath: null,
      primaryRole: null,
      isAdmin: false,
      hasPathRoles: false,
    });
  });

  it("hides Mi path and Usuarios for an account without roles", () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Mi path" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Usuarios" })).not.toBeInTheDocument();
  });

  it("shows Usuarios to an admin without path roles", () => {
    Object.assign(user, { isAdmin: true });
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: "Usuarios" })).toHaveAttribute(
      "href",
      "/dashboard/admin/users",
    );
    expect(screen.queryByRole("link", { name: "Mi path" })).not.toBeInTheDocument();
  });

  it("links Mi path to the primary path when there are roles", () => {
    Object.assign(user, {
      primaryPath: { slug: "wanderer", name: "Wanderer" },
      primaryRole: "APPRENTICE",
      hasPathRoles: true,
    });
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: "Mi path" })).toHaveAttribute(
      "href",
      "/dashboard/paths/wanderer",
    );
    expect(screen.queryByRole("link", { name: "Usuarios" })).not.toBeInTheDocument();
  });
});
