import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthStatus } from "@/features/auth/components/auth-status";

describe("AuthStatus", () => {
  it("renders the title as a heading and the description in a status region", () => {
    render(
      <AuthStatus
        icon={<span>icono</span>}
        title="Revisa tu correo"
        description="Enviamos un enlace."
      />,
    );

    expect(screen.getByRole("heading", { name: "Revisa tu correo" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Enviamos un enlace.");
    expect(screen.getByText("icono")).toBeInTheDocument();
  });

  it("renders the children below the description", () => {
    render(
      <AuthStatus icon={null} title="Listo" description="Todo bien">
        <button type="button">Continuar</button>
      </AuthStatus>,
    );

    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });

  it("renders without children when none are given", () => {
    render(<AuthStatus icon={null} title="Listo" description="Todo bien" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
