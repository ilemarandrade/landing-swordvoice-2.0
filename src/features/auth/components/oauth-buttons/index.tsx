"use client";
import { SocialLoginButton } from "@/features/auth/components/oauth-buttons/social-login-button";
import { availableOAuthProviders } from "@/features/auth/constants/oauthProviders";
import { useStartOAuth } from "@/features/auth/hooks/useStartOAuth";

export function OAuthButtons() {
  const { start, isStarting } = useStartOAuth();

  if (availableOAuthProviders.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {availableOAuthProviders.map((provider) => (
        <SocialLoginButton
          key={provider.id}
          provider={provider.id}
          onClick={() => start(provider)}
          disabled={isStarting}
        />
      ))}
      <div className="my-3 flex items-center gap-3 text-sm text-[#C9C9D6]">
        <span aria-hidden="true" className="h-px flex-1 bg-white/15" />o
        <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
      </div>
    </div>
  );
}
