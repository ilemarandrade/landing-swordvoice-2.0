import type { PathRole } from "@/common/api/auth.schema";

export type PathRoleType = PathRole["role"];

export const pathRoleLabels: Record<PathRoleType, string> = {
  APPRENTICE: "Aprendiz",
  MENTOR: "Mentor",
};
