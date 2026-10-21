import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RoleFilter } from "@/features/admin/components/users-admin/role-filter";

describe("RoleFilter", () => {
  it("renders the five options inside a labelled group", () => {
    render(<RoleFilter value={null} onChange={vi.fn()} />);
    const group = screen.getByRole("group", { name: "Filtrar por rol" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Todos", "Admin", "Mentor", "Aprendiz", "Nuevo"]);
  });

  it("marks 'Todos' as pressed when no role is selected", () => {
    render(<RoleFilter value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Mentor" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("marks only the current role as pressed", () => {
    render(<RoleFilter value="APPRENTICE" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Aprendiz" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    for (const name of ["Todos", "Admin", "Mentor", "Nuevo"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    }
  });

  it("calls onChange with the role when a different option is clicked", async () => {
    const onChange = vi.fn();
    render(<RoleFilter value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Nuevo" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("NEWCOMER");
  });

  it("calls onChange with null when 'Todos' is clicked", async () => {
    const onChange = vi.fn();
    render(<RoleFilter value="ADMIN" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not call onChange when the current option is clicked", async () => {
    const onChange = vi.fn();
    render(<RoleFilter value="MENTOR" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Mentor" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
