import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { notifyError } from "@/common/errors/notifyError";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import type { AvailableOAuthProvider } from "@/features/auth/constants/oauthProviders";

const state = vi.hoisted(() => ({
  providers: [] as AvailableOAuthProvider[],
  challengeError: null as Error | null,
}));

// Se conserva el resto del módulo: oauthAttempt necesita OAUTH_PROVIDER_IDS en tiempo de carga.
vi.mock("@/features/auth/constants/oauthProviders", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/auth/constants/oauthProviders")>();
  return {
    ...original,
    get availableOAuthProviders() {
      return state.providers;
    },
  };
});

vi.mock("@/features/auth/utils/pkce", () => ({
  createState: () => "state-1",
  createCodeVerifier: () => "v".repeat(43),
  createCodeChallenge: async () => {
    if (state.challengeError) throw state.challengeError;
    return "challenge-1";
  },
}));

vi.mock("@/common/errors/notifyError", () => ({
  notifyError: vi.fn(),
}));

const assign = vi.fn();

const providers: Record<"google" | "github" | "linkedin", AvailableOAuthProvider> = {
  google: {
    id: "google",
    label: "Google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scope: "openid email profile",
    usesPkce: true,
    clientId: "google-client",
  },
  github: {
    id: "github",
    label: "GitHub",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    scope: "read:user user:email",
    usesPkce: true,
    clientId: "gh",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scope: "openid profile email",
    usesPkce: false,
    clientId: "linkedin-client",
  },
};

// jsdom no implementa la navegación: se sustituye location para capturar assign().
function dispatchPageShow(persisted: boolean) {
  window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted }));
}

describe("OAuthButtons", () => {
  beforeEach(() => {
    sessionStorage.clear();
    assign.mockReset();
    state.challengeError = null;
    state.providers = [];
    vi.stubGlobal("location", {
      ...window.location,
      origin: "http://localhost:3000",
      assign,
    });
  });

  it("renders nothing without configured providers", () => {
    const { container } = render(<OAuthButtons />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one button per configured provider and the separator", () => {
    state.providers = [providers.github];
    render(<OAuthButtons />);
    expect(screen.getByRole("button", { name: "Continuar con GitHub" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continuar con Google" })).not.toBeInTheDocument();
    expect(screen.getByText("o")).toBeInTheDocument();
  });

  it("renders the buttons of Google, GitHub and LinkedIn when all are configured", () => {
    state.providers = [providers.google, providers.github, providers.linkedin];
    render(<OAuthButtons />);
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar con GitHub" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar con LinkedIn" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("disables every button while the user is sent to the provider", async () => {
    const user = userEvent.setup();
    state.providers = [providers.google, providers.linkedin];
    render(<OAuthButtons />);
    await user.click(screen.getByRole("button", { name: "Continuar con LinkedIn" }));
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continuar con LinkedIn" })).toBeDisabled();
    await waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
    expect(String(assign.mock.calls[0]?.[0])).toMatch(
      /^https:\/\/www\.linkedin\.com\/oauth\/v2\/authorization\?/,
    );
  });

  it("enables the buttons again when the page comes back from bfcache", async () => {
    const user = userEvent.setup();
    state.providers = [providers.google, providers.github];
    render(<OAuthButtons />);
    await user.click(screen.getByRole("button", { name: "Continuar con Google" }));
    expect(screen.getByRole("button", { name: "Continuar con GitHub" })).toBeDisabled();
    act(() => dispatchPageShow(true));
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Continuar con GitHub" })).toBeEnabled();
  });

  it("keeps the buttons disabled on a pageshow that is not from bfcache", async () => {
    const user = userEvent.setup();
    state.providers = [providers.google];
    render(<OAuthButtons />);
    await user.click(screen.getByRole("button", { name: "Continuar con Google" }));
    act(() => dispatchPageShow(false));
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeDisabled();
  });

  it("enables the buttons again and does not navigate when the PKCE step fails", async () => {
    const user = userEvent.setup();
    state.providers = [providers.google];
    const error = new Error("crypto.subtle is undefined");
    state.challengeError = error;
    render(<OAuthButtons />);
    await user.click(screen.getByRole("button", { name: "Continuar con Google" }));
    await waitFor(() => expect(notifyError).toHaveBeenCalledWith(error));
    expect(screen.getByRole("button", { name: "Continuar con Google" })).toBeEnabled();
    expect(assign).not.toHaveBeenCalled();
  });
});
