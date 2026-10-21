"use client";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { useResendVerificationForm } from "@/features/auth/hooks/useResendVerificationForm";

export function VerifyEmailExpired() {
  const { control, onSubmit, isSubmitting } = useResendVerificationForm();

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
        description="El enlace venció o ya se usó. Escribe tu correo y te enviamos uno nuevo."
      >
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex w-full flex-col rounded-[18px] border border-white/15 bg-[#000E2799] p-6 text-left md:p-9"
        >
          <InputController
            control={control}
            name="email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
          />
          <Button
            type="submit"
            label="Enviar enlace nuevo"
            fullWidth
            disabled={isSubmitting}
          />
        </form>
      </AuthStatus>
    </section>
  );
}
