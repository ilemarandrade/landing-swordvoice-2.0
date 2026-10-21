"use client";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { useMentorLandingForm } from "@/features/admin/hooks/useMentorLandingForm";
import type { MentorLanding } from "@/features/admin/schemas/mentorLanding.schema";

type LandingFormProps = { landing: MentorLanding };

export function LandingForm({ landing }: LandingFormProps) {
  const { control, onSubmit, canSubmit } = useMentorLandingForm(landing);

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2">
      <InputController
        control={control}
        name="showOnLanding"
        label="Mostrar en la landing"
        type="checkbox"
      />
      <InputController
        control={control}
        name="landingOrder"
        label="Posición"
        type="number"
        description="Vacío = sin posición; los mentores sin posición salen al final, por nombre."
      />
      <p className="mb-4 text-sm text-[#C9C9D6]">
        Solo aparece si además su perfil de mentor está completo.
      </p>
      <Button type="submit" label="Guardar" disabled={!canSubmit} />
    </form>
  );
}
