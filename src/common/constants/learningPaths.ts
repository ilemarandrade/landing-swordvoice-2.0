export const LEARNING_PATH_IDS = ["initiated", "wanderer"] as const;

export type LearningPathId = (typeof LEARNING_PATH_IDS)[number];

type LearningPath = { name: string; role: string };

export const learningPaths: Record<LearningPathId, LearningPath> = {
  initiated: { name: "Initiated", role: "Jr Frontend Developer" },
  wanderer: { name: "Wanderer", role: "Jr Backend Developer" },
};
