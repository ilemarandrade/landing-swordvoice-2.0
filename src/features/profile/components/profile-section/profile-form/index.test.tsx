import { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { ProfileForm } from "@/features/profile/components/profile-section/profile-form";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { patch: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const profile = {
  name: "Ana Pérez",
  photoUrl: null,
  bio: null,
  githubUrl: null,
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: null,
  professionalTitle: null,
  shortDescription: null,
};

const SAVE = "Guardar cambios";
const TAKEN = "Ese usuario de freeCodeCamp ya está vinculado a otra cuenta";

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
  });

  it("shows the email read-only and disables saving without changes", () => {
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: SAVE })).toBeDisabled();
  });

  it("keeps saving disabled when a change is reverted", async () => {
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    const bio = screen.getByLabelText("Bio");
    await userEvent.type(bio, "x");
    expect(screen.getByRole("button", { name: SAVE })).toBeEnabled();
    await userEvent.type(bio, "{backspace}");
    expect(screen.getByRole("button", { name: SAVE })).toBeDisabled();
  });

  it("shows mentor fields only for mentors", () => {
    const { unmount } = renderWithClient(
      <ProfileForm profile={profile} email="ana@example.com" isMentor={false} />,
    );
    expect(screen.queryByLabelText("Título profesional")).not.toBeInTheDocument();
    unmount();
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor />);
    expect(screen.getByLabelText("Título profesional")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción corta")).toBeInTheDocument();
  });

  it("shows the mentor hint on the mentor fields", () => {
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor />);
    expect(screen.getByLabelText("Título profesional")).toHaveAccessibleDescription(
      /Se muestra en la landing/,
    );
    expect(screen.getByLabelText("Descripción corta")).toHaveAccessibleDescription(
      /Se muestra en la landing/,
    );
  });

  it("sends only the bio when only the bio changes", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { ...profile, bio: "Aprendiendo React" },
    } as Awaited<ReturnType<typeof apiClient.patch>>);
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    await userEvent.type(screen.getByLabelText("Bio"), "Aprendiendo React");
    await userEvent.click(screen.getByRole("button", { name: SAVE }));
    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith("/profiles/me", { bio: "Aprendiendo React" }),
    );
    await waitFor(() => expect(screen.getByRole("button", { name: SAVE })).toBeDisabled());
  });

  it("invalidates auth/me when the name changes", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { ...profile, name: "Ana Gómez" },
    } as Awaited<ReturnType<typeof apiClient.patch>>);
    const invalidate = vi.spyOn(QueryClient.prototype, "invalidateQueries");
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    await userEvent.clear(screen.getByLabelText("Nombre"));
    await userEvent.type(screen.getByLabelText("Nombre"), "Ana Gómez");
    await userEvent.click(screen.getByRole("button", { name: SAVE }));
    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith("/profiles/me", { name: "Ana Gómez" }),
    );
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] }),
    );
  });

  it("shows the taken freeCodeCamp username under its field without a toast", async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new ApiError(409, "x", "FREECODECAMP_USERNAME_TAKEN"));
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    const field = screen.getByLabelText("Usuario de freeCodeCamp");
    await userEvent.type(field, "ana-dev");
    await userEvent.click(screen.getByRole("button", { name: SAVE }));
    expect(await screen.findByText(TAKEN)).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(TAKEN);
    expect(notifyError).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
