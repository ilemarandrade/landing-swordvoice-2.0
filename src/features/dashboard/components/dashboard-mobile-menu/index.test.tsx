import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardMobileMenu } from "@/features/dashboard/components/dashboard-mobile-menu";

type NavItem = { id: string; label: string; href?: string };

const nav = vi.hoisted(() => ({
  items: [] as NavItem[],
  activeItem: { id: "", label: "" } as NavItem,
}));
vi.mock("@/features/dashboard/hooks/useVisibleNavItems", () => ({
  useVisibleNavItems: () => ({ items: nav.items }),
}));
vi.mock("@/features/dashboard/hooks/useActiveNavItem", () => ({
  useActiveNavItem: () => ({ activeItem: nav.activeItem }),
}));

const menu = vi.hoisted(() => ({
  name: "Ana Pérez",
  roleLabel: "Mentor" as string | null,
  photoUrl: null as string | null,
  signOut: vi.fn(),
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

function openMenu(events: ReturnType<typeof userEvent.setup>) {
  return events.click(screen.getByRole("button", { name: "Abrir menú" }));
}

describe("DashboardMobileMenu", () => {
  beforeEach(() => {
    nav.items = [
      { id: "inicio", label: "Inicio", href: "/dashboard" },
      { id: "path", label: "Paths", href: "/dashboard/paths" },
      { id: "mentor", label: "Mi mentor" },
    ];
    nav.activeItem = nav.items[1];
    menu.roleLabel = "Mentor";
    menu.photoUrl = null;
    currentUser.primaryPath = null;
  });

  it("cerrado muestra el título de la sección activa", () => {
    render(<DashboardMobileMenu />);

    expect(screen.getByText("Paths")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Principal" }),
    ).not.toBeInTheDocument();
  });

  it("abierto muestra los items visibles y marca el activo con aria-current", async () => {
    const events = userEvent.setup();
    render(<DashboardMobileMenu />);
    await openMenu(events);

    const mainNav = screen.getByRole("navigation", { name: "Principal" });
    expect(within(mainNav).getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: "Paths" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(mainNav).getByRole("link", { name: "Inicio" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("un item sin href muestra 'Pronto' y no es un enlace", async () => {
    const events = userEvent.setup();
    render(<DashboardMobileMenu />);
    await openMenu(events);

    expect(
      screen.queryByRole("link", { name: /Mi mentor/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Mi mentor").closest("[aria-disabled]")).toHaveTextContent(
      "Pronto",
    );
  });

  it("abierto muestra la sección 'Tu cuenta' con nombre, badge y enlace a perfil", async () => {
    const events = userEvent.setup();
    render(<DashboardMobileMenu />);
    await openMenu(events);

    const region = screen.getByRole("region", { name: "Tu cuenta" });
    expect(within(region).getByText("Ana Pérez")).toBeInTheDocument();
    expect(within(region).getByText("Mentor")).toBeInTheDocument();
    expect(
      within(region).getByRole("link", { name: /ver perfil/i }),
    ).toHaveAttribute("href", "/dashboard/profile");
  });

  it("sin roleLabel no muestra badge de rol", async () => {
    menu.roleLabel = null;
    const events = userEvent.setup();
    render(<DashboardMobileMenu />);
    await openMenu(events);

    const region = screen.getByRole("region", { name: "Tu cuenta" });
    expect(within(region).getByText("Ana Pérez")).toBeInTheDocument();
    expect(within(region).queryByText("Mentor")).not.toBeInTheDocument();
  });

  it("al pulsar 'Cerrar sesión' llama a signOut y cierra el menú", async () => {
    const events = userEvent.setup();
    render(<DashboardMobileMenu />);
    await openMenu(events);

    await events.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(menu.signOut).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("navigation", { name: "Principal" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toBeInTheDocument();
    expect(screen.getByText("Paths")).toBeInTheDocument();
  });

  it("al pulsar el enlace de perfil cierra el menú", async () => {
    const events = userEvent.setup();
    render(<DashboardMobileMenu />);
    await openMenu(events);

    await events.click(screen.getByRole("link", { name: /ver perfil/i }));

    expect(
      screen.queryByRole("navigation", { name: "Principal" }),
    ).not.toBeInTheDocument();
    expect(menu.signOut).not.toHaveBeenCalled();
  });
});
