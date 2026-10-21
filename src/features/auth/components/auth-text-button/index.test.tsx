import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthTextButton } from "@/features/auth/components/auth-text-button";

describe("AuthTextButton", () => {
  it("renders a button type with its label", () => {
    render(<AuthTextButton label="¿NO LLEGÓ? REENVIAR" onClick={() => {}} />);

    expect(screen.getByRole("button", { name: "¿NO LLEGÓ? REENVIAR" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<AuthTextButton label="REENVIAR" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "REENVIAR" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and ignores clicks while disabled", async () => {
    const onClick = vi.fn();
    render(<AuthTextButton label="REENVIAR" onClick={onClick} disabled />);

    const button = screen.getByRole("button", { name: "REENVIAR" });
    expect(button).toBeDisabled();
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
