import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { routes } from "@/common/constants/routes";
import {
  oauthMessages,
  UNKNOWN_PROVIDER_LABEL,
} from "@/features/auth/constants/oauthMessages";
import { oauthProviders } from "@/features/auth/constants/oauthProviders";
import { useOAuthSignInMutation } from "@/features/auth/hooks/useOAuthSignInMutation";
import { takeOAuthAttempt } from "@/features/auth/utils/oauthAttempt";
import { oauthRedirectUri } from "@/features/auth/utils/oauthRedirectUri";
import { toOAuthErrorMessage } from "@/features/auth/utils/toOAuthErrorMessage";

export type OAuthCallbackParams = {
  code: string | null;
  state: string | null;
  error: string | null;
};

export function useOAuthCallback({ code, state, error }: OAuthCallbackParams) {
  const router = useRouter();
  const { mutateAsync } = useOAuthSignInMutation();
  // El code es de un solo uso y React (StrictMode) ejecuta los efectos dos veces en desarrollo.
  const hasRun = useRef(false);
  const [providerLabel, setProviderLabel] = useState(UNKNOWN_PROVIDER_LABEL);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const attempt = takeOAuthAttempt();
    const provider = attempt ? oauthProviders[attempt.provider] : null;
    const label = provider?.label ?? UNKNOWN_PROVIDER_LABEL;
    setProviderLabel(label);

    if (error) {
      setMessage(
        error === "access_denied"
          ? oauthMessages.cancelled(label)
          : oauthMessages.providerError(label),
      );
      return;
    }
    if (!attempt || !provider || !code || state !== attempt.state) {
      setMessage(oauthMessages.INVALID_ATTEMPT);
      return;
    }

    // mutateAsync (y no callbacks de mutate) para que el resultado llegue aunque StrictMode remonte.
    mutateAsync({
      provider: attempt.provider,
      code,
      redirectUri: oauthRedirectUri(),
      ...(provider.usesPkce && attempt.codeVerifier
        ? { codeVerifier: attempt.codeVerifier }
        : {}),
    }).then(
      () => router.replace(routes.DASHBOARD),
      (mutationError: unknown) =>
        setMessage(toOAuthErrorMessage(mutationError, label)),
    );
  }, [code, state, error, mutateAsync, router]);

  return { providerLabel, message };
}
