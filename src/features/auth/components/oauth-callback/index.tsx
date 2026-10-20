"use client";
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { AuthStatus } from "@/features/auth/components/auth-status";
import {
  useOAuthCallback,
  type OAuthCallbackParams,
} from "@/features/auth/hooks/useOAuthCallback";

export function OAuthCallback(params: OAuthCallbackParams) {
  const { providerLabel, message } = useOAuthCallback(params);

  return (
    <section className="mx-auto flex w-full max-w-md flex-col">
      {message ? (
        <AuthStatus
          icon={
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
          }
          title={
            <>
              No pudimos <span className="text-secondary">entrar</span>
            </>
          }
          description={message}
        >
          <ButtonLink href={routes.LOGIN} label="Volver a iniciar sesión" />
        </AuthStatus>
      ) : (
        <AuthStatus
          icon={
            <svg
              className="animate-spin"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.2-8.6" />
            </svg>
          }
          title={`Conectando con ${providerLabel}…`}
          description="Un momento, estamos terminando de iniciar tu sesión."
        />
      )}
    </section>
  );
}
