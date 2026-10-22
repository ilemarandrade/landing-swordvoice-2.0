# Mentores en la landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La landing muestra los mentores que devuelve `GET /mentors`, el admin configura `showOnLanding`/`landingOrder` desde el panel de usuario, y el perfil gana `experienceStartedAt` junto con los nuevos límites de `bio`/`shortDescription`.

**Architecture:** Tres features independientes que siguen el patrón canónico de `src/features/paths`: schema zod → hook (servicio + query key + `useQuery`/`useMutation`) → componente cliente. No se crea ninguna capa nueva: se extienden `features/profile`, `features/home` y `features/admin`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, TanStack Query, react-hook-form + zod, Tailwind, react-slick, Vitest + RTL.

**Spec:** `docs/superpowers/specs/2026-10-21-mentores-en-landing-design.md`

## Global Constraints

- Todo sigue `docs/architecture/conventions.md` (estructura §1, dependencias §3, formularios §4.3, endpoints §4.4, tests §5).
- Peticiones siempre con `apiClient` desde hooks; ningún componente importa `apiClient`.
- Formularios con react-hook-form + `zodResolver` + `InputController`; prohibido `register`/`Controller`.
- En las mutaciones, los errores van con `onError: notifyError`, salvo los que se muestran bajo un campo.
- Textos de UI en español; imports con `@/`; exports nombrados; prohibidos `any`, `@ts-ignore` y `eslint-disable`.
- `landingOrder`: entero entre 0 y 2147483647, o `null`.
- `bio` máx. 1500; `shortDescription` máx. 150; `experienceStartedAt` en formato `AAAA-MM-DD`, no posterior a hoy (UTC).
- `experienceStartedAt` en `profileSchema` es `.nullable().optional()`.
- Cada tarea cierra con `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde, y su commit. Formato de commit del repo: `feat: :sparkles: …`, `refactor: :recycle: …`.
- Se trabaja en la rama `feat/mentors-landing` (se crea desde `main` antes de la tarea 1).

## Review Focus

- Mentor con `yearsOfExperience: 0` → "Menos de un año de experiencia" (test en la tarea 3).
- Mentor con los tres enlaces en `null` → la card no pinta ningún `<a>` social (test en la tarea 3).
- Un solo mentor con el carrusel de escritorio (4 huecos) → se ve una sola card, sin duplicados de `infinite` (test en la tarea 3: se renderiza 1 artículo).
- "Posición" vacía al guardar → se envía `landingOrder: null`, no `""` ni `0` (test en la tarea 4).
- El perfil viene sin la clave `experienceStartedAt` (backend antiguo) → la página de perfil sigue funcionando (test en la tarea 1).

---

### Task 1: Perfil — `experienceStartedAt` y nuevos límites

**Files:**
- Modify: `src/common/api/profile.schema.ts`
- Modify: `src/features/profile/schemas/profileForm.schema.ts`
- Modify: `src/features/profile/utils/toProfilePatch.ts`
- Modify: `src/features/profile/constants/profileMessages.ts`
- Modify: `src/features/profile/hooks/useProfileForm.ts`
- Modify: `src/features/profile/hooks/useUpdateProfileMutation.ts`
- Modify: `src/features/profile/components/profile-section/profile-form/index.tsx`
- Test: `src/common/api/profile.schema.test.ts`, `src/features/profile/schemas/profileForm.schema.test.ts`, `src/features/profile/utils/toProfilePatch.test.ts`, `src/features/profile/hooks/useUpdateProfileMutation.test.ts`, `src/features/profile/components/profile-section/profile-form/index.test.tsx`

**Interfaces:**
- Produces: `Profile.experienceStartedAt?: string | null`; `ProfileFormValues.experienceStartedAt: string`; `ProfilePatch.experienceStartedAt?: string | null`; `profileMessages.EXPERIENCE_START_IN_FUTURE`.

- [ ] **Step 0: Crear la rama** — `git checkout -b feat/mentors-landing`

- [ ] **Step 1: Escribir los tests que fallan**
  - `profile.schema.test.ts`: "acepta experienceStartedAt '2019-03-15', null y ausente": los tres `profileSchema.parse` pasan y el ausente da `undefined`.
  - `profileForm.schema.test.ts`:
    - `bio` de 1501 caracteres → error `"La bio no puede superar 1500 caracteres"`; de 1500 → válida.
    - `shortDescription` de 151 → `"La descripción no puede superar 150 caracteres"`; de 150 → válida.
    - `experienceStartedAt`: `""` válido; `"2019-03-15"` válido; `"2019-13-40"` y `"15/03/2019"` → `"Usa una fecha válida"`; mañana (UTC, calculado con `new Date()` en el test) → `"La fecha no puede ser futura"`; hoy (UTC) → válida.
  - `toProfilePatch.test.ts`:
    - `experienceStartedAt` modificado a `""` con `isMentor: true` → `{ experienceStartedAt: null }`.
    - Modificado con `isMentor: false` → no aparece en el patch.
    - `toProfileFormValues` con el perfil sin la clave → `experienceStartedAt: ""`.
  - `useUpdateProfileMutation.test.ts`: un `ApiError` con `errorCode: "EXPERIENCE_START_IN_FUTURE"` no llama a `notifyError`.
  - `profile-form/index.test.tsx`: con `isMentor`, existe `getByLabelText("Inicio de experiencia")`; sin `isMentor`, no existe.

- [ ] **Step 2: Ejecutar y comprobar que fallan** — `pnpm test src/common/api/profile.schema src/features/profile` → FAIL en los casos nuevos.

- [ ] **Step 3: Implementar**
  - `profileSchema`: `experienceStartedAt: z.string().nullable().optional()`.
  - `profileFormSchema`:
    - `bio: optionalText(1500, …)` y `shortDescription: optionalText(150, …)` con los mensajes de arriba.
    - `experienceStartedAt`: `z.string().trim()` con dos `refine`, en este orden: (1) vacío o `/^\d{4}-\d{2}-\d{2}$/` y fecha real (`new Date(value + "T00:00:00Z")` válida y su `toISOString().slice(0,10) === value`) → `"Usa una fecha válida"`; (2) vacío o `value <= new Date().toISOString().slice(0,10)` → `"La fecha no puede ser futura"`.
  - `toProfilePatch.ts`: añadir `"experienceStartedAt"` a `NULLABLE_FIELDS` y a `MENTOR_FIELDS`; en `toProfileFormValues`, `experienceStartedAt: profile.experienceStartedAt ?? ""`.
  - `profileMessages.EXPERIENCE_START_IN_FUTURE = "La fecha no puede ser futura"`.
  - `useProfileForm` `onError`: si es `EXPERIENCE_START_IN_FUTURE`, hacer `setError("experienceStartedAt", { message: profileMessages.EXPERIENCE_START_IN_FUTURE })`.
  - `useUpdateProfileMutation` `onError`: no llamar a `notifyError` cuando el código es `FREECODECAMP_USERNAME_TAKEN` o `EXPERIENCE_START_IN_FUTURE`.
  - `ProfileForm`: después de `shortDescription`, añadir `<InputController control={control} name="experienceStartedAt" label="Inicio de experiencia" type="date" description="Se usa para calcular tus años de experiencia en la landing." />`.

- [ ] **Step 4: Ejecutar y comprobar que pasan** — `pnpm test src/common/api/profile.schema src/features/profile` → PASS.

- [ ] **Step 5: Verificar y commitear** — `pnpm lint && pnpm typecheck && pnpm test && pnpm build` en verde, y `git commit -m "feat: :sparkles: add experience start date and new profile limits"`.

---

### Task 2: Home — schema y query de mentores

**Files:**
- Create: `src/features/home/schemas/mentor.schema.ts`
- Create: `src/features/home/hooks/useMentorsQuery.ts`
- Test: `src/features/home/schemas/mentor.schema.test.ts`, `src/features/home/hooks/useMentorsQuery.test.ts`

**Interfaces:**
- Produces:
  - `mentorSchema`, `mentorsSchema = z.array(mentorSchema)`, `type Mentor = { id: string; name: string; yearsOfExperience: number; professionalTitle: string; shortDescription: string; bio: string; photoUrl: string; linkedinUrl: string | null; githubUrl: string | null; portfolioUrl: string | null }`.
  - `useMentorsQuery(): UseQueryResult<Mentor[]>` con query key `["mentors"]`.

- [ ] **Step 1: Escribir los tests que fallan**
  - Schema: acepta el ejemplo del changelog; rechaza `yearsOfExperience: -1` y `1.5` (`z.number().int().min(0)`); rechaza `photoUrl: null`.
  - Hook (patrón de `usePathDetailQuery.test.ts`):
    - Éxito: `apiClient.get` fue llamado con `"/mentors"` y `data` coincide.
    - `ApiError(503, …)` → `isError`.
    - Respuesta `[{ id: 1 }]` → `error.name === "ZodError"`.

- [ ] **Step 2: Ejecutar** — `pnpm test src/features/home/schemas/mentor src/features/home/hooks/useMentorsQuery` → FAIL.

- [ ] **Step 3: Implementar** el schema y `getMentors()` + `useMentorsQuery()`, siguiendo el ejemplo de §4.4.

- [ ] **Step 4: Ejecutar** → PASS.

- [ ] **Step 5: Verificar y commitear** — `feat: :sparkles: add mentors query`.

---

### Task 3: Home — la sección de Swordvoices usa la API

**Files:**
- Modify: `src/features/home/components/swordvoices-section/index.tsx`
- Modify: `src/features/home/components/swordvoices-section/swordvoices-carousel/index.tsx`
- Modify: `…/swordvoices-carousel/swordvoices-card/index.tsx`, `…/swordvoices-card/swordvoice-photo/index.tsx`, `…/swordvoices-card/social-links/index.tsx`
- Create: `src/features/home/components/swordvoices-section/mentors-skeleton/index.tsx`
- Create: `src/features/home/components/swordvoices-section/mentors-error/index.tsx`
- Create: `src/features/home/utils/formatExperience.ts`
- Modify: `src/app/(marketing)/(home)/page.tsx` (quitar el `SectionDivider className="relative top-2"` que va después de `<SwordvoicesSection />`)
- Delete: `src/features/home/constants/swordvoices.ts`, `public/swordvoices/*`
- Test: `src/features/home/utils/formatExperience.test.ts`, `src/features/home/components/swordvoices-section/index.test.tsx`

**Interfaces:**
- Consumes: `useMentorsQuery`, `Mentor` (tarea 2).
- Produces:
  - `formatExperience(years: number): string`.
  - `SwordVoicesCarousel({ mentors }: { mentors: Mentor[] })`.
  - `SwordvoicesCard({ mentor, className })`.
  - `SwordvoicePhoto({ name, photoUrl, experience }: { name: string; photoUrl: string; experience: string })`.
  - `SocialLinks({ name, links }: { name: string; links: Pick<Mentor, "linkedinUrl" | "githubUrl" | "portfolioUrl"> })`.

- [ ] **Step 1: Escribir los tests que fallan**
  - `formatExperience`: `0` → `"Menos de un año de experiencia"`; `1` → `"1 año de experiencia"`; `7` → `"7 años de experiencia"`.
  - `swordvoices-section/index.test.tsx`, con `vi.mock` de `useMentorsQuery` y de `useSlidesToShow` (este devuelve `{ slidesToShow: 4 }`):
    - Pendiente → `getByRole("status")` (el skeleton).
    - Error → texto "No pudimos cargar a los mentores."; un clic en "Reintentar" llama a `refetch`.
    - Lista vacía → `container` vacío (no hay heading "Nuestras Swordvoices").
    - Un mentor con los enlaces en `null` → un `article`, con `getByText` de `professionalTitle`, de `shortDescription` y de `"Menos de un año de experiencia"`, y `queryAllByRole("link")` de longitud 0.
    - Un mentor con `linkedinUrl` → existe el link "LinkedIn de Ana Pérez".

- [ ] **Step 2: Ejecutar** — `pnpm test src/features/home` → FAIL.

- [ ] **Step 3: Implementar**
  - `SwordvoicesSection` llama a `useMentorsQuery()`:
    - `isPending` → `MentorsSkeleton` (con `role="status"`, `aria-label="Cargando mentores"` y cards de placeholder con `animate-pulse`).
    - `isError` → `MentorsError onRetry={() => refetch()}` (misma apariencia que `PathsError`, mensaje "No pudimos cargar a los mentores.").
    - `data.length === 0` → `return null`.
    - Con datos → el marcado actual, con `<SwordVoicesCarousel mentors={data} />` y, al final, `<SectionDivider className="relative top-2" />` (se importa desde `@/features/home/components/section-divider`).
    - El título y el subtítulo se muestran en todos los estados salvo con la lista vacía.
  - Carrusel: `const shown = Math.min(slidesToShow, mentors.length)`, `const loops = mentors.length > shown`. Pasa `slidesToShow={shown}`, `infinite={loops}` y `autoplay={loops && slidesToShow < 4}`; `key={shown}`; quita `infinite` de `settings`. Usa `key={mentor.id}`.
  - Card: el título muestra `professionalTitle` y el texto `shortDescription`; la experiencia sale de `formatExperience(yearsOfExperience)`. Se borra el bloque de `tags` comentado.
  - `SwordvoicePhoto`: `photoUrl` es obligatorio, se quitan `getInitials` y su fallback, y se renderiza `{experience}` directamente.
  - `SocialLinks`: `SOCIALS` usa las claves `linkedinUrl` / `githubUrl` / `portfolioUrl`.
  - Se borran `constants/swordvoices.ts` y `public/swordvoices/`, y en `page.tsx` se quita el separador posterior.

- [ ] **Step 4: Ejecutar** — `pnpm test src/features/home` → PASS. Comprobar también con `grep -r "constants/swordvoices\|/swordvoices/" src` que no quedan referencias (sin resultados).

- [ ] **Step 5: Verificar y commitear** — `feat: :sparkles: load landing mentors from the API`.

---

### Task 4: Admin — schemas, query y mutación de la configuración de landing

**Files:**
- Create: `src/features/admin/schemas/mentorLanding.schema.ts`
- Create: `src/features/admin/hooks/useMentorLandingQuery.ts`
- Create: `src/features/admin/hooks/useUpdateMentorLandingMutation.ts`
- Modify: `src/features/admin/constants/adminMessages.ts`
- Test: `src/features/admin/schemas/mentorLanding.schema.test.ts`, `src/features/admin/hooks/useMentorLandingQuery.test.ts`, `src/features/admin/hooks/useUpdateMentorLandingMutation.test.ts`

**Interfaces:**
- Produces:
  - `mentorLandingSchema` y `type MentorLanding = { userId: string; showOnLanding: boolean; landingOrder: number | null }`.
  - `mentorLandingFormSchema` y `type MentorLandingFormValues = { showOnLanding: boolean; landingOrder: string }`.
  - `toMentorLandingPatch(values: MentorLandingFormValues): { showOnLanding: boolean; landingOrder: number | null }` (dentro del archivo del schema).
  - `useMentorLandingQuery(userId: string, { enabled }: { enabled: boolean })` → query + `isNotFound`, con query key `["mentors", userId, "landing"]`.
  - `useUpdateMentorLandingMutation()` → `mutate({ userId, showOnLanding, landingOrder })`, que devuelve `MentorLanding`.
  - `adminMessages.LANDING_SAVED = "Configuración de landing guardada"`, `LANDING_ORDER_TAKEN = "Esa posición ya la tiene otro mentor. Libérala primero."`, `LANDING_LOAD_FAILED = "No pudimos cargar la configuración de landing."`.

- [ ] **Step 1: Escribir los tests que fallan**
  - Form schema, campo `landingOrder`:
    - `""` válido.
    - `"3"` válido.
    - `"0"` válido.
    - `"-1"` → `"Usa un número entero entre 0 y 2147483647"`.
    - `"1.5"` → mismo mensaje.
    - `"2147483648"` → mismo mensaje.
    - `"abc"` → mismo mensaje.
  - `toMentorLandingPatch`: `{ showOnLanding: true, landingOrder: "" }` → `{ showOnLanding: true, landingOrder: null }`; `" 3 "` → `3`.
  - Query:
    - `apiClient.get` se llama con `"/mentors/u1/landing"`.
    - `ApiError` con `USER_NOT_FOUND` → `isNotFound`.
    - Con `enabled: false` no se llama.
    - Si la respuesta no cumple el schema → `ZodError`.
  - Mutation:
    - `apiClient.patch` se llama con `("/mentors/u1/landing", { showOnLanding: true, landingOrder: null })`.
    - Tras el éxito, `queryClient.getQueryData(["mentors","u1","landing"])` es la respuesta.
    - `LANDING_ORDER_TAKEN` no llama a `notifyError` (mock de `@/common/errors/notifyError`); cualquier otro `ApiError` sí lo llama.

- [ ] **Step 2: Ejecutar** — `pnpm test src/features/admin/schemas/mentorLanding src/features/admin/hooks/useMentorLanding src/features/admin/hooks/useUpdateMentorLanding` → FAIL.

- [ ] **Step 3: Implementar**
  - El form schema valida `landingOrder` como `z.string().trim().refine(v => v === "" || (/^\d+$/.test(v) && Number(v) <= 2147483647), msg)`.
  - Query: el patrón de `useUserQuery`, con `encodeURIComponent(userId)`.
  - Mutation:
    - `onSuccess`: `setQueryData(["mentors", userId, "landing"], data)`, `invalidateQueries({ queryKey: ["mentors"], exact: true })` y `toast.success(adminMessages.LANDING_SAVED)`.
    - `onError`: con `FORBIDDEN`, invalidar `["auth","me"]`; con cualquier código salvo `LANDING_ORDER_TAKEN`, llamar a `notifyError(error)`.

- [ ] **Step 4: Ejecutar** → PASS.

- [ ] **Step 5: Verificar y commitear** — `feat: :sparkles: add mentor landing settings query and mutation`.

---

### Task 5: Admin — formulario "Landing" en el panel de usuario

**Files:**
- Create: `src/features/admin/hooks/useMentorLandingForm.ts`
- Create: `src/features/admin/components/users-admin/user-panel/mentor-landing-form/index.tsx`
- Modify: `src/features/admin/components/users-admin/user-panel/index.tsx`
- Test: `src/features/admin/components/users-admin/user-panel/mentor-landing-form/index.test.tsx`, `src/features/admin/components/users-admin/user-panel/index.test.tsx`

**Interfaces:**
- Consumes: todo lo de la tarea 4.
- Produces:
  - `useMentorLandingForm(landing: MentorLanding)` → `{ control, onSubmit, isSubmitting, canSubmit }`.
  - `MentorLandingForm({ userId }: { userId: string })`.

- [ ] **Step 1: Escribir los tests que fallan** (`renderWithClient`, `apiClient` mockeado)
  - `MentorLandingForm`:
    - Con `GET` → `{ showOnLanding: true, landingOrder: 3 }`, el checkbox "Mostrar en la landing" está marcado, "Posición" vale `"3"` y "Guardar" está deshabilitado.
    - Al vaciar "Posición" y pulsar "Guardar", se hace `PATCH` con `{ showOnLanding: true, landingOrder: null }`.
    - Si `PATCH` rechaza con `ApiError(409, …, "LANDING_ORDER_TAKEN")`, se ve el texto `adminMessages.LANDING_ORDER_TAKEN`.
    - Si `GET` falla, se ve `LANDING_LOAD_FAILED` y un clic en "Reintentar" vuelve a pedir los datos.
  - `UserPanel`: con un usuario `academyRole: "MENTOR"` aparece el heading "Landing"; con `"APPRENTICE"` no aparece y no se pide `/mentors/…/landing`.

- [ ] **Step 2: Ejecutar** — `pnpm test src/features/admin/components/users-admin/user-panel` → FAIL.

- [ ] **Step 3: Implementar**
  - `useMentorLandingForm`:
    - `defaultValues`: `{ showOnLanding, landingOrder: landingOrder === null ? "" : String(landingOrder) }`.
    - Envía `toMentorLandingPatch(values)` con su `userId`.
    - En `onSuccess`, hace `reset` con los valores mapeados de la respuesta.
    - En `onError`, si es `LANDING_ORDER_TAKEN`, hace `setError("landingOrder", { message: adminMessages.LANDING_ORDER_TAKEN })`.
    - `canSubmit` es `isDirty && !isPending`.
  - `MentorLandingForm`:
    - Usa `useMentorLandingQuery(userId, { enabled: true })`.
    - Cargando → `<p role="status">Cargando…</p>`.
    - Error → `role="alert"` con `LANDING_LOAD_FAILED` y "Reintentar" (como en `UserPanel`).
    - Con datos → un hijo interno con el formulario: `h3` "Landing", el checkbox, `InputController type="number"` con la etiqueta "Posición" y la descripción "Vacío = sin posición; los mentores sin posición salen al final, por nombre.", el texto "Solo aparece si además su perfil de mentor está completo." y `Button type="submit" label="Guardar" disabled={!canSubmit}`.
    - El formulario solo se monta cuando ya hay datos, para que `defaultValues` sean los reales.
  - `UserPanel`: después del `map` de `PathRoleRow`, añadir `{user.data.academyRole === "MENTOR" && <MentorLandingForm userId={userId} />}`.

- [ ] **Step 4: Ejecutar** → PASS.

- [ ] **Step 5: Verificar y commitear** — `pnpm lint && pnpm typecheck && pnpm test && pnpm build` en verde, y `feat: :sparkles: manage mentor landing visibility from the user panel`.
