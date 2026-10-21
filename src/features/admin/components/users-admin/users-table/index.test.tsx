import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/common/api/auth.schema";
import { UsersTable } from "@/features/admin/components/users-admin/users-table";
import { adminMessages } from "@/features/admin/constants/adminMessages";

const initiated = { id: "p1", slug: "initiated", name: "Initiated" };

const admin: User = {
  id: "u1",
  email: "admin@example.com",
  name: "Ada Admin",
  academyRole: "ADMIN",
  emailVerified: true,
  pathRoles: [],
};

const mentor: User = {
  id: "u2",
  email: "ana@example.com",
  name: "Ana Pérez",
  academyRole: "MENTOR",
  emailVerified: false,
  pathRoles: [{ path: initiated, role: "MENTOR" }],
};

function roleCellOf(name: string) {
  const row = screen.getByRole("button", { name: `Ver ${name}` }).closest("tr");
  if (!row) throw new Error(`no row for ${name}`);
  return within(row).getAllByRole("cell")[1];
}

describe("UsersTable", () => {
  it("shows a 'Rol' column header next to the name, and 'Paths' for path roles", () => {
    render(
      <UsersTable users={[admin]} search="" hasRoleFilter={false} onOpen={vi.fn()} />,
    );
    const headers = screen.getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers.slice(0, 3)).toEqual(["Nombre", "Rol", "Correo"]);
    expect(headers).toContain("Paths");
    expect(headers).not.toContain("Roles");
  });

  it("shows the academyRole label in the Rol column for each user", () => {
    render(
      <UsersTable
        users={[admin, mentor]}
        search=""
        hasRoleFilter={false}
        onOpen={vi.fn()}
      />,
    );
    expect(roleCellOf("Ada Admin")).toHaveTextContent(/^Admin$/);
    expect(roleCellOf("Ana Pérez")).toHaveTextContent(/^Mentor$/);
  });

  it("keeps the path role chips separate from the Rol column", () => {
    render(
      <UsersTable users={[mentor]} search="" hasRoleFilter={false} onOpen={vi.fn()} />,
    );
    expect(screen.getByText("Initiated · Mentor")).toBeInTheDocument();
    expect(roleCellOf("Ana Pérez")).toHaveTextContent(/^Mentor$/);
  });

  it("shows the empty message when there are no users", () => {
    render(
      <UsersTable users={[]} search="" hasRoleFilter={false} onOpen={vi.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(adminMessages.NO_USERS);
    expect(screen.queryByRole("columnheader", { name: "Rol" })).not.toBeInTheDocument();
  });

  it("shows the role-filter message when a role filter has no results", () => {
    render(
      <UsersTable users={[]} search="" hasRoleFilter onOpen={vi.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "No hay usuarios que coincidan con los filtros.",
    );
  });

  it("prefers the search message over the role-filter message", () => {
    render(
      <UsersTable users={[]} search="zzz" hasRoleFilter onOpen={vi.fn()} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "No encontramos usuarios con «zzz»",
    );
    expect(
      screen.queryByText("No hay usuarios que coincidan con los filtros."),
    ).not.toBeInTheDocument();
  });
});
