export type UsersAdminParams = {
  search: string;
  page: number;
  userId: string | null;
};

type RawParams = {
  search?: string | string[];
  page?: string | string[];
  user?: string | string[];
};

const single = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

// Valores ausentes, repetidos o inválidos vuelven al estado inicial (página 1, sin búsqueda).
export function readUsersAdminParams({
  search,
  page,
  user,
}: RawParams): UsersAdminParams {
  const parsedPage = Number.parseInt(single(page), 10);
  return {
    search: single(search).trim().slice(0, 100),
    page: Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1,
    userId: single(user) || null,
  };
}
