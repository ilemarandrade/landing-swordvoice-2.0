import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyError } from "@/common/errors/notifyError";
import {
  oauthProviders,
  type AvailableOAuthProvider,
} from "@/features/auth/constants/oauthProviders";
import { useStartOAuth } from "@/features/auth/hooks/useStartOAuth";
import { takeOAuthAttempt } from "@/features/auth/utils/oauthAttempt";

// Controlable desde cada test: simula que Web Crypto (`crypto.subtle`) falla.
const pkce = vi.hoisted(() => ({ challengeError: null as Error | null }));

vi.mock("@/features/auth/utils/pkce", () => ({
  createState: () => "state-1",
  createCodeVerifier: () => "v".repeat(43),
  createCodeChallenge: async () => {
    if (pkce.challengeError) throw pkce.challengeError;
    return "challenge-1";
  },
}));

vi.mock("@/common/errors/notifyError", () => ({
  notifyError: vi.fn(),
}));

const assign = vi.fn();

function configured(id: "google" | "linkedin"): AvailableOAuthProvider {
  return { ...oauthProviders[id], clientId: `${id}-client` };
}

// jsdom no siempre expone PageTransitionEvent: un Event con `persisted` basta para el listener.
function dispatchPageShow(persisted: boolean) {
  window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted }));
}

describe("useStartOAuth", () => {
  beforeEach(() => {
    sessionStorage.clear();
    assign.mockReset();
    pkce.challengeError = null;
    vi.stubGlobal("location", {
      ...window.location,
      origin: "http://localhost:3000",
      assign,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves the attempt with the verifier and goes to Google with the challenge", async () => {
    const { result } = renderHook(() => useStartOAuth());
    act(() => result.current.start(configured("google")));
    expect(result.current.isStarting).toBe(true);
    await waitFor(() => expect(assign).toHaveBeenCalled());
    const url = new URL(assign.mock.calls[0]?.[0] as string);
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(url.searchParams.get("state")).toBe("state-1");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-1");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/auth/callback",
    );
    expect(takeOAuthAttempt()).toMatchObject({
      provider: "google",
      state: "state-1",
      codeVerifier: "v".repeat(43),
    });
  });

  it("does not create a verifier nor a challenge for LinkedIn", async () => {
    const { result } = renderHook(() => useStartOAuth());
    act(() => result.current.start(configured("linkedin")));
    await waitFor(() => expect(assign).toHaveBeenCalled());
    const url = new URL(assign.mock.calls[0]?.[0] as string);
    expect(url.searchParams.has("code_challenge")).toBe(false);
    expect(url.searchParams.has("code_challenge_method")).toBe(false);
    expect(takeOAuthAttempt()?.codeVerifier).toBeUndefined();
  });

  it("enables the buttons again when the page is restored from bfcache", async () => {
    const { result } = renderHook(() => useStartOAuth());
    act(() => result.current.start(configured("google")));
    expect(result.current.isStarting).toBe(true);
    act(() => dispatchPageShow(true));
    expect(result.current.isStarting).toBe(false);
  });

  it("keeps the buttons disabled on a pageshow that is not from bfcache", async () => {
    const { result } = renderHook(() => useStartOAuth());
    act(() => result.current.start(configured("google")));
    act(() => dispatchPageShow(false));
    expect(result.current.isStarting).toBe(true);
  });

  it("removes the pageshow listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useStartOAuth());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("pageshow", expect.any(Function));
  });

  it("re-enables the buttons and reports the error when the PKCE step fails", async () => {
    const error = new Error("crypto.subtle is undefined");
    pkce.challengeError = error;
    const { result } = renderHook(() => useStartOAuth());
    act(() => result.current.start(configured("google")));
    expect(result.current.isStarting).toBe(true);
    await waitFor(() => expect(notifyError).toHaveBeenCalledWith(error));
    expect(result.current.isStarting).toBe(false);
    expect(assign).not.toHaveBeenCalled();
    expect(takeOAuthAttempt()).toBeNull();
  });
});
