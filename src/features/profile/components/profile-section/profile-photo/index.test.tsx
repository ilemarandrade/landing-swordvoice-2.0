import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../../test/renderWithClient";
import { ProfilePhoto } from "@/features/profile/components/profile-section/profile-photo";

const mutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
vi.mock("@/features/profile/hooks/useChangePhotoMutation", () => ({
  useChangePhotoMutation: () => mutation,
}));

const base = {
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
const file = new File(["x"], "foto.png", { type: "image/png" });

describe("ProfilePhoto", () => {
  beforeEach(() => {
    mutation.mutate.mockReset();
    mutation.isPending = false;
  });

  it("offers to upload without a photo and to change with one, never to remove", () => {
    const { unmount } = renderWithClient(<ProfilePhoto profile={base} />);
    expect(
      screen.getByRole("button", { name: "Subir foto" }),
    ).toBeInTheDocument();
    unmount();
    renderWithClient(
      <ProfilePhoto
        profile={{ ...base, photoUrl: "https://media.swordvoice.com/p.png" }}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Cambiar foto" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Quitar/ })).not.toBeInTheDocument();
  });

  it("has no remove option: the photo section only has the upload/change button", () => {
    renderWithClient(
      <ProfilePhoto
        profile={{ ...base, photoUrl: "https://media.swordvoice.com/p.png" }}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("Cambiar foto");
  });

  it("opens the file picker when the photo button is clicked", async () => {
    renderWithClient(<ProfilePhoto profile={base} />);
    const input = screen.getByLabelText<HTMLInputElement>("Elegir foto de perfil");
    const clickSpy = vi.spyOn(input, "click");
    await userEvent.click(screen.getByRole("button", { name: "Subir foto" }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("uploads the chosen file and clears the input so the same file can be chosen again", async () => {
    mutation.mutate.mockImplementation(
      (_file: File, options: { onSettled: () => void }) => options.onSettled(),
    );
    renderWithClient(<ProfilePhoto profile={base} />);
    const input = screen.getByLabelText<HTMLInputElement>("Elegir foto de perfil");
    await userEvent.upload(input, file);
    expect(mutation.mutate).toHaveBeenCalledWith(file, expect.anything());
    await waitFor(() => expect(input.value).toBe(""));
    await userEvent.upload(input, file);
    expect(mutation.mutate).toHaveBeenCalledTimes(2);
  });

  it("disables the button and shows the overlay while uploading", () => {
    mutation.isPending = true;
    renderWithClient(<ProfilePhoto profile={base} />);
    expect(screen.getByRole("button", { name: "Subir foto" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Subiendo…");
  });
});
