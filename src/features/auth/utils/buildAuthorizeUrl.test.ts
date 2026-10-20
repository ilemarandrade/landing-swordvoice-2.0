import { describe, expect, it } from "vitest";
import {
  oauthProviders,
  type AvailableOAuthProvider,
} from "@/features/auth/constants/oauthProviders";
import { buildAuthorizeUrl } from "@/features/auth/utils/buildAuthorizeUrl";

function configured(
  id: "google" | "github" | "linkedin",
): AvailableOAuthProvider {
  return { ...oauthProviders[id], clientId: `${id}-client` };
}

const redirectUri = "http://localhost:3000/auth/callback";

describe("buildAuthorizeUrl", () => {
  it.each([
    ["google", "https://accounts.google.com/o/oauth2/v2/auth", "openid email profile"],
    ["github", "https://github.com/login/oauth/authorize", "read:user user:email"],
  ] as const)("adds PKCE for %s", (id, base, scope) => {
    const url = new URL(
      buildAuthorizeUrl(configured(id), {
        state: "s1",
        redirectUri,
        codeChallenge: "c1",
      }),
    );
    expect(`${url.origin}${url.pathname}`).toBe(base);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: `${id}-client`,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      state: "s1",
      code_challenge: "c1",
      code_challenge_method: "S256",
    });
  });

  it("does not add PKCE for LinkedIn", () => {
    const url = new URL(
      buildAuthorizeUrl(configured("linkedin"), { state: "s1", redirectUri }),
    );
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://www.linkedin.com/oauth/v2/authorization",
    );
    expect(url.searchParams.get("scope")).toBe("openid profile email");
    expect(url.searchParams.has("code_challenge")).toBe(false);
    expect(url.searchParams.has("code_challenge_method")).toBe(false);
  });
});
