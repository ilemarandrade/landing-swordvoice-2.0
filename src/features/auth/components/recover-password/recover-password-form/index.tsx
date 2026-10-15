import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import type { useRecoverPasswordForm } from "@/features/auth/hooks/useRecoverPasswordForm";

type RecoverPasswordFormProps = Pick<
  ReturnType<typeof useRecoverPasswordForm>,
  "control" | "onSubmit" | "isSubmitting"
>;

export function RecoverPasswordForm({
  control,
  onSubmit,
  isSubmitting,
}: RecoverPasswordFormProps) {
  return (
    <>
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-secondary text-secondary">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="8" cy="15" r="4" />
          <path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2" />
        </svg>
      </div>
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">
        ¿Perdiste tu <span className="text-primary">llave</span>?
      </h1>
      <p className="text-[17px] leading-relaxed text-[#E6E6EE]">
        Escribe el correo de tu cuenta y te enviaremos un enlace para crear una
        contraseña nueva.
      </p>
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
        <Button type="submit" label="Enviar enlace" fullWidth disabled={isSubmitting} />
      </form>
      <Link href={routes.LOGIN} className="text-[15px] font-semibold text-primary hover:text-[#FFA34D]">
        ← Volver a iniciar sesión
      </Link>
    </>
  );
}
