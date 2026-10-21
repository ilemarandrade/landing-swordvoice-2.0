import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { AuthTextButton } from "@/features/auth/components/auth-text-button";

type RegisterEmailSentProps = {
  email: string;
  onResend: () => void;
  isResending: boolean;
};

export function RegisterEmailSent({ email, onResend, isResending }: RegisterEmailSentProps) {
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
      description={
        <>
          Te enviamos un enlace a <strong>{email}</strong> para confirmar tu
          cuenta. Vence en 24 horas.
        </>
      }
    >
      <ButtonLink href={routes.LOGIN} label="Ir a iniciar sesión" />
      <AuthTextButton label="¿NO LLEGÓ? REENVIAR" onClick={onResend} disabled={isResending} />
    </AuthStatus>
  );
}
