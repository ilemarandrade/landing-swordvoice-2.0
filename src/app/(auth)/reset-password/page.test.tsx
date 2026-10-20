import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../test/renderWithClient";
import { apiClient } from "@/common/api/apiClient";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import ResetPasswordRoute, { metadata } from "./page";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

async function renderRoute(token: string | string[] | undefined) {
  const element = await ResetPasswordRoute({
    searchParams: Promise.resolve({ token }),
  });
  return renderWithClient(element);
}

describe("/reset-password page", () => {
  beforeEach(() => {
    localStorage.clear();
    router.push.mockReset();
    router.replace.mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it("exposes noindex and no-referrer metadata", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe("no-referrer");
  });

  // Review Focus 4: un token vacío, ausente o repetido es un enlace vencido, sin llamar a la API.
  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["duplicated", ["a", "b"]],
  ])("shows the expired state for a %s token without calling the API", async (_label, token) => {
    await renderRoute(token);
    expect(screen.getByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    expect(screen.queryByLabelText("Contraseña nueva")).not.toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("shows the password form for a single token", async () => {
    await renderRoute("abc");
    expect(screen.getByLabelText("Contraseña nueva")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  // Review Focus 1: con sesión abierta el enlace no redirige; el formulario se muestra igual.
  it("does not redirect a user who already has a session", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    await renderRoute("abc");
    expect(screen.getByLabelText("Contraseña nueva")).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
    expect(getTokens()).not.toBeNull();
  });

  // Review Focus 1: al guardar, la sesión local se borra y el usuario va al login.
  it("clears the local session on success and goes to the login", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    await renderRoute("abc");
    await userEvent.type(screen.getByLabelText("Contraseña nueva"), "nuevaclave");
    await userEvent.type(screen.getByLabelText("Confirmar contraseña"), "nuevaclave");
    await userEvent.click(screen.getByRole("button", { name: "Guardar contraseña" }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion"));
    expect(getTokens()).toBeNull();
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/reset", {
      token: "abc",
      password: "nuevaclave",
    });
  });
});
