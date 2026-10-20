import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import type { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";

type ResetPasswordFormProps = Pick<
  ReturnType<typeof useResetPasswordForm>,
  "control" | "onSubmit" | "isSubmitting"
>;

export function ResetPasswordForm({
  control,
  onSubmit,
  isSubmitting,
}: ResetPasswordFormProps) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="password"
        label="Contraseña nueva"
        type="password"
        autoComplete="new-password"
        description="Mínimo 8 caracteres."
      />
      <InputController
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
      />
      <Button
        type="submit"
        label="Guardar contraseña"
        fullWidth
        disabled={isSubmitting}
      />
    </form>
  );
}
