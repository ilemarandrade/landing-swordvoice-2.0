# Admin y paneles por rol — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Flujo del repo (CLAUDE.md):** en cada tarea el subagente `developer` hace los pasos de implementación y el `tester` los de tests; la sesión principal revisa contra `docs/architecture/conventions.md` y commitea con lint, typecheck, test y build en verde. Máximo 2 iteraciones developer↔tester por tarea.
>
> **Requisito previo:** los planes de los sub-proyectos 1 a 4 están implementados (`userSchema`, `useMeQuery`, `useCurrentUser`, `isApiErrorCode` en `src/common/api`, `dashboardNav` con "Mi perfil").

**Goal:** Que el dashboard cambie según `me.role` y `me.pathRoles`, y que un admin busque usuarios y les asigne o quite roles por path desde `/dashboard/admin/users` con un panel lateral.

**Architecture:** `useCurrentUser` (feature `dashboard`) deriva rol principal, admin y si hay roles; banner, barra lateral y slots solo leen ese hook. La feature nueva `admin` tiene su guard, las queries de usuarios, dos mutations que actualizan la caché del detalle e invalidan solo las listas, y una pantalla cuyo estado (búsqueda, página, usuario abierto) vive en la URL. `usePathsQuery` sube a `common` porque ahora lo usan `paths` y `admin`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, axios (`apiClient`), TanStack Query 5, zod 4, react-hook-form, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-19-admin-y-paneles-design.md`

## Global Constraints

- Rutas nuevas: `/dashboard/admin` (prefijo) y `/dashboard/admin/users`.
- Mensaje sin roles, exacto y sin botón: "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar."
- URL del admin: `?search=&page=&user=`; `page` 1 y `search` vacío no se escriben; cambios con `router.replace(…, { scroll: false })`.
- `GET /users` con `limit: 20`; `search` solo si no está vacío.
- Keys: listas `["users", { search, page }]`, detalle `["users", id]`. Una mutation actualiza el detalle con `setQueryData` e invalida solo las listas.
- Cambio de rol sin confirmación; "Sin rol" = `DELETE`.
- `AdminGuard` es barrera de UI; la API sigue siendo la que autoriza.
- Errores con `notifyError`. Sistema de diseño existente. Textos en español; imports con `@/`; sin `any`, `@ts-ignore`, `eslint-disable`.

## Review Focus

1. **Escribir rápido en el buscador:** una sola navegación tras 300 ms de pausa, no una por tecla — test en Task 4 (timers falsos).
2. **Un admin se quita el admin a sí mismo en otra pestaña** (la API pasa a responder 403): la pantalla no se queda rota; se invalida `me` y el guard lo devuelve al dashboard — test en Task 3 (mutation con `FORBIDDEN`).
3. **Quitar un rol que otro admin ya quitó** (`PATH_ROLE_NOT_FOUND`): no aparece un error; el panel se actualiza — test en Task 3.
4. **`?page=abc`, `?page=0` o `?page=-3` en la URL:** se trata como página 1 — test en Task 4 (`readUsersAdminParams`).
5. **Cuenta sin roles ni admin intenta entrar a "Mi path"**: no ve la entrada en la barra lateral — test en Task 2.

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/common/api/pathSummary.schema.ts` | crear (mover) | `pathSummarySchema`, `PathSummary` |
| `src/common/hooks/usePathsQuery.ts` (+ test) | mover desde `features/paths/hooks` | Lista de paths |
| `src/features/paths/schemas/path.schema.ts` | modificar | Ya no define `pathSummarySchema` |
| `src/common/constants/routes.ts` | modificar | `DASHBOARD_ADMIN`, `DASHBOARD_ADMIN_USERS` |
| `src/features/dashboard/hooks/useCurrentUser.ts` | modificar | `primaryRole`, `isAdmin`, `hasPathRoles` |
| `src/features/dashboard/hooks/useVisibleNavItems.ts` | crear | Entradas visibles de la barra lateral |
| `src/features/dashboard/constants/dashboardNav.ts` | modificar | Entrada "Usuarios" |
| `src/features/dashboard/components/dashboard-sidebar/index.tsx` | modificar | Usa `useVisibleNavItems` |
| `src/features/dashboard/components/welcome-banner/index.tsx` | modificar | Texto según el rol |
| `src/features/dashboard/components/dashboard-slots/index.tsx` | modificar | Oculto sin roles |
| `src/features/admin/hooks/useUsersQuery.ts`, `useUserQuery.ts`, `useAssignPathRoleMutation.ts`, `useRemovePathRoleMutation.ts`, `useAdminAccess.ts`, `useUsersAdminUrl.ts`, `useUserSearchForm.ts`, `useDialog.ts` | crear | Datos, guard, URL, buscador, diálogo |
| `src/features/admin/utils/pathRoleCache.ts`, `readUsersAdminParams.ts` | crear | Caché tras mutaciones; parámetros de la URL |
| `src/features/admin/constants/adminMessages.ts`, `pathRoleLabels.ts` | crear | Textos |
| `src/features/admin/components/admin-guard/index.tsx` | crear | Guard |
| `src/features/admin/components/users-admin/**` | crear | Pantalla, buscador, tabla, paginación, panel |
| `src/features/admin/index.ts` | crear | Exporta `AdminGuard`, `UsersAdmin`, `readUsersAdminParams` |
| `src/app/(app)/dashboard/admin/layout.tsx`, `users/page.tsx` | crear | Rutas |

---

### Task 1: `usePathsQuery` a `common`

**Files:**
- Create: `src/common/api/pathSummary.schema.ts`
- Move: `src/features/paths/hooks/usePathsQuery.ts` → `src/common/hooks/usePathsQuery.ts`; `src/features/paths/hooks/usePathsQuery.test.ts` → `src/common/hooks/usePathsQuery.test.ts`
- Modify: `src/features/paths/schemas/path.schema.ts` y todos los imports de `usePathsQuery`, `pathSummarySchema` y `PathSummary`

**Interfaces:**
- Produces: `pathSummarySchema`, `type PathSummary` en `@/common/api/pathSummary.schema`; `usePathsQuery()` en `@/common/hooks/usePathsQuery` (misma firma y key `["paths"]`).

- [ ] **Step 1 (developer): Crear `src/common/api/pathSummary.schema.ts`** con el bloque movido desde `path.schema.ts`:

```ts
import { z } from "zod";

export const pathSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  currentVersion: z.number(),
});

export type PathSummary = z.infer<typeof pathSummarySchema>;
```

En `src/features/paths/schemas/path.schema.ts`, borrar `pathSummarySchema` y `export type PathSummary`.

- [ ] **Step 2 (developer): Mover el hook y su test**

```bash
git mv src/features/paths/hooks/usePathsQuery.ts src/common/hooks/usePathsQuery.ts
git mv src/features/paths/hooks/usePathsQuery.test.ts src/common/hooks/usePathsQuery.test.ts
```

En el hook movido, cambiar el import del schema a `@/common/api/pathSummary.schema`. En todo `src/`, reemplazar `@/features/paths/hooks/usePathsQuery` por `@/common/hooks/usePathsQuery` y los imports de `PathSummary`/`pathSummarySchema` desde `@/features/paths/schemas/path.schema` por `@/common/api/pathSummary.schema` (`grep -rn "usePathsQuery\|PathSummary\|pathSummarySchema" src`).

- [ ] **Step 3 (developer):** `pnpm lint && pnpm typecheck && pnpm test` → pasan sin cambiar ningún test salvo rutas de import.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "refactor: :recycle: move usePathsQuery to common for its second feature

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Dashboard según el rol

**Files:**
- Modify: `src/common/constants/routes.ts`, `src/features/dashboard/hooks/useCurrentUser.ts`, `src/features/dashboard/constants/dashboardNav.ts`, `src/features/dashboard/components/dashboard-sidebar/index.tsx`, `src/features/dashboard/components/welcome-banner/index.tsx`, `src/features/dashboard/components/dashboard-slots/index.tsx`
- Create: `src/features/dashboard/hooks/useVisibleNavItems.ts`
- Test: `src/features/dashboard/hooks/useCurrentUser.test.ts` (actualizar), `src/features/dashboard/hooks/useVisibleNavItems.test.ts`, `src/features/dashboard/components/welcome-banner/index.test.tsx`, `src/features/dashboard/components/dashboard-slots/index.test.tsx`

**Interfaces:**
- Consumes: `useMeQuery`, `useMyPathHref`.
- Produces:
  - `useCurrentUser(): { name: string; primaryPath: { slug: string; name: string } | null; primaryRole: "MENTOR" | "APPRENTICE" | null; isAdmin: boolean; hasPathRoles: boolean }`
  - `useVisibleNavItems(): { items: DashboardNavItem[] }`
  - `routes.DASHBOARD_ADMIN = "/dashboard/admin"`, `routes.DASHBOARD_ADMIN_USERS = "/dashboard/admin/users"`

- [ ] **Step 1 (developer): `routes.ts`** — añadir después de `DASHBOARD_PROFILE`:

```ts
  DASHBOARD_ADMIN: "/dashboard/admin",
  DASHBOARD_ADMIN_USERS: "/dashboard/admin/users",
```

- [ ] **Step 2 (developer): Reescribir `src/features/dashboard/hooks/useCurrentUser.ts`**

```ts
import { useMeQuery } from "@/common/hooks/useMeQuery";

export function useCurrentUser() {
  const { data } = useMeQuery();
  // pathRoles viene ordenado por nombre del path: el primero es el principal.
  const primary = data?.pathRoles[0] ?? null;
  return {
    name: data?.name ?? "",
    primaryPath: primary && { slug: primary.path.slug, name: primary.path.name },
    primaryRole: primary?.role ?? null,
    isAdmin: data?.role === "ADMIN",
    hasPathRoles: primary !== null,
  };
}
```

- [ ] **Step 3 (developer): `dashboardNav.ts`** — añadir después de `{ id: "inicio", … }`:

```ts
  {
    id: "usuarios",
    label: "Usuarios",
    href: routes.DASHBOARD_ADMIN_USERS,
    activePrefix: routes.DASHBOARD_ADMIN,
  },
```

- [ ] **Step 4 (developer): Crear `src/features/dashboard/hooks/useVisibleNavItems.ts`**

```ts
import { dashboardNav } from "@/features/dashboard/constants/dashboardNav";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";
import { useMyPathHref } from "@/features/dashboard/hooks/useMyPathHref";

export function useVisibleNavItems() {
  const { isAdmin, hasPathRoles } = useCurrentUser();
  const { myPathHref } = useMyPathHref();

  const items = dashboardNav
    // "Usuarios" solo para admin; "Mi path" solo con un path asignado.
    .filter((item) => (item.id !== "usuarios" || isAdmin) && (item.id !== "path" || hasPathRoles))
    .map((item) => (item.id === "path" ? { ...item, href: myPathHref } : item));

  return { items };
}
```

- [ ] **Step 5 (developer): En `dashboard-sidebar/index.tsx`** reemplazar `useMyPathHref` y el `map` por el hook nuevo:

```tsx
import { useVisibleNavItems } from "@/features/dashboard/hooks/useVisibleNavItems";
```

```tsx
  const { activeItem } = useActiveNavItem();
  const { items } = useVisibleNavItems();
```

```tsx
        {items.map((item) => (
          <SidebarNavItem key={item.id} item={item} isActive={item.id === activeItem.id} />
        ))}
```

(quitar los imports de `dashboardNav` y `useMyPathHref` si quedan sin uso).

- [ ] **Step 6 (developer): Reescribir `welcome-banner/index.tsx`**

```tsx
"use client";
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

const ROLE_LABELS = { MENTOR: "Mentor", APPRENTICE: "Aprendiz" } as const;

export function WelcomeBanner() {
  const { name, primaryPath, primaryRole, isAdmin } = useCurrentUser();

  return (
    <section className="relative flex min-h-[200px] items-end overflow-hidden rounded-[18px] bg-ourPathsBackground bg-cover bg-center">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
      <div className="relative flex w-full flex-wrap items-end justify-between gap-5 p-5 md:p-9">
        <div className="flex max-w-xl flex-col gap-2.5">
          <h2 className="font-sedgwick break-words text-[32px] leading-tight md:text-5xl">
            Hola, <span className="text-primary">{name}</span>
          </h2>
          <p className="text-[17px] leading-normal text-[#E6E6EE]">
            {primaryPath && primaryRole ? (
              <>
                Estás en el path <strong className="text-secondary">{primaryPath.name}</strong>{" "}
                como <strong className="text-secondary">{ROLE_LABELS[primaryRole]}</strong>.
              </>
            ) : isAdmin ? (
              "Administra usuarios y roles."
            ) : (
              "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar."
            )}
          </p>
        </div>
        {primaryPath ? (
          <ButtonLink href="#progreso" label="Continuar plan" />
        ) : isAdmin ? (
          <ButtonLink href={routes.DASHBOARD_ADMIN_USERS} label="Ir a usuarios" />
        ) : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 7 (developer): En `dashboard-slots/index.tsx`** convertirlo en componente cliente que se oculta sin roles:

```tsx
"use client";
import { DashboardSlot } from "@/features/dashboard/components/dashboard-slots/dashboard-slot";
import { dashboardSlots } from "@/features/dashboard/constants/dashboardSlots";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

export function DashboardSlots() {
  const { hasPathRoles } = useCurrentUser();
  // Sin path asignado no hay plan del que hablar.
  if (!hasPathRoles) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {dashboardSlots.map((slot) => (
        <DashboardSlot key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
```

- [ ] **Step 8 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 9 (tester): Actualizar `useCurrentUser.test.ts`** (del sub-proyecto 1) para el nuevo retorno:

```ts
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

const initiated = { id: "p1", slug: "initiated", name: "Initiated" };
const wanderer = { id: "p2", slug: "wanderer", name: "Wanderer" };

describe("useCurrentUser", () => {
  it("returns empty values while /auth/me loads", () => {
    me.data = undefined;
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "",
      primaryPath: null,
      primaryRole: null,
      isAdmin: false,
      hasPathRoles: false,
    });
  });

  it("uses the first path role as the primary one", () => {
    me.data = {
      name: "Ana Pérez",
      role: "USER",
      pathRoles: [
        { path: initiated, role: "MENTOR" },
        { path: wanderer, role: "APPRENTICE" },
      ],
    };
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "Ana Pérez",
      primaryPath: { slug: "initiated", name: "Initiated" },
      primaryRole: "MENTOR",
      isAdmin: false,
      hasPathRoles: true,
    });
  });

  it("detects an admin without path roles", () => {
    me.data = { name: "Admin", role: "ADMIN", pathRoles: [] };
    expect(renderHook(() => useCurrentUser()).result.current).toMatchObject({
      isAdmin: true,
      hasPathRoles: false,
      primaryPath: null,
    });
  });
});
```

- [ ] **Step 10 (tester): Escribir `useVisibleNavItems.test.ts`**

```ts
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVisibleNavItems } from "@/features/dashboard/hooks/useVisibleNavItems";

const user = vi.hoisted(() => ({ isAdmin: false, hasPathRoles: false }));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({ useCurrentUser: () => user }));
vi.mock("@/features/dashboard/hooks/useMyPathHref", () => ({
  useMyPathHref: () => ({ myPathHref: "/dashboard/paths/initiated" }),
}));

function ids() {
  return renderHook(() => useVisibleNavItems()).result.current.items.map((item) => item.id);
}

describe("useVisibleNavItems", () => {
  it("hides Usuarios and Mi path for an account without roles", () => {
    Object.assign(user, { isAdmin: false, hasPathRoles: false });
    expect(ids()).not.toContain("usuarios");
    expect(ids()).not.toContain("path");
  });

  it("shows Mi path with the primary path href when there are roles", () => {
    Object.assign(user, { isAdmin: false, hasPathRoles: true });
    const path = renderHook(() => useVisibleNavItems()).result.current.items.find((item) => item.id === "path");
    expect(path?.href).toBe("/dashboard/paths/initiated");
  });

  it("shows Usuarios to admins", () => {
    Object.assign(user, { isAdmin: true, hasPathRoles: false });
    expect(ids()).toContain("usuarios");
  });
});
```

- [ ] **Step 11 (tester): Escribir `welcome-banner/index.test.tsx` y `dashboard-slots/index.test.tsx`**

```tsx
// src/features/dashboard/components/welcome-banner/index.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";

const user = vi.hoisted(() => ({
  name: "Ana",
  primaryPath: null as { slug: string; name: string } | null,
  primaryRole: null as "MENTOR" | "APPRENTICE" | null,
  isAdmin: false,
  hasPathRoles: false,
}));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({ useCurrentUser: () => user }));

describe("WelcomeBanner", () => {
  it("shows only the waiting message without roles", () => {
    Object.assign(user, { primaryPath: null, primaryRole: null, isAdmin: false });
    render(<WelcomeBanner />);
    expect(
      screen.getByText("Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("sends an admin without roles to the users area", () => {
    Object.assign(user, { primaryPath: null, primaryRole: null, isAdmin: true });
    render(<WelcomeBanner />);
    expect(screen.getByText("Administra usuarios y roles.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a usuarios" })).toHaveAttribute(
      "href",
      "/dashboard/admin/users",
    );
  });

  it.each([
    ["MENTOR", "Mentor"],
    ["APPRENTICE", "Aprendiz"],
  ] as const)("names the path and the role %s", (role, label) => {
    Object.assign(user, {
      primaryPath: { slug: "initiated", name: "Initiated" },
      primaryRole: role,
      isAdmin: false,
    });
    render(<WelcomeBanner />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText("Initiated")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar plan" })).toBeInTheDocument();
  });
});
```

```tsx
// src/features/dashboard/components/dashboard-slots/index.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardSlots } from "@/features/dashboard/components/dashboard-slots";

const user = vi.hoisted(() => ({ hasPathRoles: false }));
vi.mock("@/features/dashboard/hooks/useCurrentUser", () => ({ useCurrentUser: () => user }));

describe("DashboardSlots", () => {
  it("renders nothing without path roles", () => {
    user.hasPathRoles = false;
    expect(render(<DashboardSlots />).container).toBeEmptyDOMElement();
  });

  it("renders the slots with path roles", () => {
    user.hasPathRoles = true;
    expect(render(<DashboardSlots />).container).not.toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 12:** `pnpm test src/features/dashboard` → PASS.

- [ ] **Step 13: Commit**

```bash
git add src/common/constants/routes.ts src/features/dashboard
git commit -m "feat: :sparkles: adapt the dashboard to the account roles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Datos de admin, mutations y guard

**Files:**
- Create: `src/features/admin/constants/adminMessages.ts`, `src/features/admin/constants/pathRoleLabels.ts`, `src/features/admin/hooks/useUsersQuery.ts`, `src/features/admin/hooks/useUserQuery.ts`, `src/features/admin/utils/pathRoleCache.ts`, `src/features/admin/hooks/useAssignPathRoleMutation.ts`, `src/features/admin/hooks/useRemovePathRoleMutation.ts`, `src/features/admin/hooks/useAdminAccess.ts`, `src/features/admin/components/admin-guard/index.tsx`, `src/features/admin/index.ts`, `src/app/(app)/dashboard/admin/layout.tsx`
- Test: `src/features/admin/hooks/useUsersQuery.test.ts`, `src/features/admin/hooks/useAssignPathRoleMutation.test.ts`, `src/features/admin/hooks/useRemovePathRoleMutation.test.ts`, `src/features/admin/components/admin-guard/index.test.tsx`

**Interfaces:**
- Consumes: `userSchema`, `User`, `PathRole` (sub-proyecto 1), `paginatedSchema`, `isApiErrorCode`, `useMeQuery`, `routes`.
- Produces:
  - `USERS_PAGE_SIZE = 20`; `type UsersFilter = { search: string; page: number }`; `useUsersQuery(filter): UseQueryResult<{ items: User[]; meta: { page; limit; total; totalPages } }>`
  - `useUserQuery(id: string | null): UseQueryResult<User> & { isNotFound: boolean }`
  - `type PathRoleType = PathRole["role"]`
  - `useAssignPathRoleMutation(): UseMutationResult<User, Error, { userId: string; pathId: string; role: PathRoleType }>`
  - `useRemovePathRoleMutation(): UseMutationResult<User, Error, { userId: string; pathId: string }>`
  - `useAdminAccess(): { canRender: boolean }`, `AdminGuard({ children })`
  - `adminMessages`, `pathRoleLabels: Record<PathRoleType, string>`

- [ ] **Step 1 (developer): Constantes**

```ts
// src/features/admin/constants/adminMessages.ts
export const adminMessages = {
  ROLE_ASSIGNED: "Rol asignado",
  ROLE_REMOVED: "Rol quitado",
  USER_NOT_FOUND: "Este usuario ya no existe.",
  USER_LOAD_FAILED: "No pudimos cargar este usuario.",
  NO_USERS: "Todavía no hay usuarios",
  noResults: (search: string) => `No encontramos usuarios con «${search}»`,
} as const;
```

```ts
// src/features/admin/constants/pathRoleLabels.ts
import type { PathRole } from "@/common/api/auth.schema";

export type PathRoleType = PathRole["role"];

export const pathRoleLabels: Record<PathRoleType, string> = {
  APPRENTICE: "Aprendiz",
  MENTOR: "Mentor",
};
```

- [ ] **Step 2 (developer): Queries**

```ts
// src/features/admin/hooks/useUsersQuery.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { paginatedSchema } from "@/common/api/envelope";

export const USERS_PAGE_SIZE = 20;

export type UsersFilter = { search: string; page: number };

async function getUsers({ search, page }: UsersFilter) {
  const { data } = await apiClient.get("/users", {
    params: { page, limit: USERS_PAGE_SIZE, ...(search ? { search } : {}) },
  });
  return paginatedSchema(userSchema).parse(data);
}

export function useUsersQuery(filter: UsersFilter) {
  return useQuery({
    queryKey: ["users", filter],
    queryFn: () => getUsers(filter),
    // La tabla no parpadea al cambiar de página o de búsqueda.
    placeholderData: keepPreviousData,
  });
}
```

```ts
// src/features/admin/hooks/useUserQuery.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";

async function getUser(id: string) {
  const { data } = await apiClient.get(`/users/${encodeURIComponent(id)}`);
  return userSchema.parse(data);
}

export function useUserQuery(id: string | null) {
  const query = useQuery({
    queryKey: ["users", id],
    queryFn: () => getUser(id ?? ""),
    enabled: id !== null,
  });
  return { ...query, isNotFound: isApiErrorCode(query.error, "USER_NOT_FOUND") };
}
```

- [ ] **Step 3 (developer): `src/features/admin/utils/pathRoleCache.ts`**

```ts
import type { QueryClient } from "@tanstack/react-query";
import type { User } from "@/common/api/auth.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { notifyError } from "@/common/errors/notifyError";

// El detalle se escribe con la respuesta; solo las listas (["users", { search, page }]) se recargan.
export function applyUpdatedUser(queryClient: QueryClient, user: User): void {
  queryClient.setQueryData(["users", user.id], user);
  void queryClient.invalidateQueries({
    queryKey: ["users"],
    predicate: (query) => typeof query.queryKey[1] === "object" && query.queryKey[1] !== null,
  });
}

export function handlePathRoleError(queryClient: QueryClient, error: unknown): void {
  // Sin permisos de admin: al recargar /auth/me el AdminGuard saca al usuario del área.
  if (isApiErrorCode(error, "FORBIDDEN")) {
    void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }
  if (isApiErrorCode(error, "PATH_NOT_FOUND")) {
    void queryClient.invalidateQueries({ queryKey: ["paths"] });
  }
  notifyError(error);
}
```

- [ ] **Step 4 (developer): Mutations**

```ts
// src/features/admin/hooks/useAssignPathRoleMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import type { PathRoleType } from "@/features/admin/constants/pathRoleLabels";
import { applyUpdatedUser, handlePathRoleError } from "@/features/admin/utils/pathRoleCache";

type AssignPathRoleRequest = { userId: string; pathId: string; role: PathRoleType };

async function assignPathRole({ userId, pathId, role }: AssignPathRoleRequest) {
  const { data } = await apiClient.put(
    `/users/${encodeURIComponent(userId)}/path-roles/${encodeURIComponent(pathId)}`,
    { role },
  );
  return userSchema.parse(data);
}

export function useAssignPathRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignPathRole,
    onSuccess: (user) => {
      applyUpdatedUser(queryClient, user);
      toast.success(adminMessages.ROLE_ASSIGNED);
    },
    onError: (error) => handlePathRoleError(queryClient, error),
  });
}
```

```ts
// src/features/admin/hooks/useRemovePathRoleMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import { applyUpdatedUser, handlePathRoleError } from "@/features/admin/utils/pathRoleCache";

type RemovePathRoleRequest = { userId: string; pathId: string };

async function removePathRole({ userId, pathId }: RemovePathRoleRequest) {
  const { data } = await apiClient.delete(
    `/users/${encodeURIComponent(userId)}/path-roles/${encodeURIComponent(pathId)}`,
  );
  return userSchema.parse(data);
}

export function useRemovePathRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePathRole,
    onSuccess: (user) => {
      applyUpdatedUser(queryClient, user);
      toast.success(adminMessages.ROLE_REMOVED);
    },
    onError: (error, { userId }) => {
      // Otro admin ya lo quitó: no es un error, solo hay que recargar el usuario.
      if (isApiErrorCode(error, "PATH_ROLE_NOT_FOUND")) {
        void queryClient.invalidateQueries({ queryKey: ["users", userId], exact: true });
        return;
      }
      handlePathRoleError(queryClient, error);
    },
  });
}
```

- [ ] **Step 5 (developer): Guard**

```ts
// src/features/admin/hooks/useAdminAccess.ts
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/common/constants/routes";
import { useMeQuery } from "@/common/hooks/useMeQuery";

// Barrera de UI: la API responde 403 a quien no es admin.
export function useAdminAccess() {
  const router = useRouter();
  const { data } = useMeQuery();
  const isAdmin = data?.role === "ADMIN";
  const mustRedirect = data !== undefined && !isAdmin;

  useEffect(() => {
    if (mustRedirect) router.replace(routes.DASHBOARD);
  }, [mustRedirect, router]);

  return { canRender: isAdmin };
}
```

```tsx
// src/features/admin/components/admin-guard/index.tsx
"use client";
import type { ReactNode } from "react";
import { useAdminAccess } from "@/features/admin/hooks/useAdminAccess";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { canRender } = useAdminAccess();
  return canRender ? <>{children}</> : null;
}
```

```ts
// src/features/admin/index.ts
export { AdminGuard } from "@/features/admin/components/admin-guard";
```

```tsx
// src/app/(app)/dashboard/admin/layout.tsx
import type { ReactNode } from "react";
import { AdminGuard } from "@/features/admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
```

- [ ] **Step 6 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 7 (tester): Escribir `useUsersQuery.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { useUsersQuery } from "@/features/admin/hooks/useUsersQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const page = {
  items: [
    { id: "u1", email: "ana@example.com", name: "Ana", role: "USER", emailVerified: true, pathRoles: [] },
  ],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};
const ok = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

describe("useUsersQuery", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("omits an empty search", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));
    const { result } = renderHook(() => useUsersQuery({ search: "", page: 1 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users", { params: { page: 1, limit: 20 } });
    expect(result.current.data).toEqual(page);
  });

  it("sends the search and the page", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(page));
    const { result } = renderHook(() => useUsersQuery({ search: "ana", page: 2 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/users", { params: { page: 2, limit: 20, search: "ana" } });
  });

  it("exposes the ApiError and rejects an invalid page", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new ApiError(403, "x", "FORBIDDEN"));
    const forbidden = renderHook(() => useUsersQuery({ search: "", page: 1 }), { wrapper });
    await waitFor(() => expect(forbidden.result.current.error).toBeInstanceOf(ApiError));

    vi.mocked(apiClient.get).mockResolvedValueOnce(ok({ items: [{ id: 1 }], meta: page.meta }));
    const invalid = renderHook(() => useUsersQuery({ search: "x", page: 1 }), { wrapper });
    await waitFor(() => expect(invalid.result.current.isError).toBe(true));
  });
});
```

- [ ] **Step 8 (tester): Escribir los tests de las mutations**

```ts
// src/features/admin/hooks/useAssignPathRoleMutation.test.ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useAssignPathRoleMutation } from "@/features/admin/hooks/useAssignPathRoleMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { put: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  role: "USER",
  emailVerified: true,
  pathRoles: [{ path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" }],
};

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, ...renderHook(() => useAssignPathRoleMutation(), { wrapper }) };
}

describe("useAssignPathRoleMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.put).mockReset();
  });

  it("puts the role, writes the detail and invalidates only the lists", async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: user } as Awaited<ReturnType<typeof apiClient.put>>);
    const { client, result } = setup();
    client.setQueryData(["users", { search: "", page: 1 }], { items: [], meta: {} });
    act(() => result.current.mutate({ userId: "u1", pathId: "p1", role: "MENTOR" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.put).toHaveBeenCalledWith("/users/u1/path-roles/p1", { role: "MENTOR" });
    expect(client.getQueryData(["users", "u1"])).toEqual(user);
    expect(client.getQueryState(["users", { search: "", page: 1 }])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["users", "u1"])?.isInvalidated).toBe(false);
  });

  it("refetches /auth/me on FORBIDDEN", async () => {
    vi.mocked(apiClient.put).mockRejectedValue(new ApiError(403, "x", "FORBIDDEN"));
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1", role: "MENTOR" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
    expect(notifyError).toHaveBeenCalled();
  });

  it("refetches the paths on PATH_NOT_FOUND", async () => {
    vi.mocked(apiClient.put).mockRejectedValue(new ApiError(404, "x", "PATH_NOT_FOUND"));
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p9", role: "APPRENTICE" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["paths"] });
  });
});
```

```ts
// src/features/admin/hooks/useRemovePathRoleMutation.test.ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useRemovePathRoleMutation } from "@/features/admin/hooks/useRemovePathRoleMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { delete: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const user = { id: "u1", email: "a@x.com", name: "Ana", role: "USER", emailVerified: true, pathRoles: [] };

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, ...renderHook(() => useRemovePathRoleMutation(), { wrapper }) };
}

describe("useRemovePathRoleMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.delete).mockReset();
  });

  it("deletes the role and writes the detail", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: user } as Awaited<ReturnType<typeof apiClient.delete>>);
    const { client, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.delete).toHaveBeenCalledWith("/users/u1/path-roles/p1");
    expect(client.getQueryData(["users", "u1"])).toEqual(user);
  });

  it("treats PATH_ROLE_NOT_FOUND as already removed: no toast, reload the user", async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new ApiError(404, "x", "PATH_ROLE_NOT_FOUND"));
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ userId: "u1", pathId: "p1" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["users", "u1"], exact: true });
  });
});
```

- [ ] **Step 9 (tester): Escribir `admin-guard/index.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminGuard } from "@/features/admin/components/admin-guard";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

describe("AdminGuard", () => {
  beforeEach(() => {
    router.replace.mockReset();
  });

  it("renders nothing and does not redirect while /auth/me loads", () => {
    me.data = undefined;
    render(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.queryByText("zona admin")).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("sends a USER back to the dashboard", () => {
    me.data = { role: "USER" };
    render(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.queryByText("zona admin")).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("renders the area for an ADMIN", () => {
    me.data = { role: "ADMIN" };
    render(<AdminGuard>zona admin</AdminGuard>);
    expect(screen.getByText("zona admin")).toBeInTheDocument();
  });
});
```

- [ ] **Step 10:** `pnpm test src/features/admin` → PASS.

- [ ] **Step 11: Commit**

```bash
git add src/features/admin "src/app/(app)/dashboard/admin/layout.tsx"
git commit -m "feat: :sparkles: add admin user queries, path-role mutations and guard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Lista de usuarios con búsqueda y paginación

**Files:**
- Create: `src/features/admin/utils/readUsersAdminParams.ts`, `src/features/admin/hooks/useUsersAdminUrl.ts`, `src/features/admin/hooks/useUserSearchForm.ts`, `src/features/admin/components/users-admin/index.tsx`, `users-admin/user-search-form/index.tsx`, `users-admin/users-table/index.tsx`, `users-admin/users-pagination/index.tsx`, `src/app/(app)/dashboard/admin/users/page.tsx`
- Modify: `src/features/admin/index.ts`
- Test: `src/features/admin/utils/readUsersAdminParams.test.ts`, `src/features/admin/hooks/useUsersAdminUrl.test.ts`, `src/features/admin/components/users-admin/index.test.tsx`

**Interfaces:**
- Consumes: `useUsersQuery`, `USERS_PAGE_SIZE`, `pathRoleLabels`, `adminMessages` (Task 3).
- Produces:
  - `type UsersAdminParams = { search: string; page: number; userId: string | null }`; `readUsersAdminParams(params: { search?: string | string[]; page?: string | string[]; user?: string | string[] }): UsersAdminParams`
  - `useUsersAdminUrl(current: UsersAdminParams): { setSearch(search: string): void; setPage(page: number): void; openUser(id: string): void; closeUser(): void }`
  - `useUserSearchForm(currentSearch: string, onSearch: (search: string) => void): { control; onSubmit }`
  - `UsersAdmin(props: UsersAdminParams)` exportado en `@/features/admin`. En esta tarea el panel aún no existe: `UsersAdmin` no lo renderiza (Task 5 lo añade).

- [ ] **Step 1 (developer): `src/features/admin/utils/readUsersAdminParams.ts`**

```ts
export type UsersAdminParams = { search: string; page: number; userId: string | null };

type RawParams = {
  search?: string | string[];
  page?: string | string[];
  user?: string | string[];
};

const single = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

// Valores ausentes, repetidos o inválidos vuelven al estado inicial (página 1, sin búsqueda).
export function readUsersAdminParams({ search, page, user }: RawParams): UsersAdminParams {
  const parsedPage = Number.parseInt(single(page), 10);
  return {
    search: single(search).trim().slice(0, 100),
    page: Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1,
    userId: single(user) || null,
  };
}
```

- [ ] **Step 2 (developer): `src/features/admin/hooks/useUsersAdminUrl.ts`**

```ts
import { useRouter } from "next/navigation";
import { routes } from "@/common/constants/routes";
import type { UsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

export function useUsersAdminUrl(current: UsersAdminParams) {
  const router = useRouter();

  const navigate = (changes: Partial<UsersAdminParams>) => {
    const next = { ...current, ...changes };
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.page > 1) params.set("page", String(next.page));
    if (next.userId) params.set("user", next.userId);
    const query = params.toString();
    router.replace(
      query ? `${routes.DASHBOARD_ADMIN_USERS}?${query}` : routes.DASHBOARD_ADMIN_USERS,
      { scroll: false },
    );
  };

  return {
    // Una búsqueda nueva siempre empieza en la página 1.
    setSearch: (search: string) => navigate({ search, page: 1 }),
    setPage: (page: number) => navigate({ page }),
    openUser: (userId: string) => navigate({ userId }),
    closeUser: () => navigate({ userId: null }),
  };
}
```

- [ ] **Step 3 (developer): `src/features/admin/hooks/useUserSearchForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const SEARCH_DEBOUNCE_MS = 300;

const userSearchSchema = z.object({
  search: z.string().trim().max(100, "La búsqueda no puede superar 100 caracteres"),
});

type UserSearchValues = z.infer<typeof userSearchSchema>;

export function useUserSearchForm(currentSearch: string, onSearch: (search: string) => void) {
  const { control, handleSubmit } = useForm<UserSearchValues>({
    defaultValues: { search: currentSearch },
    resolver: zodResolver(userSearchSchema),
  });
  const search = useWatch({ control, name: "search" });

  // Busca al dejar de escribir; Enter busca al momento.
  useEffect(() => {
    const value = search.trim().slice(0, 100);
    if (value === currentSearch) return;
    const timer = setTimeout(() => onSearch(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, currentSearch, onSearch]);

  const onSubmit = handleSubmit(({ search: value }) => {
    if (value !== currentSearch) onSearch(value);
  });

  return { control, onSubmit };
}
```

(El schema vive aquí porque solo lo usa este hook; si el lint de la arquitectura exige `schemas/`, moverlo a `src/features/admin/schemas/userSearch.schema.ts`.)

- [ ] **Step 4 (developer): Componentes hijos**

```tsx
// users-admin/user-search-form/index.tsx
import { InputController } from "@/common/components/input-controller";
import type { useUserSearchForm } from "@/features/admin/hooks/useUserSearchForm";

type UserSearchFormProps = Pick<ReturnType<typeof useUserSearchForm>, "control" | "onSubmit">;

export function UserSearchForm({ control, onSubmit }: UserSearchFormProps) {
  return (
    <form noValidate role="search" onSubmit={onSubmit} className="max-w-md">
      <InputController
        control={control}
        name="search"
        label="Buscar por nombre o correo"
        type="search"
        autoComplete="off"
      />
    </form>
  );
}
```

```tsx
// users-admin/users-table/index.tsx
import type { User } from "@/common/api/auth.schema";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import { pathRoleLabels } from "@/features/admin/constants/pathRoleLabels";

type UsersTableProps = { users: User[]; search: string; onOpen: (userId: string) => void };

export function UsersTable({ users, search, onOpen }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p role="status" className="text-[#C9C9D6]">
        {search ? adminMessages.noResults(search) : adminMessages.NO_USERS}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[18px] border border-white/15 bg-[#000E2799]">
      <table className="w-full min-w-[640px] text-left text-[15px]">
        <thead className="border-b border-white/15 text-sm text-[#C9C9D6]">
          <tr>
            <th className="p-4 font-semibold">Nombre</th>
            <th className="p-4 font-semibold">Correo</th>
            <th className="p-4 font-semibold">Confirmado</th>
            <th className="p-4 font-semibold">Roles</th>
            <th className="p-4" aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-white/10 last:border-0">
              <td className="p-4">{user.name}</td>
              <td className="p-4 text-[#E6E6EE]">{user.email}</td>
              <td className="p-4">{user.emailVerified ? "Sí" : "No"}</td>
              <td className="p-4">
                {user.pathRoles.length === 0 ? (
                  <span className="text-[#C9C9D6]">Sin roles</span>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {user.pathRoles.map(({ path, role }) => (
                      <li key={path.id} className="rounded-full border border-primary/60 px-3 py-1 text-sm">
                        {path.name} · {pathRoleLabels[role]}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="p-4 text-right">
                <button
                  type="button"
                  onClick={() => onOpen(user.id)}
                  aria-label={`Ver ${user.name}`}
                  className="min-h-11 rounded-full px-4 font-semibold text-primary hover:text-[#FFA34D]"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```tsx
// users-admin/users-pagination/index.tsx
type UsersPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const buttonClassName =
  "min-h-11 rounded-full border-2 border-white/35 px-5 font-semibold hover:border-primary disabled:opacity-40 disabled:hover:border-white/35";

export function UsersPagination({ page, totalPages, onPageChange }: UsersPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex items-center gap-4">
      <button type="button" className={buttonClassName} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span className="text-sm text-[#C9C9D6]">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={buttonClassName}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}
```

- [ ] **Step 5 (developer): `users-admin/index.tsx`**

```tsx
"use client";
import { Button } from "@/common/components/button";
import { UserSearchForm } from "@/features/admin/components/users-admin/user-search-form";
import { UsersPagination } from "@/features/admin/components/users-admin/users-pagination";
import { UsersTable } from "@/features/admin/components/users-admin/users-table";
import { useUserSearchForm } from "@/features/admin/hooks/useUserSearchForm";
import { useUsersAdminUrl } from "@/features/admin/hooks/useUsersAdminUrl";
import { useUsersQuery } from "@/features/admin/hooks/useUsersQuery";
import type { UsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

export function UsersAdmin(params: UsersAdminParams) {
  const { search, page } = params;
  const url = useUsersAdminUrl(params);
  const searchForm = useUserSearchForm(search, url.setSearch);
  const users = useUsersQuery({ search, page });

  return (
    <>
      <h1 className="font-sedgwick text-[32px] md:text-5xl">
        <span className="text-primary">Usuarios</span>
      </h1>
      <UserSearchForm control={searchForm.control} onSubmit={searchForm.onSubmit} />
      {users.isError && !users.data ? (
        <div role="alert" className="flex flex-col items-start gap-4">
          <p>No pudimos cargar los usuarios.</p>
          <Button type="button" label="Reintentar" onClick={() => void users.refetch()} />
        </div>
      ) : users.data ? (
        <>
          <UsersTable users={users.data.items} search={search} onOpen={url.openUser} />
          <UsersPagination
            page={users.data.meta.page}
            totalPages={users.data.meta.totalPages}
            onPageChange={url.setPage}
          />
        </>
      ) : (
        <p role="status">Cargando usuarios…</p>
      )}
    </>
  );
}
```

- [ ] **Step 6 (developer): Exportar y crear la ruta**

En `src/features/admin/index.ts` añadir:

```ts
export { UsersAdmin } from "@/features/admin/components/users-admin";
export { readUsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";
```

```tsx
// src/app/(app)/dashboard/admin/users/page.tsx
import type { Metadata } from "next";
import { readUsersAdminParams, UsersAdmin } from "@/features/admin";

export const metadata: Metadata = { title: "Usuarios" };

type UsersRouteProps = {
  searchParams: Promise<{
    search?: string | string[];
    page?: string | string[];
    user?: string | string[];
  }>;
};

export default async function UsersRoute({ searchParams }: UsersRouteProps) {
  return <UsersAdmin {...readUsersAdminParams(await searchParams)} />;
}
```

- [ ] **Step 7 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 8 (tester): Escribir `readUsersAdminParams.test.ts` y `useUsersAdminUrl.test.ts`**

```ts
// src/features/admin/utils/readUsersAdminParams.test.ts
import { describe, expect, it } from "vitest";
import { readUsersAdminParams } from "@/features/admin/utils/readUsersAdminParams";

describe("readUsersAdminParams", () => {
  it("reads search, page and user", () => {
    expect(readUsersAdminParams({ search: " ana ", page: "2", user: "u1" })).toEqual({
      search: "ana",
      page: 2,
      userId: "u1",
    });
  });

  it.each(["abc", "0", "-3", undefined, ["2", "3"]])("treats page %j as 1", (page) => {
    expect(readUsersAdminParams({ page }).page).toBe(1);
  });

  it("defaults to no search and no open user", () => {
    expect(readUsersAdminParams({})).toEqual({ search: "", page: 1, userId: null });
  });
});
```

```ts
// src/features/admin/hooks/useUsersAdminUrl.test.ts
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUsersAdminUrl } from "@/features/admin/hooks/useUsersAdminUrl";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const current = { search: "ana", page: 3, userId: null };

describe("useUsersAdminUrl", () => {
  beforeEach(() => {
    router.replace.mockReset();
  });

  it("resets the page when the search changes", () => {
    renderHook(() => useUsersAdminUrl(current)).result.current.setSearch("luis");
    expect(router.replace).toHaveBeenCalledWith("/dashboard/admin/users?search=luis", { scroll: false });
  });

  it("drops an empty search and page 1 from the URL", () => {
    renderHook(() => useUsersAdminUrl(current)).result.current.setSearch("");
    expect(router.replace).toHaveBeenCalledWith("/dashboard/admin/users", { scroll: false });
  });

  it("keeps search and page when opening and closing a user", () => {
    const { result } = renderHook(() => useUsersAdminUrl(current));
    result.current.openUser("u1");
    expect(router.replace).toHaveBeenLastCalledWith(
      "/dashboard/admin/users?search=ana&page=3&user=u1",
      { scroll: false },
    );
  });
});
```

- [ ] **Step 9 (tester): Escribir `users-admin/index.test.tsx`**

```tsx
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { apiClient } from "@/common/api/apiClient";
import { UsersAdmin } from "@/features/admin/components/users-admin";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

const ana = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Pérez",
  role: "USER",
  emailVerified: true,
  pathRoles: [{ path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" }],
};
const respond = (items: unknown[], meta = { page: 1, limit: 20, total: items.length, totalPages: 1 }) =>
  vi.mocked(apiClient.get).mockResolvedValue({ data: { items, meta } } as Awaited<ReturnType<typeof apiClient.get>>);

describe("UsersAdmin", () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.mocked(apiClient.get).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists users with their role chips and opens one", async () => {
    respond([ana]);
    renderWithClient(<UsersAdmin search="" page={1} userId={null} />);
    expect(await screen.findByText("Initiated · Mentor")).toBeInTheDocument();
    expect(screen.getByText("Sí")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ver Ana Pérez" }));
    expect(router.replace).toHaveBeenCalledWith("/dashboard/admin/users?user=u1", { scroll: false });
  });

  it("shows the empty state with and without a search", async () => {
    respond([]);
    const { unmount } = renderWithClient(<UsersAdmin search="zzz" page={1} userId={null} />);
    expect(await screen.findByText("No encontramos usuarios con «zzz»")).toBeInTheDocument();
    unmount();
    renderWithClient(<UsersAdmin search="" page={1} userId={null} />);
    expect(await screen.findByText("Todavía no hay usuarios")).toBeInTheDocument();
  });

  it("paginates and disables Anterior on the first page", async () => {
    respond([ana], { page: 1, limit: 20, total: 45, totalPages: 3 });
    renderWithClient(<UsersAdmin search="" page={1} userId={null} />);
    expect(await screen.findByText("Página 1 de 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(router.replace).toHaveBeenCalledWith("/dashboard/admin/users?page=2", { scroll: false });
  });

  it("navigates once, 300 ms after the last keystroke, back to page 1", async () => {
    respond([ana]);
    vi.useFakeTimers();
    renderWithClient(<UsersAdmin search="" page={4} userId={null} />);
    const field = screen.getByLabelText("Buscar por nombre o correo");
    fireEvent.change(field, { target: { value: "a" } });
    fireEvent.change(field, { target: { value: "an" } });
    fireEvent.change(field, { target: { value: "ana" } });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(router.replace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/dashboard/admin/users?search=ana", { scroll: false });
  });
});
```

- [ ] **Step 10:** `pnpm test src/features/admin` → PASS.

- [ ] **Step 11: Commit**

```bash
git add src/features/admin "src/app/(app)/dashboard/admin/users"
git commit -m "feat: :sparkles: list, search and paginate users for admins

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Panel lateral con roles por path

**Files:**
- Create: `src/features/admin/hooks/useDialog.ts`, `src/features/admin/components/users-admin/user-panel/index.tsx`, `users-admin/user-panel/path-role-row/index.tsx`
- Modify: `src/features/admin/components/users-admin/index.tsx`
- Test: `src/features/admin/components/users-admin/user-panel/index.test.tsx`

**Interfaces:**
- Consumes: `useUserQuery`, `useAssignPathRoleMutation`, `useRemovePathRoleMutation`, `pathRoleLabels`, `PathRoleType`, `adminMessages` (Task 3), `usePathsQuery` (Task 1).
- Produces:
  - `useDialog(onClose: () => void): { closeButtonRef: RefObject<HTMLButtonElement | null> }`
  - `UserPanel({ userId: string; onClose: () => void })`
  - `PathRoleRow({ pathName: string; currentRole: PathRoleType | null; disabled: boolean; onChange: (role: PathRoleType | null) => void })`

- [ ] **Step 1 (developer): `src/features/admin/hooks/useDialog.ts`**

```ts
import { useEffect, useRef } from "react";

// Al abrir, el foco va al botón de cerrar; Esc cierra.
export function useDialog(onClose: () => void) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return { closeButtonRef };
}
```

- [ ] **Step 2 (developer): `user-panel/path-role-row/index.tsx`**

```tsx
import { pathRoleLabels, type PathRoleType } from "@/features/admin/constants/pathRoleLabels";

type PathRoleRowProps = {
  pathName: string;
  currentRole: PathRoleType | null;
  disabled: boolean;
  onChange: (role: PathRoleType | null) => void;
};

const OPTIONS: { role: PathRoleType | null; label: string }[] = [
  { role: null, label: "Sin rol" },
  { role: "APPRENTICE", label: pathRoleLabels.APPRENTICE },
  { role: "MENTOR", label: pathRoleLabels.MENTOR },
];

export function PathRoleRow({ pathName, currentRole, disabled, onChange }: PathRoleRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/10 py-4 last:border-0">
      <span className="font-semibold">{pathName}</span>
      <div role="group" aria-label={`Rol en ${pathName}`} className="flex flex-wrap gap-2">
        {OPTIONS.map(({ role, label }) => {
          const isCurrent = role === currentRole;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={isCurrent}
              disabled={disabled}
              onClick={() => {
                if (!isCurrent) onChange(role);
              }}
              className={`min-h-11 rounded-full border-2 px-4 text-sm font-semibold disabled:opacity-60 ${
                isCurrent ? "border-primary bg-primary/[0.12] text-primary" : "border-white/35 hover:border-primary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3 (developer): `user-panel/index.tsx`**

```tsx
"use client";
import { Button } from "@/common/components/button";
import { usePathsQuery } from "@/common/hooks/usePathsQuery";
import { PathRoleRow } from "@/features/admin/components/users-admin/user-panel/path-role-row";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import type { PathRoleType } from "@/features/admin/constants/pathRoleLabels";
import { useAssignPathRoleMutation } from "@/features/admin/hooks/useAssignPathRoleMutation";
import { useDialog } from "@/features/admin/hooks/useDialog";
import { useRemovePathRoleMutation } from "@/features/admin/hooks/useRemovePathRoleMutation";
import { useUserQuery } from "@/features/admin/hooks/useUserQuery";

type UserPanelProps = { userId: string; onClose: () => void };

export function UserPanel({ userId, onClose }: UserPanelProps) {
  const { closeButtonRef } = useDialog(onClose);
  const user = useUserQuery(userId);
  const paths = usePathsQuery();
  const assign = useAssignPathRoleMutation();
  const remove = useRemovePathRoleMutation();

  const isSaving = (pathId: string) =>
    (assign.isPending && assign.variables?.pathId === pathId) ||
    (remove.isPending && remove.variables?.pathId === pathId);

  const changeRole = (pathId: string, role: PathRoleType | null) => {
    if (role) assign.mutate({ userId, pathId, role });
    else remove.mutate({ userId, pathId });
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div aria-hidden="true" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-panel-title"
        className="relative flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-white/15 bg-black p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="user-panel-title" className="text-2xl font-bold">
            {user.data?.name ?? "Usuario"}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full px-3 font-semibold text-primary hover:text-[#FFA34D]"
          >
            Cerrar
          </button>
        </div>
        {user.isNotFound ? (
          <p role="alert">{adminMessages.USER_NOT_FOUND}</p>
        ) : user.isError ? (
          <div role="alert" className="flex flex-col items-start gap-4">
            <p>{adminMessages.USER_LOAD_FAILED}</p>
            <Button type="button" label="Reintentar" onClick={() => void user.refetch()} />
          </div>
        ) : !user.data || !paths.data ? (
          <p role="status">Cargando…</p>
        ) : (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
              <dt className="text-[#C9C9D6]">Correo</dt>
              <dd>{user.data.email}</dd>
              <dt className="text-[#C9C9D6]">Confirmado</dt>
              <dd>{user.data.emailVerified ? "Sí" : "No"}</dd>
              <dt className="text-[#C9C9D6]">Rol global</dt>
              <dd>{user.data.role === "ADMIN" ? "Administrador" : "Usuario"}</dd>
            </dl>
            <h3 className="mt-2 text-lg font-bold text-primary">Roles por path</h3>
            {paths.data.items.map((path) => (
              <PathRoleRow
                key={path.id}
                pathName={path.name}
                currentRole={
                  user.data.pathRoles.find((pathRole) => pathRole.path.id === path.id)?.role ?? null
                }
                disabled={isSaving(path.id)}
                onChange={(role) => changeRole(path.id, role)}
              />
            ))}
          </>
        )}
      </aside>
    </div>
  );
}
```

- [ ] **Step 4 (developer): En `users-admin/index.tsx`** importar `UserPanel` y renderizarlo al final del fragmento:

```tsx
import { UserPanel } from "@/features/admin/components/users-admin/user-panel";
```

```tsx
      {params.userId && <UserPanel userId={params.userId} onClose={url.closeUser} />}
```

- [ ] **Step 5 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 6 (tester): Escribir `user-panel/index.test.tsx`**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { UserPanel } from "@/features/admin/components/users-admin/user-panel";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const initiated = { id: "p1", slug: "initiated", name: "Initiated" };
const wanderer = { id: "p2", slug: "wanderer", name: "Wanderer" };
const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Pérez",
  role: "USER",
  emailVerified: true,
  pathRoles: [{ path: initiated, role: "APPRENTICE" }],
};
const paths = {
  items: [
    { ...initiated, description: null, currentVersion: 1 },
    { ...wanderer, description: null, currentVersion: 1 },
  ],
  meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
};
const ok = (data: unknown) => ({ data }) as Awaited<ReturnType<typeof apiClient.get>>;

function mockGets(userResponse: Promise<unknown>) {
  vi.mocked(apiClient.get).mockImplementation((url: string) =>
    (url === "/paths" ? Promise.resolve(ok(paths)) : userResponse) as ReturnType<typeof apiClient.get>,
  );
}

describe("UserPanel", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.put).mockReset();
    vi.mocked(apiClient.delete).mockReset();
  });

  it("is a dialog that focuses Cerrar and closes with Escape", async () => {
    mockGets(Promise.resolve(ok(user)));
    const onClose = vi.fn();
    renderWithClient(<UserPanel userId="u1" onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("marks the current role per path", async () => {
    mockGets(Promise.resolve(ok(user)));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const initiatedGroup = await screen.findByRole("group", { name: "Rol en Initiated" });
    expect(initiatedGroup.querySelector('[aria-pressed="true"]')).toHaveTextContent("Aprendiz");
    const wandererGroup = screen.getByRole("group", { name: "Rol en Wanderer" });
    expect(wandererGroup.querySelector('[aria-pressed="true"]')).toHaveTextContent("Sin rol");
  });

  it("assigns Mentor with PUT and removes with DELETE", async () => {
    mockGets(Promise.resolve(ok(user)));
    vi.mocked(apiClient.put).mockResolvedValue(ok({ ...user, pathRoles: [{ path: initiated, role: "MENTOR" }] }));
    vi.mocked(apiClient.delete).mockResolvedValue(ok({ ...user, pathRoles: [] }));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });

    await userEvent.click(group.querySelector("button:nth-child(3)") as HTMLElement);
    await waitFor(() =>
      expect(apiClient.put).toHaveBeenCalledWith("/users/u1/path-roles/p1", { role: "MENTOR" }),
    );
    await waitFor(() =>
      expect(group.querySelector('[aria-pressed="true"]')).toHaveTextContent("Mentor"),
    );

    await userEvent.click(group.querySelector("button:nth-child(1)") as HTMLElement);
    await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith("/users/u1/path-roles/p1"));
  });

  it("does nothing when the current role is clicked again", async () => {
    mockGets(Promise.resolve(ok(user)));
    renderWithClient(<UserPanel userId="u1" onClose={vi.fn()} />);
    const group = await screen.findByRole("group", { name: "Rol en Initiated" });
    await userEvent.click(group.querySelector('[aria-pressed="true"]') as HTMLElement);
    expect(apiClient.put).not.toHaveBeenCalled();
    expect(apiClient.delete).not.toHaveBeenCalled();
  });

  it("explains that the user no longer exists", async () => {
    mockGets(Promise.reject(new ApiError(404, "x", "USER_NOT_FOUND")));
    renderWithClient(<UserPanel userId="u9" onClose={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Este usuario ya no existe.");
  });
});
```

- [ ] **Step 7:** `pnpm test` → todo PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/admin
git commit -m "feat: :sparkles: manage path roles from the user side panel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verificación final contra la API

- [ ] **Step 1:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` → los cuatro en verde.

- [ ] **Step 2: Prueba manual** con dos cuentas (una `ADMIN` del seed de la API y una `USER` confirmada sin roles):
  1. Con la `USER`: el dashboard muestra "Tu cuenta está lista. Pronto nos pondremos en contacto contigo para continuar." sin botón, sin "Mi path" ni slots; no aparece "Usuarios"; `/dashboard/admin/users` devuelve a `/dashboard`.
  2. Con la `ADMIN`: aparece "Usuarios"; si no tiene roles, el banner ofrece "Ir a usuarios".
  3. Buscar por parte del nombre y del correo; la URL refleja `?search=`; recargar mantiene la búsqueda; paginar con más de 20 usuarios.
  4. "Ver" abre el panel con `?user=`; Esc y el overlay lo cierran; recargar con `?user=` lo abre.
  5. Nombrar Mentor a la cuenta `USER` en Initiated → toast "Rol asignado"; el chip de la tabla se actualiza.
  6. Con la cuenta `USER`, recargar el dashboard → "Estás en el path Initiated como Mentor", "Mi path" visible.
  7. Volver a "Sin rol" → "Rol quitado"; la `USER` vuelve al mensaje de espera al recargar.
  8. `?page=abc` muestra la página 1.

- [ ] **Step 3:** Si hubo correcciones, commit con `fix: :bug: …` y la línea `Co-Authored-By`.
