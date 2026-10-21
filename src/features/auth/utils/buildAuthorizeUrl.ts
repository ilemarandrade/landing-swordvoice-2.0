import type { AvailableOAuthProvider } from "@/features/auth/constants/oauthProviders";

type AuthorizeOptions = {
  state: string;
  redirectUri: string;
  codeChallenge?: string;
};

export function buildAuthorizeUrl(
  provider: AvailableOAuthProvider,
  { state, redirectUri, codeChallenge }: AuthorizeOptions,
): string {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: provider.scope,
    state,
  });
  if (codeChallenge) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }
  return `${provider.authorizeUrl}?${params.toString()}`;
}
