import { afterEach, describe, expect, it, vi } from "vitest";

// Los client IDs se leen al cargar el módulo: hay que re-importarlo con el entorno del caso.
async function loadProviders(env: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  vi.resetModules();
  return import("@/features/auth/constants/oauthProviders");
}

describe("availableOAuthProviders", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("lists only the providers whose client ID is configured", async () => {
    const { availableOAuthProviders } = await loadProviders({
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "google-id",
      NEXT_PUBLIC_GITHUB_CLIENT_ID: "",
      NEXT_PUBLIC_LINKEDIN_CLIENT_ID: "   ",
    });

    expect(availableOAuthProviders.map((provider) => provider.id)).toEqual(["google"]);
  });

  it("returns no providers when every client ID is empty", async () => {
    const { availableOAuthProviders } = await loadProviders({
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "",
      NEXT_PUBLIC_GITHUB_CLIENT_ID: "",
      NEXT_PUBLIC_LINKEDIN_CLIENT_ID: "",
    });

    expect(availableOAuthProviders).toEqual([]);
  });

  it("keeps the provider order google, github, linkedin", async () => {
    const { availableOAuthProviders } = await loadProviders({
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "g",
      NEXT_PUBLIC_GITHUB_CLIENT_ID: "h",
      NEXT_PUBLIC_LINKEDIN_CLIENT_ID: "l",
    });

    expect(availableOAuthProviders.map((provider) => provider.id)).toEqual([
      "google",
      "github",
      "linkedin",
    ]);
  });
});
