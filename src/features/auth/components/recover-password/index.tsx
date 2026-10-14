"use client";
import { RecoverEmailSent } from "@/features/auth/components/recover-password/recover-email-sent";
import { RecoverPasswordForm } from "@/features/auth/components/recover-password/recover-password-form";
import { useRecoverPasswordForm } from "@/features/auth/hooks/useRecoverPasswordForm";

export function RecoverPassword() {
  const { control, onSubmit, isSubmitting, isSent, resend } =
    useRecoverPasswordForm();

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-7 text-center">
      {isSent ? (
        <RecoverEmailSent onResend={resend} />
      ) : (
        <RecoverPasswordForm
          control={control}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  );
}
