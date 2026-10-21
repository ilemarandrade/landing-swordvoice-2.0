import { useEffect, useState } from "react";
import { notifyError } from "@/common/errors/notifyError";
import type { AvailableOAuthProvider } from "@/features/auth/constants/oauthProviders";
import { buildAuthorizeUrl } from "@/features/auth/utils/buildAuthorizeUrl";
import { saveOAuthAttempt } from "@/features/auth/utils/oauthAttempt";
import { oauthRedirectUri } from "@/features/auth/utils/oauthRedirectUri";
import {
  createCodeChallenge,
  createCodeVerifier,
  createState,
} from "@/features/auth/utils/pkce";

async function goToProvider(provider: AvailableOAuthProvider) {
  const state = createState();
  const codeVerifier = provider.usesPkce ? createCodeVerifier() : undefined;
  const codeChallenge = codeVerifier
    ? await createCodeChallenge(codeVerifier)
    : undefined;
  saveOAuthAttempt({ provider: provider.id, state, codeVerifier });
  window.location.assign(
    buildAuthorizeUrl(provider, {
      state,
      redirectUri: oauthRedirectUri(),
      codeChallenge,
    }),
  );
}

export function useStartOAuth() {
  const [isStarting, setIsStarting] = useState(false);

  // Al volver con "Atrás" el navegador restaura la página (bfcache) con los botones deshabilitados.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsStarting(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return {
    start: (provider: AvailableOAuthProvider) => {
      setIsStarting(true);
      // Sin Web Crypto (contexto no seguro) no se puede firmar el PKCE: se reactivan los botones.
      goToProvider(provider).catch((error: unknown) => {
        setIsStarting(false);
        notifyError(error);
      });
    },
    isStarting,
  };
}
