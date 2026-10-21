import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { AuthTextButton } from "@/features/auth/components/auth-text-button";

type RecoverEmailSentProps = { onResend: () => void };

export function RecoverEmailSent({ onResend }: RecoverEmailSentProps) {
  return (
    <AuthStatus
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      }
      title={
        <>
          Revisa tu <span className="text-secondary">correo</span>
        </>
      }
      description="Si existe una cuenta con ese correo, recibirás un enlace en unos minutos."
    >
      <ButtonLink href={routes.LOGIN} label="Volver a iniciar sesión" />
      <AuthTextButton label="¿NO LLEGÓ? REENVIAR" onClick={onResend} />
    </AuthStatus>
  );
}
