import type { AcademyRole } from "@/common/api/auth.schema";

export const academyRoleLabels: Record<AcademyRole, string> = {
  ADMIN: "Admin",
  MENTOR: "Mentor",
  APPRENTICE: "Aprendiz",
  NEWCOMER: "Nuevo",
};
