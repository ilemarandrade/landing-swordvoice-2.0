import type {
  PathDetail,
  PathProgress,
  RequiredCertification,
  Subtopic,
  Topic,
} from "@/features/paths/schemas/path.schema";

export type StepStatus = "done" | "current" | "pending" | null;

export type TrailTopicItem = {
  kind: "topic";
  topic: Topic;
  index: number;
  subtopics: Subtopic[];
  completedSubtopicIds: string[];
  completedCount: number;
  status: StepStatus;
};

export type TrailTrialItem = {
  kind: "trial";
  certification: RequiredCertification;
  index: number;
  status: StepStatus;
};

export type TrailItem = TrailTopicItem | TrailTrialItem;

export type Trail = {
  items: TrailItem[];
  topicCount: number;
  resourceCount: number;
  requiredCount: number;
  earnedCount: number;
  percent: number;
  isComplete: boolean;
};

const byPosition = (a: { position: number }, b: { position: number }) =>
  a.position - b.position;

export function buildTrail(path: PathDetail, progress?: PathProgress): Trail {
  const topics = [...path.topics].sort(byPosition);
  const earned = new Set(progress?.earnedCertificationIds ?? []);
  const completed = new Set(progress?.completedSubtopicIds ?? []);

  // Cada prueba requerida va después del último tema que la referencia.
  const lastTopicIndex = new Map<string, number>();
  topics.forEach((topic, index) =>
    topic.certifications.forEach((c) => {
      lastTopicIndex.set(c.externalId, index);
    }),
  );

  const items: TrailItem[] = [];
  let trialIndex = 0;
  let currentAssigned = false;

  const trialStatus = (c: RequiredCertification): StepStatus =>
    progress ? (earned.has(c.id) ? "done" : "pending") : null;

  const pushTrial = (certification: RequiredCertification) => {
    items.push({
      kind: "trial",
      certification,
      index: trialIndex++,
      status: trialStatus(certification),
    });
  };

  topics.forEach((topic, index) => {
    const subtopics = [...topic.subtopics].sort(byPosition);
    const completedSubtopicIds = subtopics
      .filter((s) => completed.has(s.id))
      .map((s) => s.id);
    const completedCount = completedSubtopicIds.length;

    let status: StepStatus = null;
    if (progress) {
      const certificationsDone = topic.certifications.every((c) =>
        earned.has(c.id),
      );
      if (completedCount === subtopics.length && certificationsDone) {
        status = "done";
      } else if (!currentAssigned && !topic.isOptional) {
        currentAssigned = true;
        status = "current";
      } else {
        status = "pending";
      }
    }

    items.push({
      kind: "topic",
      topic,
      index,
      subtopics,
      completedSubtopicIds,
      completedCount,
      status,
    });
    path.requiredCertifications
      .filter((c) => lastTopicIndex.get(c.externalId) === index)
      .forEach(pushTrial);
  });

  path.requiredCertifications
    .filter((c) => !lastTopicIndex.has(c.externalId))
    .forEach(pushTrial);

  const requiredCount = path.requiredCertifications.length;
  const earnedCount = path.requiredCertifications.filter((c) =>
    earned.has(c.id),
  ).length;
  const requiredSubtopics = topics
    .filter((t) => !t.isOptional)
    .flatMap((t) => t.subtopics);
  const completedSubtopics = requiredSubtopics.filter((s) =>
    completed.has(s.id),
  ).length;
  const total = requiredSubtopics.length + requiredCount;

  return {
    items,
    topicCount: topics.length,
    resourceCount: topics.reduce((sum, t) => sum + t.subtopics.length, 0),
    requiredCount,
    earnedCount,
    percent: total
      ? Math.round(((completedSubtopics + earnedCount) / total) * 100)
      : 0,
    isComplete:
      progress !== undefined &&
      requiredCount > 0 &&
      earnedCount === requiredCount,
  };
}
