"use client";
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

const ROLE_LABELS = { MENTOR: "Mentor", APPRENTICE: "Aprendiz" } as const;

export function WelcomeBanner() {
  const { name, primaryPath, primaryRole, isAdmin } = useCurrentUser();

  return (
    <section className="relative flex min-h-[200px] items-end overflow-hidden rounded-[18px] bg-ourPathsBackground bg-cover bg-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20"
      />
      <div className="relative flex w-full flex-wrap items-end justify-between gap-5 p-5 md:p-9">
        <div className="flex max-w-xl flex-col gap-2.5">
          <h2 className="font-sedgwick break-words text-[32px] leading-tight md:text-5xl">
            Hola, <span className="text-primary">{name}</span>
          </h2>
          <p className="text-[17px] leading-normal text-[#E6E6EE]">
            {primaryPath && primaryRole ? (
              <>
                Estás en el path{" "}
                <strong className="text-secondary">{primaryPath.name}</strong>{" "}
                como{" "}
                <strong className="text-secondary">
                  {ROLE_LABELS[primaryRole]}
                </strong>
                .
              </>
            ) : isAdmin ? (
              "Administra usuarios y roles."
            ) : (
              "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar."
            )}
          </p>
        </div>
        {primaryPath ? (
          <ButtonLink href="#progreso" label="Continuar plan" />
        ) : isAdmin ? (
          <ButtonLink
            href={routes.DASHBOARD_ADMIN_USERS}
            label="Ir a usuarios"
          />
        ) : null}
      </div>
    </section>
  );
}
