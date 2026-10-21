import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import type { useVerifyEmailForm } from "@/features/auth/hooks/useVerifyEmailForm";

type VerifyEmailFormProps = Pick<
  ReturnType<typeof useVerifyEmailForm>,
  "control" | "onSubmit" | "isSubmitting" | "isWrongPassword"
>;

export function VerifyEmailForm({ control, onSubmit, isSubmitting, isWrongPassword }: VerifyEmailFormProps) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
      />
      {isWrongPassword && (
        <Link
          href={routes.RECOVER_PASSWORD}
          className="-mt-2 mb-4 self-end text-sm text-primary hover:text-[#FFA34D]"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      )}
      <Button type="submit" label="Confirmar correo" fullWidth disabled={isSubmitting} />
    </form>
  );
}
