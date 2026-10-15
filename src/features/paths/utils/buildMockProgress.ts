import type {
  PathDetail,
  PathProgress,
} from "@/features/paths/schemas/path.schema";

// Progreso de ejemplo hasta que exista el endpoint de progreso del usuario:
// primer tema completo y primera prueba requerida superada.
export function buildMockProgress(path: PathDetail): PathProgress {
  const firstTopic = [...path.topics].sort((a, b) => a.position - b.position)[0];
  return {
    completedSubtopicIds: firstTopic?.subtopics.map((s) => s.id) ?? [],
    earnedCertificationIds: path.requiredCertifications
      .slice(0, 1)
      .map((c) => c.id),
  };
}
