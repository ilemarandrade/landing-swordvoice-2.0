"use client";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import type { Profile } from "@/common/api/profile.schema";
import { useProfileForm } from "@/features/profile/hooks/useProfileForm";

type ProfileFormProps = { profile: Profile; email: string; isMentor: boolean };

export function ProfileForm({ profile, email, isMentor }: ProfileFormProps) {
  const { control, onSubmit, canSubmit } = useProfileForm(profile, {
    isMentor,
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col rounded-[18px] border border-white/15 bg-[#000E2799] p-6 md:p-9"
    >
      <h2 className="mb-4 text-2xl font-bold">Datos</h2>
      <InputController
        control={control}
        name="name"
        label="Nombre"
        autoComplete="name"
      />
      <div className="mb-4 flex flex-col gap-1">
        <span className="text-sm font-semibold">Correo electrónico</span>
        <span className="text-[15px] text-[#C9C9D6]">{email}</span>
      </div>
      <InputController control={control} name="bio" label="Bio" multiline />
      <InputController
        control={control}
        name="githubUrl"
        label="GitHub"
        type="url"
        placeholder="https://github.com/tu-usuario"
      />
      <InputController
        control={control}
        name="linkedinUrl"
        label="LinkedIn"
        type="url"
        placeholder="https://www.linkedin.com/in/tu-perfil"
      />
      <InputController
        control={control}
        name="portfolioUrl"
        label="Portafolio"
        type="url"
        placeholder="https://tu-portafolio.dev"
      />
      <InputController
        control={control}
        name="freeCodeCampUsername"
        label="Usuario de freeCodeCamp"
        autoComplete="off"
      />
      {isMentor && (
        <fieldset className="mt-2 flex flex-col border-t border-white/15 pt-6">
          <legend className="mb-4 text-lg font-bold text-primary">
            Perfil de mentor
          </legend>
          <InputController
            control={control}
            name="professionalTitle"
            label="Título profesional"
            placeholder="Frontend Developer"
            description="Se muestra en la landing."
          />
          <InputController
            control={control}
            name="shortDescription"
            label="Descripción corta"
            multiline
            description="Se muestra en la landing."
          />
          <InputController
            control={control}
            name="experienceStartedAt"
            label="Inicio de experiencia"
            type="date"
            description="Se usa para calcular tus años de experiencia en la landing."
          />
        </fieldset>
      )}
      <Button
        type="submit"
        label="Guardar cambios"
        fullWidth
        disabled={!canSubmit}
      />
    </form>
  );
}
