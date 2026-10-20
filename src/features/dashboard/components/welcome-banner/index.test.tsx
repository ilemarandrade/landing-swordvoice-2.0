import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

describe("WelcomeBanner", () => {
  it("greets the user by their real name and mentions the primary path", () => {
    me.data = {
      name: "Ana Pérez",
      pathRoles: [
        { path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" },
      ],
    };
    render(<WelcomeBanner />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Hola, Ana Pérez" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Initiated")).toBeInTheDocument();
    expect(
      screen.queryByText("Pronto te asignaremos un path y un mentor."),
    ).not.toBeInTheDocument();
  });

  it("asks to wait for a path when the user has no roles", () => {
    me.data = { name: "Ana Pérez", pathRoles: [] };
    render(<WelcomeBanner />);

    expect(
      screen.getByText("Pronto te asignaremos un path y un mentor."),
    ).toBeInTheDocument();
  });
});
