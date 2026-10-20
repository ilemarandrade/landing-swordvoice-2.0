import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import toast from "react-hot-toast";
import { notifyError } from "@/common/errors/notifyError";
import { LoginForm } from "@/features/auth/components/login-form";
import { authMessages } from "@/features/auth/constants/authMessages";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

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

  it("shows the unverified notice and resends to the typed email", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"))
      .mockResolvedValueOnce({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent("ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "REENVIAR CORREO" }));
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenLastCalledWith("/auth/email/verify/resend", {
        email: "ana@example.com",
      }),
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("hides the notice when the next attempt fails for another reason", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"))
      .mockRejectedValueOnce(new ApiError(401, "x", "INVALID_CREDENTIALS"));
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("does not show the notice for other login errors", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new ApiError(401, "Credenciales inválidas", "INVALID_CREDENTIALS"),
    );
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("toasts the success message after resending", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"))
      .mockResolvedValueOnce({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await userEvent.click(await screen.findByRole("button", { name: "REENVIAR CORREO" }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(authMessages.VERIFICATION_RESENT),
    );
  });

  it("keeps the notice and toasts the API message when the resend is rate limited", async () => {
    const rateLimited = new ApiError(429, "Demasiados intentos, espera un minuto", "RATE_LIMITED");
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"))
      .mockRejectedValueOnce(rateLimited);
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await userEvent.click(await screen.findByRole("button", { name: "REENVIAR CORREO" }));
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(rateLimited);
    expect(screen.getByRole("alert")).toHaveTextContent("ana@example.com");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("disables the resend button while the email is being sent", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"))
      .mockReturnValueOnce(new Promise<Awaited<ReturnType<typeof apiClient.post>>>(() => {}));
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    const resend = await screen.findByRole("button", { name: "REENVIAR CORREO" });
    await userEvent.click(resend);
    await waitFor(() => expect(resend).toBeDisabled());
  });
});
