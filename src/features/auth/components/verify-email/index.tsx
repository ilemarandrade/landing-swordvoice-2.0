"use client";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { VerifyEmailExpired } from "@/features/auth/components/verify-email/verify-email-expired";
import { VerifyEmailForm } from "@/features/auth/components/verify-email/verify-email-form";
import { useVerifyEmailForm } from "@/features/auth/hooks/useVerifyEmailForm";

type VerifyEmailProps = { token: string | null };

export function VerifyEmail({ token }: VerifyEmailProps) {
  // El hook se llama siempre (reglas de hooks); sin token nunca se envía el formulario.
  const { control, onSubmit, isSubmitting, isWrongPassword, isLinkExpired } =
    useVerifyEmailForm(token ?? "");

  if (!token || isLinkExpired) return <VerifyEmailExpired />;

  return (
    <>
      <AuthIntro
        title={
          <>
            Confirma tu <span className="text-secondary">correo</span>
          </>
        }
        description="Escribe la contraseña de tu cuenta para confirmar tu correo y entrar."
      />
      <AuthCard title="Confirmar">
        <VerifyEmailForm
          control={control}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isWrongPassword={isWrongPassword}
        />
      </AuthCard>
    </>
  );
}
