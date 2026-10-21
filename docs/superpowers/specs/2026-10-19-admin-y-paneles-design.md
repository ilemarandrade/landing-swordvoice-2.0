# Admin y paneles por rol — Diseño

**Fecha:** 2026-10-19 · **Estado:** aprobado en conversación, pendiente de revisión escrita

Sub-proyecto 5 de 5 de la integración "Cuentas, roles por path y perfil". Depende del sub-proyecto 1 (`useMeQuery`, `useCurrentUser`, guard privado), del 2 (`isApiErrorCode`, ya en `common` desde el 4) y del 4 (entrada "Mi perfil" en `dashboardNav`).

## Objetivo

Que el dashboard cambie según `me.role` y `me.pathRoles`, y que un `ADMIN` busque usuarios y les asigne o quite roles por path (`MENTOR` / `APPRENTICE`) desde `/dashboard/admin/users`, con el detalle en un panel lateral.

## Decisiones del usuario

- El detalle del usuario va en un **panel lateral** sobre la lista, no en una página propia.
- Cuenta sin roles por path: **solo un mensaje**, sin botón: "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar."
- Rutas nuevas en inglés; sistema de diseño existente.

## Fuera de alcance

- Cambiar el rol global (`USER` ↔ `ADMIN`): no hay endpoint.
- Paneles reales de mentor y aprendiz (features 4 y 6 del roadmap), elegir entre varios paths.
- Desactivar mentores u ordenarlos en la landing (feature 1-B), acciones en lote, exportar.

---

## 1. Contrato de la API (`swordvoice-api/src/modules/auth/controllers/users.controller.ts`)

- Solo `ADMIN`; un `USER` recibe 403 `FORBIDDEN`.
- `GET /users?search=&page=&limit=` → `data: { items: User[]; meta: { page, limit, total, totalPages } }` (mismo formato que `paginatedSchema`). `search` 1–100, sin distinguir mayúsculas, en nombre y correo; más reciente primero; `page` ≥ 1; `limit` 1–100 (20 por defecto).
- `GET /users/:id` → `data: User`. 404 `USER_NOT_FOUND`.
- `PUT /users/:id/path-roles/:pathId` `{ role: "MENTOR" | "APPRENTICE" }` → `data: User` (reemplaza el rol si ya tenía uno). 404 `USER_NOT_FOUND`, `PATH_NOT_FOUND`.
- `DELETE /users/:id/path-roles/:pathId` → `data: User`. 404 `USER_NOT_FOUND`, `PATH_ROLE_NOT_FOUND`.
- `User` es el mismo `userSchema` de `/auth/me` (sub-proyecto 1).

## 2. Dashboard según el rol

`useCurrentUser` (feature `dashboard`) pasa a devolver `{ name, primaryPath, primaryRole: "MENTOR" | "APPRENTICE" | null, isAdmin, hasPathRoles }` (primer elemento de `pathRoles`, que viene ordenado por nombre).

| Caso | Banner | Barra lateral | Slots |
|---|---|---|---|
| Sin roles, no admin | "Hola, {nombre}" + "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar." Sin botón | Sin "Mi path" | Ocultos |
| Sin roles, admin | "Hola, {nombre}" + "Administra usuarios y roles." + `ButtonLink` "Ir a usuarios" | Sin "Mi path"; con "Usuarios" | Ocultos |
| Con roles | "Estás en el path **{path}** como **{Mentor/Aprendiz}**." + "Continuar plan" (como hoy) | "Mi path" al path principal; "Usuarios" si es admin | Visibles |

- `RankCard`: "Por definir" sin roles (como hoy).
- `dashboardNav` gana `{ id: "usuarios", label: "Usuarios", href: routes.DASHBOARD_ADMIN_USERS, activePrefix: routes.DASHBOARD_ADMIN }`; la barra lateral la filtra por `isAdmin` y filtra "Mi path" por `hasPathRoles`.
- `DashboardSlots` se renderiza solo con roles (lo decide la página del dashboard a través de un componente de la feature que lee `useCurrentUser`).

## 3. Área de administración (feature `src/features/admin`)

**Ruta y guard**
- `src/app/(app)/dashboard/admin/layout.tsx`: `<AdminGuard>{children}</AdminGuard>`. `AdminGuard` (exportado por la feature): con `me` cargado y `role !== "ADMIN"` → `router.replace(routes.DASHBOARD)` y no renderiza nada. Es una barrera de UI; la seguridad real la pone la API.
- `src/app/(app)/dashboard/admin/users/page.tsx`: metadata `title: "Usuarios"`; lee `searchParams` (`search`, `page`, `user`) y pasa `{ search, page, userId }` a `<UsersAdmin />`.
- `routes.DASHBOARD_ADMIN = "/dashboard/admin"`, `routes.DASHBOARD_ADMIN_USERS = "/dashboard/admin/users"`.

**Estado en la URL**: `?search=ana&page=2&user=<id>`; los cambios se aplican con `router.replace` (sin `useSearchParams` ni `Suspense`). `page` inválida → 1.

**Lista**
- Buscador: formulario con `InputController` "Buscar por nombre o correo"; debounce de 300 ms; al cambiar la búsqueda, `page` vuelve a 1; `search` vacío se quita de la URL.
- `useUsersQuery({ search, page })`: `GET /users` con `{ page, limit: 20, search? }` (sin `search` si está vacío); key `["users", { search, page }]`; `placeholderData: keepPreviousData`.
- Tabla (dentro de una card del dashboard, `overflow-x-auto` en móvil): Nombre, Correo, Confirmado ("Sí"/"No"), Roles (chips "{path} · {Mentor|Aprendiz}", o "Sin roles"), botón "Ver".
- Paginación: "Anterior" / "Siguiente" (deshabilitados en los extremos) y "Página {page} de {totalPages}". Sin resultados: "No encontramos usuarios con «{search}»" (o "Todavía no hay usuarios" sin búsqueda).

**Panel lateral**
- `aside` con `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al nombre; fijo a la derecha sobre un overlay `bg-black/60`. Se cierra con Esc, botón "Cerrar" o clic en el overlay (quita `user` de la URL). Al abrir, el foco va a "Cerrar".
- `useUserQuery(id)`: `GET /users/:id`, key `["users", id]`.
- Contenido: nombre, correo, confirmado, rol global ("Administrador"/"Usuario"); por cada path de `usePathsQuery` (movido a `src/common/hooks`, ver §4), una fila con el nombre del path y tres botones segmentados "Sin rol · Aprendiz · Mentor" con `aria-pressed` en el actual.
- Pulsar un botón distinto del actual: `PUT` con el rol, o `DELETE` para "Sin rol". Sin confirmación. Durante la petición los botones de esa fila quedan deshabilitados.
- `useAssignPathRoleMutation` / `useRemovePathRoleMutation`: `onSuccess` → `setQueryData(["users", id], user)` + invalidar solo las listas (`queryKey: ["users"]` con un predicado que exige un objeto en la segunda posición) + toast "Rol asignado" / "Rol quitado".

**Errores**

| Caso | Comportamiento |
|---|---|
| 404 `USER_NOT_FOUND` en el panel | "Este usuario ya no existe." y botón "Cerrar" |
| 404 `PATH_ROLE_NOT_FOUND` al quitar | Como éxito: se vuelve a pedir `["users", id]` |
| 404 `PATH_NOT_FOUND` | `notifyError` + invalidar `["paths"]` |
| 403 `FORBIDDEN` | `notifyError` + invalidar `["auth", "me"]` (el `AdminGuard` saca al usuario) |
| Resto | `notifyError` |

## 4. Refactor necesario

- `usePathsQuery` y `pathSummarySchema`/`PathSummary` pasan de `src/features/paths` a `src/common/hooks/usePathsQuery.ts` y `src/common/api/pathSummary.schema.ts` (segundo uso: feature `admin`, conventions §2). La feature `paths` importa desde `common`; su comportamiento no cambia.

## 5. Tests

- `useCurrentUser`: `primaryRole`, `isAdmin`, `hasPathRoles`.
- Dashboard: sin roles → mensaje sin botón, sin "Mi path", sin slots; admin sin roles → "Ir a usuarios"; con roles → "como Mentor"/"como Aprendiz"; "Usuarios" solo para admin.
- `AdminGuard`: `USER` redirigido; `ADMIN` ve el contenido; mientras carga `me`, nada.
- `useUsersQuery`: parámetros exactos (sin `search` vacío), schema paginado, `ApiError`.
- Mutations: `PUT`/`DELETE` exactos; caché del detalle actualizada; listas invalidadas; `PATH_ROLE_NOT_FOUND` como éxito; `FORBIDDEN` invalida `["auth","me"]`.
- Lista: debounce + vuelta a página 1 + URL; chips; paginación con extremos deshabilitados; vacío con y sin búsqueda.
- Panel: abre con `userId`; Esc cierra; `aria-pressed` en el rol actual; "Mentor" → `PUT`, "Sin rol" → `DELETE`; estado 404.

## 6. Criterio de cierre

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde; en local contra la API con una cuenta `ADMIN` y otra `USER`: el `USER` no ve "Usuarios" y `/dashboard/admin/users` lo devuelve al dashboard; el admin busca, pagina, abre un usuario, lo nombra Mentor en un path y la otra cuenta, al recargar, ve "como Mentor" y su "Mi path"; quitarle el rol vuelve al mensaje de espera.
