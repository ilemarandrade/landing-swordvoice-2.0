import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RankRow } from "@/features/dashboard/components/dashboard-mobile-menu/account-block/rank-row";

const currentUser = vi.hoisted(() => ({
  primaryPath: null as { slug: string; name: string } | null,
}));
const myPath = vi.hoisted(() => ({ myPathHref: "/dashboard/paths/initiated" }));

vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({
  useCurrentUser: () => currentUser,
}));
vi.mock("@/features/dashboard/hooks/useMyPathHref", () => ({
  useMyPathHref: () => myPath,
}));

describe("RankRow", () => {
  beforeEach(() => {
    currentUser.primaryPath = null;
  });

  it("muestra el nombre del path principal como enlace a su página", () => {
    currentUser.primaryPath = { slug: "initiated", name: "Iniciado" };
    render(<RankRow onNavigate={vi.fn()} />);

    expect(screen.getByText("Rango")).toBeInTheDocument();
    expect(screen.getByText("Iniciado")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/dashboard/paths/initiated",
    );
  });

  it("sin path principal muestra 'Por definir' y no hay enlace", () => {
    render(<RankRow onNavigate={vi.fn()} />);

    expect(screen.getByText("Rango")).toBeInTheDocument();
    expect(screen.getByText("Por definir")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("al pulsar el enlace del rango llama a onNavigate", async () => {
    currentUser.primaryPath = { slug: "initiated", name: "Iniciado" };
    const onNavigate = vi.fn();
    const events = userEvent.setup();
    render(<RankRow onNavigate={onNavigate} />);

    await events.click(screen.getByRole("link"));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
