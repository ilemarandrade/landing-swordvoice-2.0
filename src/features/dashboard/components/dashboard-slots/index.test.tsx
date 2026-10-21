import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardSlots } from "@/features/dashboard/components/dashboard-slots";

const user = vi.hoisted(() => ({ hasPathRoles: false }));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({ useCurrentUser: () => user }));

describe("DashboardSlots", () => {
  it("renders nothing without path roles", () => {
    user.hasPathRoles = false;
    expect(render(<DashboardSlots />).container).toBeEmptyDOMElement();
  });

  it("renders the slots with path roles", () => {
    user.hasPathRoles = true;
    const { container } = render(<DashboardSlots />);
    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByRole("heading", { name: "Progreso del path" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Tareas de la semana/ })).toBeInTheDocument();
  });
});
