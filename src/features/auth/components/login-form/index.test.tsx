import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { LoginForm } from "@/features/auth/components/login-form";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
  await userEvent.type(screen.getByLabelText("Contraseña"), "secreta");
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not show the remember-me checkbox", () => {
    renderWithClient(<LoginForm />);
    expect(screen.queryByLabelText("Mantener sesión iniciada")).not.toBeInTheDocument();
  });

  it("saves the session after a successful login", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await waitFor(() => expect(getTokens()).not.toBeNull());
  });

  it("notifies when the credentials are rejected", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new ApiError(401, "Credenciales inválidas", "INVALID_CREDENTIALS"),
    );
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
    expect(getTokens()).toBeNull();
  });
});
