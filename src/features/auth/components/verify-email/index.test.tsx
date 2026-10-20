import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { VerifyEmail } from "@/features/auth/components/verify-email";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const tokens = { data: { accessToken: "a", refreshToken: "r", expiresIn: 900 } } as Awaited<
  ReturnType<typeof apiClient.post>
>;

async function submitPassword(password: string) {
  const field = screen.getByLabelText("Contraseña");
  await userEvent.clear(field);
  await userEvent.type(field, password);
  await userEvent.click(screen.getByRole("button", { name: "Confirmar correo" }));
}

describe("VerifyEmail", () => {
  beforeEach(() => {
    localStorage.clear();
    router.replace.mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it("shows the expired state without a token and does not call the API", () => {
    renderWithClient(<VerifyEmail token={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("confirms the email and goes to the dashboard", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(tokens);
    renderWithClient(<VerifyEmail token="t1" />);
    await submitPassword("secreta");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/email/verify", { token: "t1", password: "secreta" });
    expect(getTokens()).not.toBeNull();
  });

  it("shows the wrong-password error and lets the person retry with the same link", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(401, "x", "INVALID_CREDENTIALS"))
      .mockResolvedValueOnce(tokens);
    renderWithClient(<VerifyEmail token="t1" />);
    await submitPassword("equivocada");
    expect(await screen.findByText("La contraseña no es la de tu cuenta")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toBeInTheDocument();
    await submitPassword("secreta");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("switches to the expired state on INVALID_EMAIL_TOKEN and resends", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(400, "x", "INVALID_EMAIL_TOKEN"))
      .mockResolvedValueOnce({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<VerifyEmail token="t1" />);
    await submitPassword("secreta");
    expect(await screen.findByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar enlace nuevo" }));
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenLastCalledWith("/auth/email/verify/resend", {
        email: "ana@example.com",
      }),
    );
  });
});
