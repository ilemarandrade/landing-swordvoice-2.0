"use client";
import { useState } from "react";
import SwordHiltVerticalIcon from "@/common/assets/icons/SwordHiltVerticalIcon";
import { RankStep } from "@/features/paths/components/path-detail/path-trail/rank-step";
import { TopicStep } from "@/features/paths/components/path-detail/path-trail/topic-step";
import { TrailUnderConstruction } from "@/features/paths/components/path-detail/path-trail/trail-under-construction";
import { TrialStep } from "@/features/paths/components/path-detail/path-trail/trial-step";
import type { Trail, TrailTopicItem } from "@/features/paths/utils/buildTrail";

type PathTrailProps = { pathName: string; trail: Trail; hasProgress: boolean };

export function PathTrail({ pathName, trail, hasProgress }: PathTrailProps) {
  const topicItems = trail.items.filter((i): i is TrailTopicItem => i.kind === "topic");
  const initialOpen = (topicItems.find((i) => i.status === "current") ?? topicItems[0])?.topic.id;
  const [openTopicId, setOpenTopicId] = useState<string | undefined>(initialOpen);

  if (topicItems.length === 0) return <TrailUnderConstruction />;

  return (
    <section aria-label="Camino del path">
      <ol className="relative list-none pl-16">
        <li aria-hidden="true" className="relative min-h-[76px]">
          <span className="absolute -left-[57px] top-0 text-secondary"><SwordHiltVerticalIcon /></span>
        </li>
        {trail.items.map((item) =>
          item.kind === "topic" ? (
            <TopicStep
              key={item.topic.id}
              item={item}
              hasProgress={hasProgress}
              isOpen={openTopicId === item.topic.id}
              onToggle={() => setOpenTopicId((id) => (id === item.topic.id ? undefined : item.topic.id))}
            />
          ) : (
            <TrialStep key={item.certification.id} item={item} />
          ),
        )}
        <RankStep pathName={pathName} requiredCount={trail.requiredCount} isComplete={trail.isComplete} />
        <li aria-hidden="true" className="relative h-6">
          <span className={`absolute -left-[41px] top-0 h-0 w-0 border-x-8 border-t-[24px] border-x-transparent ${trail.isComplete ? "border-t-secondary" : "border-t-white/15"}`} />
        </li>
      </ol>
    </section>
  );
}
