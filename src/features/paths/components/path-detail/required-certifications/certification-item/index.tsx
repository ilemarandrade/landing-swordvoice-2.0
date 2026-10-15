import ExternalLinkIcon from "@/common/assets/icons/ExternalLinkIcon";
import ShieldIcon from "@/common/assets/icons/ShieldIcon";
import type { RequiredCertification } from "@/features/paths/schemas/path.schema";
import { providerLabel } from "@/features/paths/utils/format";

type CertificationItemProps = {
  certification: RequiredCertification;
  isEarned?: boolean;
};

export function CertificationItem({ certification, isEarned }: CertificationItemProps) {
  return (
    <li className={`flex gap-3 rounded-xl border p-3.5 ${isEarned ? "border-secondary" : "border-white/15"}`}>
      <span className={`flex-none ${isEarned ? "text-secondary" : "text-[#9A9AAE]"}`}>
        <ShieldIcon width={28} />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-bold leading-snug text-white">{certification.name}</p>
        <p className="mb-1.5 mt-0.5 text-[13px] text-[#9A9AAE]">{providerLabel(certification.provider)}</p>
        {isEarned !== undefined && (
          <p className={`text-[13px] ${isEarned ? "text-secondary" : "text-[#9A9AAE]"}`}>
            {isEarned ? "Superada" : "Pendiente"}
          </p>
        )}
        <a href={certification.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[15px] font-semibold text-primary hover:text-[#FFA34D]">
          Ir a la certificación
          <ExternalLinkIcon />
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </li>
  );
}
