import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { FirstPathRedirect } from "@/features/paths/components/first-path-redirect";
import { getPaths } from "@/features/paths/services/pathsService";
import type { PathSummary } from "@/features/paths/schemas/path.schema";

const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/features/paths/services/pathsService", () => ({
  getPaths: vi.fn(),
  getPathDetail: vi.fn(),
}));

function pathSummary(slug: string): PathSummary {
  return {
    id: `id-${slug}`,
    name: `Path ${slug}`,
    slug,
    description: null,
    currentVersion: 1,
  };
}

function pathsPage(items: PathSummary[]) {
  return {
    items,
    meta: { page: 1, limit: 100, total: items.length, totalPages: 1 },
  };
}

describe("FirstPathRedirect", () => {
  beforeEach(() => {
    vi.mocked(getPaths).mockReset();
    router.replace.mockReset();
  });

  it("redirects to the first path when there are paths", async () => {
    vi.mocked(getPaths).mockResolvedValue(
      pathsPage([pathSummary("fundamentos"), pathSummary("avanzado")]),
    );

    renderWithClient(<FirstPathRedirect />);

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/paths/fundamentos"),
    );
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it("shows the empty message and does not redirect when there are no paths", async () => {
    vi.mocked(getPaths).mockResolvedValue(pathsPage([]));

    renderWithClient(<FirstPathRedirect />);

    expect(
      await screen.findByText("Aún no hay paths disponibles."),
    ).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("shows the error alert with a retry button when the request fails", async () => {
    vi.mocked(getPaths).mockRejectedValue(new ApiError(500, "x"));

    renderWithClient(<FirstPathRedirect />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos cargar los paths.",
    );
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("retries the request when the user presses Reintentar", async () => {
    vi.mocked(getPaths).mockRejectedValueOnce(new ApiError(500, "x"));
    vi.mocked(getPaths).mockResolvedValueOnce(
      pathsPage([pathSummary("fundamentos")]),
    );

    renderWithClient(<FirstPathRedirect />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Reintentar" }),
    );

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/paths/fundamentos"),
    );
    expect(getPaths).toHaveBeenCalledTimes(2);
  });
});
