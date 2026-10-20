import { StrictMode } from "react";
import { screen, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { OAuthCallback } from "@/features/auth/components/oauth-callback";
import { saveOAuthAttempt } from "@/features/auth/utils/oauthAttempt";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
// Ningún resultado del callback se muestra con toast: todo va en la pantalla.
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));

const tokens = { data: { accessToken: "a", refreshToken: "r", expiresIn: 900 } } as Awaited<
  ReturnType<typeof apiClient.post>
>;
const redirectUri = `${window.location.origin}/auth/callback`;
const INVALID_ATTEMPT = "El inicio de sesión no es válido o expiró. Vuelve a intentarlo.";

describe("OAuthCallback", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    router.replace.mockReset();
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it("exchanges the code with the verifier and goes to the dashboard", async () => {
    saveOAuthAttempt({ provider: "google", state: "s1", codeVerifier: "v".repeat(43) });
    vi.mocked(apiClient.post).mockResolvedValue(tokens);
    renderWithClient(<OAuthCallback code="c1" state="s1" error={null} />);
    expect(screen.getByText("Conectando con Google…")).toBeInTheDocument();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/oauth/google", {
      code: "c1",
      redirectUri,
      codeVerifier: "v".repeat(43),
    });
    expect(getTokens()).not.toBeNull();
  });

  it("does not send a verifier for LinkedIn", async () => {
    saveOAuthAttempt({ provider: "linkedin", state: "s1" });
    vi.mocked(apiClient.post).mockResolvedValue(tokens);
    renderWithClient(<OAuthCallback code="c1" state="s1" error={null} />);
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    expect(vi.mocked(apiClient.post).mock.calls[0]?.[1]).toEqual({ code: "c1", redirectUri });
  });

  // React 19 StrictMode ejecuta los efectos dos veces en desarrollo.
  it("posts only once under StrictMode and does not end on the invalid message", async () => {
    saveOAuthAttempt({ provider: "github", state: "s1", codeVerifier: "v".repeat(43) });
    vi.mocked(apiClient.post).mockResolvedValue(tokens);
    renderWithClient(
      <StrictMode>
        <OAuthCallback code="c1" state="s1" error={null} />
      </StrictMode>,
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(INVALID_ATTEMPT)).not.toBeInTheDocument();
  });

  it.each([
    ["a different state", { code: "c1", state: "other", error: null }],
    ["a missing code", { code: null, state: "s1", error: null }],
  ])("rejects %s on screen without calling the API or toasting", async (_label, params) => {
    saveOAuthAttempt({ provider: "google", state: "s1" });
    renderWithClient(<OAuthCallback {...params} />);
    expect(await screen.findByRole("status")).toHaveTextContent(INVALID_ATTEMPT);
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("rejects a callback without any saved attempt", async () => {
    renderWithClient(<OAuthCallback code="c1" state="s1" error={null} />);
    expect(await screen.findByRole("status")).toHaveTextContent(INVALID_ATTEMPT);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  // El intento se consume en la primera carga: recargar la URL ya no sirve.
  it("rejects a reload after the attempt was consumed", async () => {
    saveOAuthAttempt({ provider: "google", state: "s1", codeVerifier: "v".repeat(43) });
    vi.mocked(apiClient.post).mockResolvedValue(tokens);
    const first = renderWithClient(<OAuthCallback code="c1" state="s1" error={null} />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    first.unmount();

    renderWithClient(<OAuthCallback code="c1" state="s1" error={null} />);
    expect(await screen.findByRole("status")).toHaveTextContent(INVALID_ATTEMPT);
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ["access_denied", "Cancelaste el inicio de sesión con GitHub."],
    ["server_error", "GitHub no pudo completar el inicio de sesión. Inténtalo de nuevo."],
  ])("shows the provider error %s without calling the API or toasting", async (error, message) => {
    saveOAuthAttempt({ provider: "github", state: "s1" });
    renderWithClient(<OAuthCallback code={null} state="s1" error={error} />);
    expect(await screen.findByRole("status")).toHaveTextContent(message);
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows the provider error even when a code came back too", async () => {
    saveOAuthAttempt({ provider: "google", state: "s1", codeVerifier: "v".repeat(43) });
    renderWithClient(<OAuthCallback code="c1" state="s1" error="access_denied" />);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Cancelaste el inicio de sesión con Google.",
    );
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("shows the API error and a way back to the login", async () => {
    saveOAuthAttempt({ provider: "github", state: "s1", codeVerifier: "v".repeat(43) });
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(503, "x", "OAUTH_PROVIDER_UNAVAILABLE"));
    renderWithClient(<OAuthCallback code="c1" state="s1" error={null} />);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "GitHub no está disponible ahora. Prueba con otro método.",
    );
    expect(screen.getByRole("link", { name: "Volver a iniciar sesión" })).toHaveAttribute(
      "href",
      "/iniciar-sesion",
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ["an ApiError with a 429", new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS"), "Demasiadas solicitudes"],
    ["a non-API error", new Error("Network Error"), "Ha ocurrido un error"],
  ])("shows %s on screen and never toasts it", async (_label, error, message) => {
    saveOAuthAttempt({ provider: "github", state: "s1", codeVerifier: "v".repeat(43) });
    vi.mocked(apiClient.post).mockRejectedValue(error);
    renderWithClient(<OAuthCallback code="c1" state="s1" error={null} />);
    expect(await screen.findByRole("status")).toHaveTextContent(message);
    expect(toast.error).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
