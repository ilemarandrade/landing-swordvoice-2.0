"use client";
import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import { pathOptions } from "@/features/auth/constants/pathOptions";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";

export function RegisterForm() {
  const { control, onSubmit, isSubmitting } = useRegisterForm();

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="name"
        label="Nombre y Apellido"
        autoComplete="name"
      />
      <InputController
        control={control}
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
      />
      <InputController
        control={control}
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        description="Mínimo 8 caracteres, con al menos un número."
      />
      <InputController
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
      />
      <InputController
        control={control}
        name="path"
        label="Tu path"
        options={pathOptions}
        description="Warrior, Master y Ancient: próximamente."
      />
      <InputController
        control={control}
        name="acceptTerms"
        type="checkbox"
        label={
          <>
            Acepto los{" "}
            <Link href={routes.TERMS} className="text-primary hover:text-[#FFA34D]">
              Términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link href={routes.PRIVACY} className="text-primary hover:text-[#FFA34D]">
              Política de privacidad
            </Link>
            .
          </>
        }
      />
      <Button type="submit" label="Registrarme" fullWidth disabled={isSubmitting} />
    </form>
  );
}
