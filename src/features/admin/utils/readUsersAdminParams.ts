import { academyRoleSchema, type AcademyRole } from "@/common/api/auth.schema";

export type UsersAdminParams = {
  search: string;
  page: number;
  userId: string | null;
  academyRole: AcademyRole | null;
};

type RawParams = {
  search?: string | string[];
  page?: string | string[];
  user?: string | string[];
  academyRole?: string | string[];
};

const single = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

// Un valor repetido llega como array y no es un rol válido, así que cae en null.
const readAcademyRole = (value: string | string[] | undefined) => {
  const parsed = academyRoleSchema.safeParse(single(value));
  return parsed.success ? parsed.data : null;
};

// Valores ausentes, repetidos o inválidos vuelven al estado inicial (página 1, sin búsqueda, sin filtro de rol).
export function readUsersAdminParams({
  search,
  page,
  user,
  academyRole,
}: RawParams): UsersAdminParams {
  const parsedPage = Number.parseInt(single(page), 10);
  return {
    search: single(search).trim().slice(0, 100),
    page: Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1,
    userId: single(user) || null,
    academyRole: readAcademyRole(academyRole),
  };
}
