import { CertificationItem } from "@/features/paths/components/path-detail/required-certifications/certification-item";
import type { PathProgress, RequiredCertification } from "@/features/paths/schemas/path.schema";

type RequiredCertificationsProps = {
  certifications: RequiredCertification[];
  progress?: PathProgress;
};

export function RequiredCertifications({ certifications, progress }: RequiredCertificationsProps) {
  const earned = new Set(progress?.earnedCertificationIds ?? []);
  const earnedCount = certifications.filter((c) => earned.has(c.id)).length;
  const subtitle =
    certifications.length === 0
      ? "Aún no hay pruebas definidas."
      : progress
        ? `${earnedCount} de ${certifications.length} superadas`
        : `Necesitas estas ${certifications.length} certificaciones gratuitas para aprobar el path.`;

  return (
    <aside aria-labelledby="required-title" className="flex flex-col gap-4 rounded-[18px] border border-white/15 bg-[#000E2799] p-6 lg:sticky lg:top-24 lg:order-2">
      <h2 id="required-title" className="font-sedgwick text-[22px] leading-snug text-secondary">Pruebas requeridas</h2>
      <p className="-mt-2 text-[13px] leading-snug text-[#9A9AAE]">{subtitle}</p>
      {certifications.length > 0 && (
        <ul className="flex flex-col gap-3">
          {certifications.map((certification) => (
            <CertificationItem
              key={certification.id}
              certification={certification}
              isEarned={progress ? earned.has(certification.id) : undefined}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}
