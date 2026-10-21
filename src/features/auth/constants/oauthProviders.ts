import { publicEnv } from "@/common/config/publicEnv";

export const OAUTH_PROVIDER_IDS = ["google", "github", "linkedin"] as const;

export type OAuthProviderId = (typeof OAUTH_PROVIDER_IDS)[number];

export type OAuthProvider = {
  id: OAuthProviderId;
  label: string;
  authorizeUrl: string;
  scope: string;
  usesPkce: boolean;
  clientId: string | undefined;
};

export type AvailableOAuthProvider = OAuthProvider & { clientId: string };

export const oauthProviders: Record<OAuthProviderId, OAuthProvider> = {
  google: {
    id: "google",
    label: "Google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scope: "openid email profile",
    usesPkce: true,
    clientId: publicEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
  github: {
    id: "github",
    label: "GitHub",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    scope: "read:user user:email",
    usesPkce: true,
    clientId: publicEnv.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scope: "openid profile email",
    usesPkce: false,
    clientId: publicEnv.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
  },
};

export const availableOAuthProviders: AvailableOAuthProvider[] =
  OAUTH_PROVIDER_IDS.map((id) => oauthProviders[id]).filter(
    (provider): provider is AvailableOAuthProvider =>
      Boolean(provider.clientId),
  );
