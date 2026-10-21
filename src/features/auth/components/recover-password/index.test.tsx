import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { RecoverPassword } from "@/features/auth/components/recover-password";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

describe("RecoverPassword", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("shows the neutral confirmation after the API accepts the request", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<RecoverPassword />);
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar enlace" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Si existe una cuenta con ese correo");
    await userEvent.click(screen.getByRole("button", { name: "¿NO LLEGÓ? REENVIAR" }));
    expect(screen.getByRole("button", { name: "Enviar enlace" })).toBeInTheDocument();
  });

  // Extra: isSent solo se activa con éxito; un fallo deja el formulario y avisa.
  it("keeps the form and notifies when the API rejects the request", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    renderWithClient(<RecoverPassword />);
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar enlace" }));
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar enlace" })).toBeInTheDocument();
  });

  // Extra: un correo inválido no llega a la API.
  it("does not call the API with an invalid email", async () => {
    renderWithClient(<RecoverPassword />);
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@");
    await userEvent.click(screen.getByRole("button", { name: "Enviar enlace" }));
    expect(await screen.findByText("Ingresa un correo electrónico válido")).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
