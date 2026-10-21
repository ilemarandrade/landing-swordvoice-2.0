import { AuthTextButton } from "@/features/auth/components/auth-text-button";

type UnverifiedEmailNoticeProps = {
  email: string;
  onResend: () => void;
  isResending: boolean;
};

export function UnverifiedEmailNotice({ email, onResend, isResending }: UnverifiedEmailNoticeProps) {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-col items-start gap-1 rounded-xl border border-primary bg-[#000E2799] p-4 text-[15px] text-[#E6E6EE]"
    >
      <p>
        Confirma tu correo para entrar. Te enviamos un enlace a <strong>{email}</strong>.
      </p>
      <AuthTextButton label="REENVIAR CORREO" onClick={onResend} disabled={isResending} />
    </div>
  );
}
