import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";

const user = vi.hoisted(() => ({
  name: "Ana",
  primaryPath: null as { slug: string; name: string } | null,
  apprenticePath: null as { slug: string; name: string } | null,
  academyRole: null as "NEWCOMER" | "MENTOR" | "APPRENTICE" | "ADMIN" | null,
  isAdmin: false,
  hasPathRoles: false,
}));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({
  useCurrentUser: () => user,
}));

const WANDERER = { slug: "wanderer", name: "Wanderer" };

describe("WelcomeBanner", () => {
  beforeEach(() => {
    Object.assign(user, {
      primaryPath: null,
      apprenticePath: null,
      academyRole: null,
      isAdmin: false,
      hasPathRoles: false,
    });
  });

  it("shows the waiting message to a newcomer without path roles", () => {
    Object.assign(user, { academyRole: "NEWCOMER" });
    render(<WelcomeBanner />);
    expect(
      screen.getByText(
        "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continuar plan" })).not.toBeInTheDocument();
  });

  it("shows the admin message and the users shortcut to an admin without apprentice path", () => {
    Object.assign(user, { academyRole: "ADMIN", isAdmin: true });
    render(<WelcomeBanner />);
    expect(screen.getByText("Administra usuarios y roles.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a usuarios" })).toHaveAttribute(
      "href",
      "/dashboard/admin/users",
    );
    expect(screen.queryByRole("link", { name: "Continuar plan" })).not.toBeInTheDocument();
  });

  it("names the apprentice path without the role", () => {
    Object.assign(user, { apprenticePath: WANDERER, academyRole: "APPRENTICE" });
    render(<WelcomeBanner />);
    const subtitle = screen.getByText(/Estás en el path/);
    expect(subtitle).toHaveTextContent("Estás en el path Wanderer.");
    expect(subtitle).not.toHaveTextContent(/como/);
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continuar plan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ir a usuarios" })).not.toBeInTheDocument();
  });

  it("shows the apprentice path, not the users shortcut, to an admin who is also an apprentice", () => {
    Object.assign(user, {
      apprenticePath: WANDERER,
      academyRole: "ADMIN",
      isAdmin: true,
    });
    render(<WelcomeBanner />);
    expect(screen.getByText(/Estás en el path/)).toHaveTextContent(
      "Estás en el path Wanderer.",
    );
    expect(screen.queryByText("Administra usuarios y roles.")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ir a usuarios" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continuar plan" })).not.toBeInTheDocument();
  });

  it("renders no subtitle paragraph for a mentor without apprentice path", () => {
    Object.assign(user, {
      primaryPath: { slug: "initiated", name: "Initiated" },
      academyRole: "MENTOR",
      hasPathRoles: true,
    });
    const { container } = render(<WelcomeBanner />);
    expect(screen.getByRole("heading", { name: /Hola, Ana/ })).toBeInTheDocument();
    expect(container.querySelector("p")).toBeNull();
    expect(screen.queryByText(/Estás en el path/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
