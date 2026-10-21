export const adminMessages = {
  ROLE_ASSIGNED: "Rol asignado",
  ROLE_REMOVED: "Rol quitado",
  USER_NOT_FOUND: "Este usuario ya no existe.",
  USER_LOAD_FAILED: "No pudimos cargar este usuario.",
  NO_USERS: "Todavía no hay usuarios",
  NO_FILTER_RESULTS: "No hay usuarios que coincidan con los filtros.",
  noResults: (search: string) => `No encontramos usuarios con «${search}»`,
} as const;
