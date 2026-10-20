import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { AuthStatus } from "@/features/auth/components/auth-status";

export function ResetPasswordExpired() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col">
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
            <path d="M12 7v5l3 2" />
          </svg>
        }
        title={
          <>
            El enlace <span className="text-secondary">venció</span>
          </>
        }
        description="El enlace venció o ya se usó. Pide uno nuevo para crear tu contraseña."
      >
        <ButtonLink href={routes.RECOVER_PASSWORD} label="Pedir otro enlace" />
      </AuthStatus>
    </section>
  );
}
