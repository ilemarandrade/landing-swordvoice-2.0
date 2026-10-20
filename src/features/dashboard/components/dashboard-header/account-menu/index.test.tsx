import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountMenu } from "@/features/dashboard/components/dashboard-header/account-menu";

const menu = vi.hoisted(() => ({
  isOpen: true,
  toggle: vi.fn(),
  name: "Ana Pérez",
  photoUrl: null as string | null,
  signOut: vi.fn(),
}));
vi.mock("@/features/dashboard/hooks/useAccountMenu", () => ({ useAccountMenu: () => menu }));

describe("AccountMenu", () => {
  beforeEach(() => {
    menu.isOpen = true;
    menu.photoUrl = null;
    menu.toggle.mockClear();
    menu.signOut.mockClear();
  });

  it("shows the initials without a photo and the photo when there is one", () => {
    const { unmount } = render(<AccountMenu />);
    expect(screen.getByText("AP")).toBeInTheDocument();
    unmount();
    menu.photoUrl = "https://media.swordvoice.com/p.png";
    render(<AccountMenu />);
    expect(screen.getByRole("img", { name: "Foto de Ana Pérez" })).toBeInTheDocument();
  });

  it("links to the profile and signs out", async () => {
    render(<AccountMenu />);
    expect(screen.getByRole("link", { name: "Mi perfil" })).toHaveAttribute("href", "/dashboard/profile");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(menu.signOut).toHaveBeenCalled();
  });

  it("toggles the menu from the avatar button and reflects its state in aria-expanded", async () => {
    menu.isOpen = false;
    const { unmount } = render(<AccountMenu />);
    const trigger = screen.getByRole("button", { name: "Mi cuenta" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(menu.toggle).toHaveBeenCalledTimes(1);
    unmount();

    menu.isOpen = true;
    render(<AccountMenu />);
    expect(screen.getByRole("button", { name: "Mi cuenta" })).toHaveAttribute("aria-expanded", "true");
  });

  it("hides the links while the menu is closed", () => {
    menu.isOpen = false;
    render(<AccountMenu />);
    expect(screen.queryByRole("link", { name: "Mi perfil" })).not.toBeInTheDocument();
  });
});
