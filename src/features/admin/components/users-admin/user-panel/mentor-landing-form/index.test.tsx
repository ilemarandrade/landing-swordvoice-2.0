import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { MentorLandingForm } from "@/features/admin/components/users-admin/user-panel/mentor-landing-form";
import { adminMessages } from "@/features/admin/constants/adminMessages";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn(), patch: vi.fn() },
}));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const landing = { userId: "u1", showOnLanding: true, landingOrder: 3 };
const ok = (data: unknown) =>
  ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

function positionInput() {
  return screen.getByRole("spinbutton", { name: "Posición" });
}

function saveButton() {
  return screen.getByRole("button", { name: "Guardar" });
}

describe("MentorLandingForm", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.patch).mockReset();
  });

  it("shows the saved landing settings with Guardar disabled", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(landing));
    renderWithClient(<MentorLandingForm userId="u1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando…");
    expect(
      screen.getByRole("heading", { level: 3, name: "Landing" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("checkbox", { name: "Mostrar en la landing" }),
    ).toBeChecked();
    expect(positionInput()).toHaveValue(3);
    expect(saveButton()).toBeDisabled();
    expect(apiClient.get).toHaveBeenCalledWith("/mentors/u1/landing");
  });

  it("enables Guardar only while there are unsaved changes", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(landing));
    renderWithClient(<MentorLandingForm userId="u1" />);
    const checkbox = await screen.findByRole("checkbox", {
      name: "Mostrar en la landing",
    });

    await userEvent.click(checkbox);
    expect(saveButton()).toBeEnabled();

    await userEvent.click(checkbox);
    expect(saveButton()).toBeDisabled();
  });

  it("saves an emptied Posición as landingOrder null", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(landing));
    vi.mocked(apiClient.patch).mockResolvedValue(
      ok({ ...landing, landingOrder: null }),
    );
    renderWithClient(<MentorLandingForm userId="u1" />);
    await screen.findByRole("spinbutton", { name: "Posición" });

    await userEvent.clear(positionInput());
    await userEvent.click(saveButton());

    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith("/mentors/u1/landing", {
        showOnLanding: true,
        landingOrder: null,
      }),
    );
    // Tras guardar, lo guardado es el nuevo punto de partida: no quedan cambios.
    await waitFor(() => expect(saveButton()).toBeDisabled());
    expect(positionInput()).toHaveValue(null);
  });

  it("shows LANDING_ORDER_TAKEN under the Posición field", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(landing));
    vi.mocked(apiClient.patch).mockRejectedValue(
      new ApiError(409, "x", "LANDING_ORDER_TAKEN"),
    );
    renderWithClient(<MentorLandingForm userId="u1" />);
    await screen.findByRole("spinbutton", { name: "Posición" });

    await userEvent.clear(positionInput());
    await userEvent.type(positionInput(), "7");
    await userEvent.click(saveButton());

    expect(
      await screen.findByText(adminMessages.LANDING_ORDER_TAKEN),
    ).toBeInTheDocument();
    expect(positionInput()).toHaveAttribute("aria-invalid", "true");
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("shows LANDING_LOAD_FAILED and retries the request on Reintentar", async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(new ApiError(500, "x"))
      .mockResolvedValueOnce(ok(landing));
    renderWithClient(<MentorLandingForm userId="u1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      adminMessages.LANDING_LOAD_FAILED,
    );

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(
      await screen.findByRole("checkbox", { name: "Mostrar en la landing" }),
    ).toBeChecked();
    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(apiClient.get).toHaveBeenLastCalledWith("/mentors/u1/landing");
  });
});
