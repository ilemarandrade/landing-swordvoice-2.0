import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountBlock } from "@/features/dashboard/components/dashboard-mobile-menu/account-block";

const menu = vi.hoisted(() => ({
  name: "Ana Pérez",
  roleLabel: null as string | null,
  photoUrl: null as string | null,
}));
vi.mock("@/features/dashboard/hooks/useAccountMenu", () => ({
  useAccountMenu: () => menu,
}));

const currentUser = vi.hoisted(() => ({
  primaryPath: null as { slug: string; name: string } | null,
}));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({
  useCurrentUser: () => currentUser,
}));
vi.mock("@/features/dashboard/hooks/useMyPathHref", () => ({
  useMyPathHref: () => ({ myPathHref: "/dashboard/paths/initiated" }),
}));

describe("AccountBlock", () => {
  beforeEach(() => {
    menu.name = "Ana Pérez";
    menu.roleLabel = null;
    menu.photoUrl = null;
    currentUser.primaryPath = null;
  });

  it("muestra el nombre y un enlace 'Ver perfil' a /dashboard/profile", () => {
    render(<AccountBlock onNavigate={vi.fn()} />);
    const region = screen.getByRole("region", { name: "Tu cuenta" });

    expect(within(region).getByText("Ana Pérez")).toBeInTheDocument();
    expect(
      within(region).getByRole("link", { name: /ver perfil/i }),
    ).toHaveAttribute("href", "/dashboard/profile");
  });

  it("muestra el badge de rol cuando roleLabel existe", () => {
    menu.roleLabel = "Mentor";
    render(<AccountBlock onNavigate={vi.fn()} />);

    expect(screen.getByText("Mentor")).toBeInTheDocument();
  });

  it("no muestra badge cuando roleLabel es null", () => {
    render(<AccountBlock onNavigate={vi.fn()} />);

    expect(
      screen.queryByText(/^(Admin|Mentor|Aprendiz|Nuevo)$/),
    ).not.toBeInTheDocument();
  });

  it("muestra la foto con su alt cuando hay photoUrl", () => {
    menu.photoUrl = "/fotos/ana.jpg";
    render(<AccountBlock onNavigate={vi.fn()} />);

    expect(
      screen.getByRole("img", { name: "Foto de Ana Pérez" }),
    ).toBeInTheDocument();
  });

  it("al pulsar 'Ver perfil' llama a onNavigate", async () => {
    const onNavigate = vi.fn();
    const events = userEvent.setup();
    render(<AccountBlock onNavigate={onNavigate} />);

    await events.click(screen.getByRole("link", { name: /ver perfil/i }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
