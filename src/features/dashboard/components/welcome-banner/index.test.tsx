import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";

const user = vi.hoisted(() => ({
  name: "Ana",
  primaryPath: null as { slug: string; name: string } | null,
  primaryRole: null as "MENTOR" | "APPRENTICE" | null,
  isAdmin: false,
  hasPathRoles: false,
}));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({
  useCurrentUser: () => user,
}));

describe("WelcomeBanner", () => {
  it("shows only the waiting message without roles", () => {
    Object.assign(user, {
      primaryPath: null,
      primaryRole: null,
      isAdmin: false,
    });
    render(<WelcomeBanner />);
    expect(
      screen.getByText(
        "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("sends an admin without roles to the users area", () => {
    Object.assign(user, {
      primaryPath: null,
      primaryRole: null,
      isAdmin: true,
    });
    render(<WelcomeBanner />);
    expect(
      screen.getByText("Administra usuarios y roles."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a usuarios" })).toHaveAttribute(
      "href",
      "/dashboard/admin/users",
    );
  });

  it.each([
    ["MENTOR", "Mentor"],
    ["APPRENTICE", "Aprendiz"],
  ] as const)("names the path and says 'como %s' for role %s", (role, label) => {
    Object.assign(user, {
      primaryPath: { slug: "initiated", name: "Initiated" },
      primaryRole: role,
      isAdmin: false,
    });
    render(<WelcomeBanner />);
    expect(screen.getByText("Initiated")).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(/Estás en el path/)).toHaveTextContent(
      `Estás en el path Initiated como ${label}.`,
    );
    expect(
      screen.getByRole("link", { name: "Continuar plan" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ir a usuarios" })).not.toBeInTheDocument();
  });

  it("shows the path, not the users shortcut, to an admin with roles", () => {
    Object.assign(user, {
      primaryPath: { slug: "initiated", name: "Initiated" },
      primaryRole: "MENTOR",
      isAdmin: true,
    });
    render(<WelcomeBanner />);
    expect(screen.getByText(/Estás en el path/)).toBeInTheDocument();
    expect(screen.queryByText("Administra usuarios y roles.")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ir a usuarios" })).not.toBeInTheDocument();
  });
});
