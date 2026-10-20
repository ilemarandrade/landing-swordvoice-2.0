import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { apiClient } from "@/common/api/apiClient";
import OAuthCallbackRoute, { metadata } from "./page";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

type SearchParams = {
  code?: string | string[];
  state?: string | string[];
  error?: string | string[];
};

// La capa app no importa utilidades internas de la feature (solo su index.ts),
// así que el intento guardado se escribe con la misma clave y forma que usa oauthAttempt.
function saveAttempt(attempt: { provider: string; state: string; codeVerifier?: string }) {
  sessionStorage.setItem("sv-oauth", JSON.stringify({ ...attempt, createdAt: Date.now() }));
}

async function renderRoute(searchParams: SearchParams) {
  const element = await OAuthCallbackRoute({ searchParams: Promise.resolve(searchParams) });
  return renderWithClient(element);
}

describe("/auth/callback page", () => {
  beforeEach(() => {
    sessionStorage.clear();
    router.replace.mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it("exposes noindex and no-referrer metadata", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe("no-referrer");
  });

  it("exchanges a single code when the state matches the saved attempt", async () => {
    saveAttempt({ provider: "google", state: "s1", codeVerifier: "v".repeat(43) });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    await renderRoute({ code: "c1", state: "s1" });
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["missing", {}],
    ["empty", { code: "", state: "s1" }],
    ["duplicated", { code: ["c1", "c2"], state: "s1" }],
  ])("rejects a %s code without calling the API", async (_label, params) => {
    saveAttempt({ provider: "google", state: "s1" });
    await renderRoute(params);
    expect(screen.getByRole("status")).toHaveTextContent(
      "El inicio de sesión no es válido o expiró. Vuelve a intentarlo.",
    );
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("ignores a duplicated error parameter and keeps the exchange", async () => {
    saveAttempt({ provider: "google", state: "s1", codeVerifier: "v".repeat(43) });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    await renderRoute({ code: "c1", state: "s1", error: ["access_denied", "server_error"] });
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });

  it("shows the cancellation from the provider without calling the API", async () => {
    saveAttempt({ provider: "github", state: "s1" });
    await renderRoute({ state: "s1", error: "access_denied" });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cancelaste el inicio de sesión con GitHub.",
    );
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
