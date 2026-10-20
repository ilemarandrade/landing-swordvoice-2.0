"use client";
import { Button } from "@/common/components/button";
import { useMeQuery } from "@/common/hooks/useMeQuery";
import { useProfileQuery } from "@/common/hooks/useProfileQuery";
import { ProfileForm } from "@/features/profile/components/profile-section/profile-form";
import { ProfilePhoto } from "@/features/profile/components/profile-section/profile-photo";

export function ProfileSection() {
  const profile = useProfileQuery();
  const me = useMeQuery();

  if (profile.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-4">
        <p>No pudimos cargar tu perfil.</p>
        <Button
          type="button"
          label="Reintentar"
          onClick={() => void profile.refetch()}
        />
      </div>
    );
  }
  if (!profile.data || !me.data) {
    return <p role="status">Cargando tu perfil…</p>;
  }

  const isMentor = me.data.pathRoles.some(
    (pathRole) => pathRole.role === "MENTOR",
  );

  return (
    <>
      {/* El h1 de la página lo pone el header del dashboard. */}
      <h2 className="font-sedgwick text-[32px] md:text-5xl">
        Mi <span className="text-primary">perfil</span>
      </h2>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ProfilePhoto profile={profile.data} />
        <ProfileForm
          profile={profile.data}
          email={me.data.email}
          isMentor={isMentor}
        />
      </div>
    </>
  );
}
