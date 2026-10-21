import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { routes } from "@/common/constants/routes";
import { PathDetail } from "@/features/paths/components/path-detail";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

describe("PathDetail", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("shows a not-found alert with a link back to all paths on 404", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(404, "x"));

    renderWithClient(<PathDetail slug="no-existe" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Este path no existe.",
    );
    expect(
      screen.getByRole("link", { name: "Ver todos los paths" }),
    ).toHaveAttribute("href", routes.OUR_PATHS);
  });
});
