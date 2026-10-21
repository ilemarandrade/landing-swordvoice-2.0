"use client";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { ResetPasswordExpired } from "@/features/auth/components/reset-password/reset-password-expired";
import { ResetPasswordForm } from "@/features/auth/components/reset-password/reset-password-form";
import { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";

type ResetPasswordProps = { token: string | null };

export function ResetPassword({ token }: ResetPasswordProps) {
  // El hook se llama siempre (reglas de hooks); sin token nunca se envía el formulario.
  const { control, onSubmit, isSubmitting, isLinkExpired } =
    useResetPasswordForm(token ?? "");

  if (!token || isLinkExpired) return <ResetPasswordExpired />;

  return (
    <>
      <AuthIntro
        title={
          <>
            Crea tu nueva <span className="text-secondary">llave</span>
          </>
        }
        description="Elige una contraseña nueva. Al guardarla se cerrarán todas tus sesiones abiertas."
      />
      <AuthCard title="Nueva contraseña">
        <ResetPasswordForm
          control={control}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </AuthCard>
    </>
  );
}
