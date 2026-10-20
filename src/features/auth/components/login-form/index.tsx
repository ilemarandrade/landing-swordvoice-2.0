"use client";
import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export function LoginForm() {
  const { control, onSubmit, isSubmitting } = useLoginForm();

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
      />
      <InputController
        control={control}
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
      />
      <Link
        href={routes.RECOVER_PASSWORD}
        className="-mt-2 mb-4 self-end text-sm text-primary hover:text-[#FFA34D]"
      >
        ¿Olvidaste tu contraseña?
      </Link>
      <Button type="submit" label="Entrar" fullWidth disabled={isSubmitting} />
    </form>
  );
}
