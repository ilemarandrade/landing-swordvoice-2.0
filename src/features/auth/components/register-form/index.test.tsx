import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { RegisterForm } from "@/features/auth/components/register-form";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const okResponse = { data: null } as Awaited<ReturnType<typeof apiClient.post>>;

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText("Nombre y Apellido"), "Ana Pérez");
  await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
  await userEvent.type(screen.getByLabelText("Contraseña"), "unaclavesegura");
  await userEvent.type(screen.getByLabelText("Confirmar contraseña"), "unaclavesegura");
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: "Registrarme" }));
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("has no path field", () => {
    renderWithClient(<RegisterForm />);
    expect(screen.queryByText(/path/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("shows the sent screen and resends to the same email", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(okResponse);
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    expect(await screen.findByRole("status")).toHaveTextContent("ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "¿NO LLEGÓ? REENVIAR" }));
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenLastCalledWith("/auth/email/verify/resend", {
        email: "ana@example.com",
      }),
    );
  });

  it("shows EMAIL_TAKEN under the email field with a recovery link and no resend", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(409, "x", "EMAIL_TAKEN"));
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    expect(await screen.findByText("Ya existe una cuenta con este correo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toHaveAttribute(
      "href",
      "/recuperar-contrasena",
    );
    expect(screen.queryByRole("button", { name: /REENVIAR/ })).not.toBeInTheDocument();
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("clears the EMAIL_TAKEN error once the email is edited", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(409, "x", "EMAIL_TAKEN"));
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    await screen.findByText("Ya existe una cuenta con este correo");
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "x");
    await waitFor(() =>
      expect(screen.queryByText("Ya existe una cuenta con este correo")).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("link", { name: "¿Olvidaste tu contraseña?" })).not.toBeInTheDocument();
  });

  it("keeps the sent screen and toasts when the resend hits 429", async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce(okResponse)
      .mockRejectedValueOnce(new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS"));
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    await userEvent.click(await screen.findByRole("button", { name: "¿NO LLEGÓ? REENVIAR" }));
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
    expect(screen.getByRole("status")).toHaveTextContent("ana@example.com");
  });
});
