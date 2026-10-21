import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, MouseEvent } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type MobileMenuItem, MobileMenu } from "@/common/components/mobile-menu";

const LOGO = "Logo SV";

const items: MobileMenuItem[] = [
  { id: "inicio", label: "Inicio", href: "/", isActive: true },
  { id: "paths", label: "Paths", href: "/paths" },
  { id: "mentorias", label: "Mentorías" },
];

function renderMenu(props: Partial<ComponentProps<typeof MobileMenu>> = {}) {
  return render(<MobileMenu items={items} logo={<span>{LOGO}</span>} {...props} />);
}

describe("MobileMenu", () => {
  it("renders the logo and a closed toggle button without navigation", () => {
    renderMenu();
    expect(screen.getByText(LOGO)).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Principal" })).not.toBeInTheDocument();
  });

  it("opens on click and shows the items", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const toggle = screen.getByRole("button", { name: "Cerrar menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(nav).toContainElement(screen.getByRole("link", { name: "Inicio" }));
    expect(nav).toContainElement(screen.getByRole("link", { name: "Paths" }));
  });

  it("marks the active item with aria-current=page", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Paths" })).not.toHaveAttribute("aria-current");
  });

  it("renders an item without href as disabled, not as a link", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(screen.queryByRole("link", { name: "Mentorías" })).not.toBeInTheDocument();
    const disabled = screen.getByText("Mentorías").closest("[aria-disabled]");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Pronto")).toBeInTheDocument();
  });

  it("calls onNavigate with the href and closes the menu when a link is clicked", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    renderMenu({ onNavigate });
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await user.click(screen.getByRole("link", { name: "Paths" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(expect.anything(), "/paths");
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("navigation", { name: "Principal" })).not.toBeInTheDocument();
  });

  it("closes the open menu when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("navigation", { name: "Principal" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("shows the title when closed in compact mode", () => {
    renderMenu({ compact: true, title: "Academy" });
    expect(screen.getByText("Academy")).toBeInTheDocument();
  });

  it("does not show the title without compact mode", () => {
    renderMenu({ title: "Academy" });
    expect(screen.queryByText("Academy")).not.toBeInTheDocument();
  });

  it("renders the header only when the menu is open", async () => {
    const user = userEvent.setup();
    renderMenu({ header: <p>Hola Ana</p> });
    expect(screen.queryByText("Hola Ana")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByText("Hola Ana")).toBeInTheDocument();
  });

  it("passes close to a function footer and closes the menu when it is called", async () => {
    const user = userEvent.setup();
    const footer = vi.fn((close: () => void) => (
      <button type="button" onClick={close}>
        Cerrar desde footer
      </button>
    ));
    renderMenu({ footer });
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(footer).toHaveBeenCalledWith(expect.any(Function));
    await user.click(screen.getByRole("button", { name: "Cerrar desde footer" }));
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("applies the default background to the open overlay", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const overlay = screen.getByText(LOGO).closest<HTMLElement>("[style]");
    expect(overlay?.style.backgroundImage).toContain("/backgrounds/homeBackground.jpg");
  });

  it("applies a custom background to the open overlay", async () => {
    const user = userEvent.setup();
    renderMenu({ background: "/backgrounds/custom.jpg" });
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const overlay = screen.getByText(LOGO).closest<HTMLElement>("[style]");
    expect(overlay?.style.backgroundImage).toContain("/backgrounds/custom.jpg");
  });

  describe("body scroll lock", () => {
    afterEach(() => {
      document.body.style.overflow = "";
    });

    it("locks body scroll while open and restores it when closed", async () => {
      const user = userEvent.setup();
      renderMenu();
      expect(document.body.style.overflow).toBe("");

      await user.click(screen.getByRole("button", { name: "Abrir menú" }));
      expect(document.body.style.overflow).toBe("hidden");

      await user.click(screen.getByRole("button", { name: "Cerrar menú" }));
      expect(document.body.style.overflow).toBe("");
    });

    it("restores body scroll when a link closes the menu", async () => {
      const user = userEvent.setup();
      renderMenu({ onNavigate: (event) => event.preventDefault() });
      await user.click(screen.getByRole("button", { name: "Abrir menú" }));
      expect(document.body.style.overflow).toBe("hidden");

      await user.click(screen.getByRole("link", { name: "Paths" }));
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("scroll container", () => {
    const SCROLL_SELECTOR = ".overflow-y-auto";

    it("compact: keeps the toggle outside the scroll container", async () => {
      const user = userEvent.setup();
      renderMenu({ compact: true, header: <p>Hola Ana</p> });
      await user.click(screen.getByRole("button", { name: "Abrir menú" }));

      const toggle = screen.getByRole("button", { name: "Cerrar menú" });
      expect(toggle.closest(SCROLL_SELECTOR)).toBeNull();
    });

    it("compact: wraps header, nav and footer in the same scroll container", async () => {
      const user = userEvent.setup();
      renderMenu({
        compact: true,
        header: <p>Hola Ana</p>,
        footer: <span>Pie de menú</span>,
      });
      await user.click(screen.getByRole("button", { name: "Abrir menú" }));

      const scroller = screen.getByRole("navigation", { name: "Principal" }).closest(SCROLL_SELECTOR);
      expect(scroller).not.toBeNull();
      expect(scroller).toHaveClass("overflow-y-auto", "overscroll-contain");
      expect(screen.getByText("Hola Ana").closest(SCROLL_SELECTOR)).toBe(scroller);
      expect(screen.getByText("Pie de menú").closest(SCROLL_SELECTOR)).toBe(scroller);
    });

    it("non-compact: does not render a scroll container around header, nav or footer", async () => {
      const user = userEvent.setup();
      renderMenu({
        header: <p>Hola Ana</p>,
        footer: <span>Pie de menú</span>,
      });
      await user.click(screen.getByRole("button", { name: "Abrir menú" }));

      expect(screen.getByRole("navigation", { name: "Principal" }).closest(SCROLL_SELECTOR)).toBeNull();
      expect(screen.getByText("Hola Ana").closest(SCROLL_SELECTOR)).toBeNull();
      expect(screen.getByText("Pie de menú").closest(SCROLL_SELECTOR)).toBeNull();
      expect(screen.getByRole("button", { name: "Cerrar menú" }).closest(SCROLL_SELECTOR)).toBeNull();
    });
  });
});
