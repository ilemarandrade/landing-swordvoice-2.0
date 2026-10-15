import CheckIcon from "@/common/assets/icons/CheckIcon";
import ChevronIcon from "@/common/assets/icons/ChevronIcon";
import ExternalLinkIcon from "@/common/assets/icons/ExternalLinkIcon";
import type { TrailTopicItem } from "@/features/paths/utils/buildTrail";
import { padPosition } from "@/features/paths/utils/format";

type TopicStepProps = {
  item: TrailTopicItem;
  isOpen: boolean;
  onToggle: () => void;
  hasProgress: boolean;
};

const STATUS_LABEL = { done: "Completado", current: "En curso", pending: "Pendiente" } as const;

export function TopicStep({ item, isOpen, onToggle, hasProgress }: TopicStepProps) {
  const { topic, subtopics, completedCount, status, index } = item;
  const panelId = `topic-panel-${topic.id}`;
  const certificationsLabel = topic.certifications.length === 1 ? "prueba" : "pruebas";

  return (
    <li className="relative pb-4">
      <span aria-hidden="true" className={`absolute -left-[35px] top-0 h-full w-1 rounded ${status === "done" ? "bg-secondary" : "bg-white/15"}`} />
      <span aria-hidden="true" className={`absolute -left-[46px] top-[22px] grid h-6 w-6 rotate-45 place-items-center rounded border-2 ${
        status === "done" ? "border-secondary bg-secondary text-black"
          : status === "current" ? "border-primary bg-black shadow-[0_0_0_4px_rgba(255,122,0,.12)]"
            : "border-white/25 bg-black"
      }`}>
        {status === "done" && <span className="-rotate-45"><CheckIcon /></span>}
      </span>
      <div className={`overflow-hidden rounded-[18px] border bg-[#000E2799] ${status === "current" ? "border-primary" : "border-white/15"}`}>
        <button type="button" onClick={onToggle} aria-expanded={isOpen} aria-controls={panelId} className="flex min-h-[68px] w-full items-center gap-4 px-5 py-3 text-left text-white">
          <span className="min-w-9 font-sedgwick text-[26px] leading-none text-secondary">{padPosition(index)}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold">{topic.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-[#9A9AAE]">
              {topic.isOptional && <span className="rounded-full border border-white/25 px-2 py-0.5 text-[11px] uppercase tracking-wider">Opcional</span>}
              <span>{subtopics.length} recurso{subtopics.length === 1 ? "" : "s"}</span>
              {topic.certifications.length > 0 && <span>· {topic.certifications.length} {certificationsLabel}</span>}
              {status && (
                <span className={status === "done" ? "text-secondary" : status === "current" ? "text-primary" : ""}>
                  · {STATUS_LABEL[status]}{subtopics.length > 0 ? ` (${completedCount}/${subtopics.length})` : ""}
                </span>
              )}
            </span>
          </span>
          <span className={`flex-none text-[#C9C9D6] transition-transform ${isOpen ? "rotate-180" : ""}`}><ChevronIcon /></span>
        </button>
        {isOpen && (
          <div id={panelId} role="region" aria-label={topic.title} className="flex flex-col gap-5 px-5 pb-5 pt-1 md:pl-[72px]">
            {topic.description && <p className="text-[15px] text-[#C9C9D6]">{topic.description}</p>}
            {subtopics.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#9A9AAE]">Recursos</p>
                <ol className="flex flex-col border-t border-white/15">
                  {subtopics.map((subtopic) => {
                    const isDone = hasProgress && item.completedSubtopicIds.includes(subtopic.id);
                    return (
                      <li key={subtopic.id} className="flex items-start gap-3 border-b border-white/15 py-2.5">
                        {hasProgress && (
                          <span aria-label={isDone ? "Completado" : "Pendiente"} className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md border-2 text-black ${isDone ? "border-secondary bg-secondary" : "border-white/25"}`}>
                            {isDone && <CheckIcon />}
                          </span>
                        )}
                        <div>
                          {subtopic.url ? (
                            <a href={subtopic.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center gap-1 font-semibold text-primary hover:text-[#FFA34D]">
                              {subtopic.title}
                              <ExternalLinkIcon />
                              <span className="sr-only"> (se abre en una pestaña nueva)</span>
                            </a>
                          ) : (
                            <span className="font-semibold text-white">{subtopic.title}</span>
                          )}
                          {subtopic.description && <p className="text-[13px] text-[#9A9AAE]">{subtopic.description}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
            {topic.certifications.map((certification) => (
              <div key={certification.id} className="rounded-xl border border-dashed border-white/25 p-3.5">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9A9AAE]">Módulos de {certification.name}</p>
                <ol className="ml-[18px] mt-2 list-decimal text-sm text-[#C9C9D6]">
                  {[...certification.modules].sort((a, b) => a.position - b.position).map((module) => (
                    <li key={module.externalId}>{module.title}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
