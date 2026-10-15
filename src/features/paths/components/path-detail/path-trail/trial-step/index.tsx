import CheckIcon from "@/common/assets/icons/CheckIcon";
import ExternalLinkIcon from "@/common/assets/icons/ExternalLinkIcon";
import SwordsIcon from "@/common/assets/icons/SwordsIcon";
import type { TrailTrialItem } from "@/features/paths/utils/buildTrail";
import { providerLabel, toRoman } from "@/features/paths/utils/format";

type TrialStepProps = { item: TrailTrialItem };

export function TrialStep({ item }: TrialStepProps) {
  const { certification, index, status } = item;
  const isDone = status === "done";

  return (
    <li className="relative pb-4">
      <span aria-hidden="true" className={`absolute -left-[34px] top-0 h-full w-1 rounded ${isDone ? "bg-secondary" : "bg-white/15"}`} />
      <span aria-hidden="true" className={`absolute -left-[54px] top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-secondary ${isDone ? "bg-secondary text-black" : "bg-black text-secondary"}`}>
        {isDone ? <CheckIcon width={18} /> : <SwordsIcon />}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] border border-secondary bg-gradient-to-r from-secondary/[0.08] to-transparent px-5 py-4">
        <div className="min-w-[200px] flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
            Prueba {toRoman(index)}{isDone ? " · Superada" : ""}
          </p>
          <p className="mt-0.5 font-bold text-white">{certification.name}</p>
        </div>
        <a href={certification.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:text-[#FFA34D]">
          Ver en {providerLabel(certification.provider)}
          <ExternalLinkIcon />
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </li>
  );
}
