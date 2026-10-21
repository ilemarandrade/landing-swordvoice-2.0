import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { ResetPassword } from "@/features/auth/components/reset-password";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

async function submit(password: string, confirmPassword = password) {
  await userEvent.type(screen.getByLabelText("Contraseña nueva"), password);
  await userEvent.type(screen.getByLabelText("Confirmar contraseña"), confirmPassword);
  await userEvent.click(screen.getByRole("button", { name: "Guardar contraseña" }));
}

describe("ResetPassword", () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it("shows the expired state with a link to request another one when there is no token", () => {
    renderWithClient(<ResetPassword token={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    expect(screen.getByRole("link", { name: "Pedir otro enlace" })).toHaveAttribute(
      "href",
      "/recuperar-contrasena",
    );
  });

  it("saves the new password and goes to the login", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<ResetPassword token="t1" />);
    await submit("nuevaclave");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion"));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/reset", { token: "t1", password: "nuevaclave" });
  });

  it("blocks mismatched passwords without calling the API", async () => {
    renderWithClient(<ResetPassword token="t1" />);
    await submit("nuevaclave", "otraclave1");
    expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  // Añadido al plan: la contraseña nueva exige 8 caracteres mínimo (Global Constraints).
  it("blocks a password shorter than 8 characters without calling the API", async () => {
    renderWithClient(<ResetPassword token="t1" />);
    await submit("corta");
    expect(
      await screen.findByText("La contraseña debe tener al menos 8 caracteres"),
    ).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  // Añadido al plan: la contraseña no se recorta (Global Constraints: sin trim).
  it("sends the password untrimmed", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<ResetPassword token="t1" />);
    await submit("  nuevaclave  ");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion"));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/reset", {
      token: "t1",
      password: "  nuevaclave  ",
    });
  });

  it("switches to the expired state on INVALID_EMAIL_TOKEN", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(400, "x", "INVALID_EMAIL_TOKEN"));
    renderWithClient(<ResetPassword token="t1" />);
    await submit("nuevaclave");
    expect(await screen.findByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
  });
});
