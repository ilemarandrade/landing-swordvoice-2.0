# Paths: card, detalle público y detalle logueado — Diseño

**Fecha:** 2026-10-15 · **Estado:** aprobado en conversación, pendiente de revisión escrita

## Objetivo

Construir en Next.js los componentes del preview `swordvoice-paths-preview.html` (card de path, detalle público, detalle logueado), alimentados por la API real de paths mediante una capa HTTP global con axios + TanStack Query. Usar la card en "Nuestros Paths" de la landing, crear una página pública de detalle con selector entre paths, y el detalle con progreso dentro del dashboard.

## Decisiones del usuario

- La API ya existe y solo tiene endpoints públicos de paths (lista y detalle). El progreso del usuario es un **mock** local hasta que exista su endpoint.
- Capa HTTP: **una sola instancia de axios** (`apiClient`) con la base URL de la API. `request()` conserva su firma pero usa axios por dentro.
- El envío de email del formulario de contacto **se elimina por completo** (cliente y servidor). El formulario queda solo con validación, sin envío, para un próximo scope.
- Rutas: público `/paths/[slug]` con pestañas entre paths; logueado `/dashboard/paths/[slug]`.
- El slug correcto es `initiated` (como la API); `iniciated` / "Iniciated" del repo es un error de escritura y se renombra, sin migración.
- `PathCard` (`src/common/components/path-card`) se mejora conservando su estructura y orden: ícono + nombre → `SwordRule` → descripción → botón.
- **No** hay CTA "Elegir este path": la asignación del path se hace en otro flujo.
- Path sin temas: dibujo del camino con blur y mensaje "en construcción".
- Sin tests nuevos (decisión vigente). El test existente de `PathCard` sigue en verde y `httpClient.test.ts` se adapta a axios.

## Fuera de alcance

Endpoint de progreso real, asignación/elección de path, envío del formulario de contacto, paginación visible de la lista (se piden hasta 100 paths), versiones anteriores de un path.

---

## 1. Contrato de la API

- Base URL: `NEXT_PUBLIC_API_URL` (local `http://localhost:4000/api/v1`). Header `Accept-Language: es`.
- Sobre de éxito: `{ statusCode: number; message: string; data: T }`. Sobre de error: `{ statusCode; message; errorCode: string; errors: null }`.
- `GET /paths?page&limit` → `data: { items: PathSummary[]; meta: { page; limit; total; totalPages } }`. Errores: 400 `VALIDATION_ERROR`.
- `GET /paths/:slug` → `data: PathDetail`. Errores: 404 `PATH_NOT_FOUND`.
- Tipos (`PathSummary`, `PathDetail`, `RequiredCertification`, `Topic`, `TopicCertification`, `Subtopic`, `CertificationProvider = "FREECODECAMP"`) exactamente como los entregó el usuario; `Subtopic.url` y las `description` son `string | null`.

## 2. Capa HTTP global (`src/common/api`)

- `axiosInstances.ts` → `apiClient = axios.create({ baseURL: publicEnv.NEXT_PUBLIC_API_URL, timeout: 10_000, headers: { "Accept-Language": "es" } })`. Única instancia.
- `httpClient.ts` → `request(path, { method?, body?, params?, schema })`:
  - Ejecuta `apiClient.request({ url: path, method, data: body, params })`.
  - Si la respuesta tiene forma de sobre (`statusCode` + `data`), valida `schema` contra `data`; si no, contra el cuerpo entero.
  - Errores → `ApiError(status, message, errorCode?)`: red/timeout → `ApiError(0, NETWORK_ERROR_MESSAGE)`; HTTP no-2xx → `message` de la API o `GENERIC_ERROR_MESSAGE`, con `errorCode`; schema inválido → `INVALID_RESPONSE_MESSAGE`.
- `ApiError` gana el campo opcional `errorCode?: string`.
- `envelope.ts` → `paginatedSchema(item)` (zod) para `{ items, meta }`.
- `getQueryClient.ts` → en servidor un `QueryClient` nuevo por petición; en navegador uno compartido (patrón oficial de TanStack Query para App Router). `common/providers` lo usa en lugar de `makeQueryClient`.
- `publicEnv.ts` (nuevo, sin `server-only`) con `NEXT_PUBLIC_API_URL`; se añade a `.env.example`.
- Dependencia nueva: `axios`.
- ESLint: `no-restricted-imports` de `axios` fuera de `src/common/api/**`; se mantiene la prohibición de `fetch`.
- Conventions §4.4 se reescribe para axios + `request()`; el ejemplo canónico de endpoints pasa a ser `src/features/paths` (schema → service → `useQuery` → componente).

## 3. Eliminación del envío de email

Se borran: `src/app/api/sendEmail/` (route + test), `src/features/home/server/` (+ test), `src/features/home/services/contactService.ts`, `src/features/home/hooks/useSendContactEmail.ts`, la respuesta `contactResponseSchema`, las claves `EMAIL_TO_SEND_EMAIL`, `PASSWORD_TO_SEND_EMAIL`, `EMAILS_MENTORS` de `src/common/config/env.ts` (y su test), la dependencia `nodemailer` (+ `@types/nodemailer`), y `src/common/utils/escapeHtml.ts` (+ test) si no queda ningún uso.
`useContactForm` mantiene `useForm` + `zodResolver` y devuelve `{ control, onSubmit, isSubmitting }`; `onSubmit` valida y no envía (comentario: envío pendiente de un próximo scope). `CLAUDE.md`, conventions y `.claude/agents/*` dejan de citar el flujo de contacto como ejemplo de punta a punta.

## 4. Feature `src/features/paths`

- `schemas/path.schema.ts`: `pathSummarySchema`, `pathDetailSchema`, `requiredCertificationSchema`, `topicCertificationSchema`, `topicSchema`, `subtopicSchema`, `pathProgressSchema` (`{ completedSubtopicIds: string[]; earnedCertificationIds: string[] }`) y tipos `z.infer`.
- `services/pathsService.ts`: `getPaths({ page = 1, limit = 100 })`, `getPathDetail(slug)`.
- `constants/queryKeys.ts`: `pathKeys = { all: ["paths"], list: (page, limit) => ["paths", "list", page, limit], detail: (slug) => ["paths", "detail", slug] }`.
- `hooks/usePathsQuery`, `hooks/usePathDetailQuery(slug)`, `hooks/usePathProgress(slug)` (devuelve el mock; único punto a cambiar cuando exista el endpoint).
- `constants/mockProgress.ts`: progreso de ejemplo por slug.
- `server/prefetchPaths.ts`: `prefetchPaths(queryClient)` y `prefetchPathDetail(queryClient, slug)`; la segunda devuelve `false` si la API responde 404 (`PATH_NOT_FOUND`) para que la page llame a `notFound()`.
- `constants/pathIcons.ts`: `slug → ícono` (`initiated` → `InitiatedPathIcon`, `wanderer` → `WandererPathIcon`) con ícono por defecto.
- `utils/buildTrail.ts`: lógica pura del preview — ordena temas por `position`; inserta cada certificación requerida como "Prueba" después del último tema que la referencia (las que no tienen tema van al final); con progreso calcula estado por tema (`done` si todos sus recursos y certificaciones están completos; el primer tema no opcional pendiente es `current`; el resto `pending`), estado de cada prueba, `req`, `got`, porcentaje (`(recursos completados de temas no opcionales + pruebas superadas) / (total recursos no opcionales + req)`) y `complete` (`got === req`). Sin progreso, los estados son `null`.

## 5. Componentes

Se reutilizan sin cambios: `ButtonLink`, `Typography`, `Navbar`, `Footer`, `SwordRule`, `SwordHiltIcon`, íconos de path, `bg-ourPathsBackground`, tokens `primary`/`secondary`/`blurry`/`blue`.

**`PathCard` (mejora, misma estructura y orden).** Nueva prop opcional `eyebrow` (p. ej. "Rango · v2") sobre el nombre; prop opcional `stats: { value: number; label: string }[]` renderizada entre `SwordRule` y la descripción ("3 Temas · 3 Pruebas", números en Sedgwick); superficie `bg-[#000E2799]`; resto igual. El test existente sigue pasando.

**Nuevos en `src/features/paths/components/`:**

| Componente | Responsabilidad |
|---|---|
| `paths-section` | "Nuestros Paths": título, bajada "Elige tu camino, forja tu espada y supera las pruebas para ganar tu rango.", grilla de `PathCard` (cliente, `usePathsQuery`). Reemplaza `features/home/components/paths-section` (+ `path-available`, `constants/paths.ts`, animación `ourPathAnimation`), que se eliminan. Conserva `id="our_paths"`. |
| `path-tabs` | Pestañas entre paths (`next/link`, `aria-current="page"`), con `basePath` (`/paths` o `/dashboard/paths`). |
| `path-detail` | Compone hero + aside + camino. Props: `slug`, `progress?`. Mismo componente en público y logueado. |
| `path-detail/path-hero` | Link "← Todos los paths" (solo público), ícono, eyebrow "{description} · v{version}", título, bajada, stats (temas, recursos, pruebas requeridas). Con `progress` muestra `path-progress`. Sin CTA. |
| `path-detail/path-hero/path-progress` | "Tu forja" + porcentaje + barra `role="progressbar"`. |
| `path-detail/required-certifications` (+ `certification-item`) | Aside "Pruebas requeridas", sticky en desktop; con progreso "X de N superadas" y Superada/Pendiente; link externo con `target="_blank" rel="noopener noreferrer"` y texto sr-only. Sin certificaciones: "Aún no hay pruebas definidas". |
| `path-detail/path-trail` | Camino de la espada (cliente): empuñadura vertical, hoja con relleno hasta el último paso completado, punta; abre por defecto el tema `current` o el primero. |
| `path-trail/topic-step` | Acordeón (`button` + `aria-expanded` + `aria-controls`, panel `role="region"`): número 01…, "Opcional", N recursos, N prueba, estado (Completado/En curso/Pendiente con X/Y); panel con descripción, recursos (con check si hay progreso; link externo si `url`) y módulos de cada certificación. |
| `path-trail/trial-step` | "Prueba I/II…" (+ "· Superada"), nombre, link "Ver en freeCodeCamp". |
| `path-trail/rank-step` | "Rango al completar" / "Rango obtenido", nombre del path, texto "Supera las N pruebas para obtener este rango y que te asignemos un Mentor." o "Superaste todas las pruebas. Tu espada está forjada." Sin CTA. |
| `path-trail/trail-under-construction` | Path sin temas: 3 temas + 1 prueba de relleno con `blur-sm`, `aria-hidden`, sin interacción; encima "Este path aún no tiene temas" / "Estamos forjando su contenido. Vuelve pronto." |
| `paths-error` | Estado de error de la API con "Reintentar" (`refetch`). |
| `paths-skeleton` | Estado de carga. |

**Íconos nuevos** (`src/common/assets/icons`, formato de los vecinos): `SwordsIcon`, `ShieldIcon`, `CrownIcon`, `ChevronIcon`, `CheckIcon`, `ExternalLinkIcon`, `SwordHiltVerticalIcon`. `IniciatedPathIcon` se renombra a `InitiatedPathIcon`.

**Renombre `iniciated` → `initiated`** en `LEARNING_PATH_IDS`, `learningPaths` ("Initiated"), registro y cualquier texto. Sin migración de la sesión.

## 6. Rutas (conventions §4.8)

| URL | Archivo | Comportamiento |
|---|---|---|
| `/` | `(marketing)/(home)/page.tsx` | Prefetch de la lista + `<HydrationBoundary>`; usa `PathsSection` de `@/features/paths`. |
| `/paths` | `(marketing)/paths/page.tsx` | Prefetch de la lista y `redirect()` al primer slug; sin paths, mensaje "Aún no hay paths disponibles". |
| `/paths/[slug]` | `(marketing)/paths/[slug]/page.tsx` | `await params`; prefetch del detalle y de la lista; `notFound()` si 404; `generateMetadata` con `{ title: path.name, description }`; `PathTabs` + `PathDetail`. |
| layout público | `(marketing)/paths/layout.tsx` | `<Navbar changeLogo />` + fondo; el footer lo pone `(marketing)/layout.tsx`. |
| `/dashboard/paths/[slug]` | `(app)/dashboard/paths/[slug]/page.tsx` | Dentro del layout protegido; `PathTabs basePath="/dashboard/paths"` + `PathDetail` con `usePathProgress`; datos en cliente. |

- `dashboardNav`: "Mi path" → `/dashboard/paths/{slug de la sesión o el primero}`; activo en `/dashboard/paths/*`.
- `routes`: `PATHS: "/paths"`, `DASHBOARD_PATHS: "/dashboard/paths"`.
- `sitemap.ts`: añade `/paths` y cada `/paths/{slug}` (consultando la lista; si la API falla, solo `/paths`).
- "Ver path" en la card → `/paths/{slug}`.

## 7. Errores y estados

- API caída en SSR de `/`: la sección muestra `paths-error` con "Reintentar"; el resto de la landing renderiza.
- `/paths/[slug]` con slug inexistente → 404 en español (`not-found.tsx`). Otros errores → `error.tsx`.
- Cliente (dashboard): `paths-skeleton` mientras carga, `paths-error` si falla.
- Path sin temas → `trail-under-construction`.

## 8. Verificación

`pnpm lint`, `pnpm typecheck`, `pnpm test` (incluye `PathCard` existente y `httpClient` adaptado) y `pnpm build`; revisión en navegador (con la API local en `:4000`) de `/`, `/paths`, `/paths/initiated`, `/paths/wanderer`, `/paths/no-existe` (404), `/dashboard/paths/initiated` con sesión, y a 390px.
