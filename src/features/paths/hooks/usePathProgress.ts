import { useMemo } from "react";
import type { PathDetail } from "@/features/paths/schemas/path.schema";
import { buildMockProgress } from "@/features/paths/utils/buildMockProgress";

// Único punto a cambiar cuando exista el endpoint de progreso.
export function usePathProgress(path?: PathDetail) {
  const progress = useMemo(
    () => (path ? buildMockProgress(path) : undefined),
    [path],
  );
  return { progress };
}
