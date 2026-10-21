import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/common/components/navbar";
import type { SessionStatus } from "@/common/hooks/useSession";

const session = vi.hoisted(() => ({ status: "unknown" as SessionStatus }));
vi.mock("@/common/hooks/useSession", () => ({
  useSession: () => ({ status: session.status }),
}));

const SECTION_ID = "services";
const SECTION_OFFSET_TOP = 500;
// useIsMobile arranca en false (jsdom: window.innerWidth = 1024) → offset de escritorio.
const DESKTOP_NAVBAR_OFFSET = 85;

function renderNavbar() {
  return render(<Navbar changeLogo={false} />);
}

function getMobileNav(): HTMLElement {
  return screen.getByRole("navigation", { name: "Principal" });
}

// Panel abierto del MobileMenu: contiene el botón de cerrar, el nav y el footer.
function getMobilePanel(): HTMLElement {
  const panel = screen.getByRole("button", { name: "Cerrar menú" }).parentElement;
  if (!panel) throw new Error("Panel del menú mobile no encontrado");
  return panel;
}

function addSection(id: string, offsetTop: number): HTMLElement {
  const section = document.createElement("section");
  section.id = id;
  // jsdom no calcula layout: offsetTop es 0 salvo que se fije.
  Object.defineProperty(section, "offsetTop", { value: offsetTop, configurable: true });
  document.body.appendChild(section);
  return section;
}

describe("Navbar", () => {
  beforeEach(() => {
    session.status = "anonymous";
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    // jsdom no implementa IntersectionObserver; framer-motion lo necesita para whileInView.
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      },
    );
  });

  afterEach(() => {
    document.getElementById(SECTION_ID)?.remove();
    vi.unstubAllGlobals();
  });

  it("shows the 'Ir al inicio' logo link", () => {
    renderNavbar();
    // El logo va en ambas ramas (escritorio y MobileMenu), así que hay dos enlaces.
    const logoLinks = screen.getAllByRole("link", { name: "Ir al inicio" });
    expect(logoLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of logoLinks) {
      expect(link).toHaveAttribute("href", "/");
    }
  });

  it("shows Home, the section links and the account CTA in the open mobile menu", async () => {
    renderNavbar();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    const nav = getMobileNav();
    expect(within(nav).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Servicios" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Conócenos" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Nuestro path" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Contáctanos" })).toBeInTheDocument();

    expect(within(getMobilePanel()).getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
      "href",
      "/iniciar-sesion",
    );
  });

  it("scrolls smoothly to the section and closes the menu when a mobile link has a matching section", async () => {
    addSection(SECTION_ID, SECTION_OFFSET_TOP);
    renderNavbar();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    await user.click(within(getMobileNav()).getByRole("link", { name: "Servicios" }));

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: SECTION_OFFSET_TOP - DESKTOP_NAVBAR_OFFSET,
      behavior: "smooth",
    });
    expect(screen.queryByRole("button", { name: "Cerrar menú" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("does not call window.scrollTo when the target section does not exist", async () => {
    renderNavbar();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));

    await user.click(within(getMobileNav()).getByRole("link", { name: "Servicios" }));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("closes the mobile menu when the account CTA is clicked", async () => {
    renderNavbar();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();

    await user.click(within(getMobilePanel()).getByRole("link", { name: "Iniciar sesión" }));

    expect(screen.queryByRole("button", { name: "Cerrar menú" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
