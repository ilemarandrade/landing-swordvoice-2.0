import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountLink } from "@/common/components/navbar/account-link";
import type { SessionStatus } from "@/common/hooks/useSession";

const session = vi.hoisted(() => ({ status: "unknown" as SessionStatus }));
vi.mock("@/common/hooks/useSession", () => ({
  useSession: () => ({ status: session.status }),
}));

describe("AccountLink", () => {
  beforeEach(() => {
    session.status = "unknown";
  });

  it("renders nothing while the session is unknown", () => {
    session.status = "unknown";
    const { container } = render(<AccountLink />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("links anonymous users to the login page", () => {
    session.status = "anonymous";
    render(<AccountLink />);
    const link = screen.getByRole("link", { name: "Iniciar sesión" });
    expect(link).toHaveAttribute("href", "/iniciar-sesion");
    expect(screen.queryByRole("link", { name: "Ir a mi cuenta" })).not.toBeInTheDocument();
  });

  it("links authenticated users to their dashboard", () => {
    session.status = "authenticated";
    render(<AccountLink />);
    const link = screen.getByRole("link", { name: "Ir a mi cuenta" });
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("link", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  });

  it("calls onNavigate when an anonymous user clicks the link", async () => {
    session.status = "anonymous";
    const onNavigate = vi.fn();
    render(<AccountLink onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("link", { name: "Iniciar sesión" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("calls onNavigate when an authenticated user clicks the link", async () => {
    session.status = "authenticated";
    const onNavigate = vi.fn();
    render(<AccountLink onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("link", { name: "Ir a mi cuenta" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("does not fail on click when onNavigate is omitted", async () => {
    session.status = "anonymous";
    render(<AccountLink />);
    const link = screen.getByRole("link", { name: "Iniciar sesión" });
    await userEvent.click(link);
    expect(link).toBeInTheDocument();
  });

  it("appends the className prop to the link", () => {
    session.status = "anonymous";
    render(<AccountLink className="w-full" />);
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveClass("w-full");
  });
});
