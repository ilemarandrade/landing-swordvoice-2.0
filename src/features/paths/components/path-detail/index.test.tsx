import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { routes } from "@/common/constants/routes";
import { PathDetail } from "@/features/paths/components/path-detail";
import { getPathDetail } from "@/features/paths/services/pathsService";

vi.mock("@/features/paths/services/pathsService", () => ({
  getPaths: vi.fn(),
  getPathDetail: vi.fn(),
}));

describe("PathDetail", () => {
  beforeEach(() => {
    vi.mocked(getPathDetail).mockReset();
  });

  it("shows a not-found alert with a link back to all paths on 404", async () => {
    vi.mocked(getPathDetail).mockRejectedValue(new ApiError(404, "x"));

    renderWithClient(<PathDetail slug="no-existe" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Este path no existe.",
    );
    expect(
      screen.getByRole("link", { name: "Ver todos los paths" }),
    ).toHaveAttribute("href", routes.OUR_PATHS);
  });
});
