"use client";
import { Button } from "@/common/components/button";
import { LandingForm } from "@/features/admin/components/users-admin/user-panel/mentor-landing-form/landing-form";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import { useMentorLandingQuery } from "@/features/admin/hooks/useMentorLandingQuery";

type MentorLandingFormProps = { userId: string };

export function MentorLandingForm({ userId }: MentorLandingFormProps) {
  const landing = useMentorLandingQuery(userId, { enabled: true });

  return (
    <section className="mt-2 flex flex-col gap-4 border-t border-white/15 pt-6">
      <h3 className="text-lg font-bold text-primary">Landing</h3>
      {landing.data ? (
        // key: al cambiar de usuario, el formulario vuelve a tomar sus valores iniciales.
        <LandingForm key={userId} landing={landing.data} />
      ) : landing.isError ? (
        <div role="alert" className="flex flex-col items-start gap-4">
          <p>{adminMessages.LANDING_LOAD_FAILED}</p>
          <Button
            type="button"
            label="Reintentar"
            onClick={() => void landing.refetch()}
          />
        </div>
      ) : (
        <p role="status">Cargando…</p>
      )}
    </section>
  );
}
