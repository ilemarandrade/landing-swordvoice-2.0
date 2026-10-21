import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SessionGuard } from "@/common/components/session-guard";
import type { GuardStatus } from "@/common/hooks/useSessionGuard";

const guard = vi.hoisted(() => ({ status: "ready" as GuardStatus, retry: vi.fn() }));
vi.mock("@/common/hooks/useSessionGuard", () => ({ useSessionGuard: () => guard }));

describe("SessionGuard", () => {
  it("renders the children when ready", () => {
    guard.status = "ready";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  it("hides the children while loading", () => {
    guard.status = "loading";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    expect(screen.queryByText("contenido")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Cargando…");
  });

  it("hides the children while redirecting", () => {
    guard.status = "redirecting";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    expect(screen.queryByText("contenido")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Cargando…");
  });

  it("shows a retry button on error", async () => {
    guard.status = "error";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(guard.retry).toHaveBeenCalled();
  });

  it("announces the session error with role alert and hides the children", () => {
    guard.status = "error";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar tu sesión.");
    expect(screen.queryByText("contenido")).not.toBeInTheDocument();
  });
});
