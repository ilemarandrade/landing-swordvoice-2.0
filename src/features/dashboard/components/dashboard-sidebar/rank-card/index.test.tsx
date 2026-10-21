import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RankCard } from "@/features/dashboard/components/dashboard-sidebar/rank-card";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

describe("RankCard", () => {
  it("shows the name of the user's primary path", () => {
    me.data = {
      name: "Ana",
      pathRoles: [
        { path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" },
      ],
    };
    render(<RankCard />);

    expect(screen.getByText("Tu rango")).toBeInTheDocument();
    expect(screen.getByText("Initiated")).toBeInTheDocument();
    expect(screen.queryByText("Por definir")).not.toBeInTheDocument();
  });

  it("shows 'Por definir' when the user has no path roles", () => {
    me.data = { name: "Ana", pathRoles: [] };
    render(<RankCard />);

    expect(screen.getByText("Por definir")).toBeInTheDocument();
  });
});
