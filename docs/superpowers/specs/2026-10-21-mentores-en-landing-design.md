# Mentores en la landing — diseño

## Intención

La sección "Nuestras Swordvoices" de la landing deja de usar una lista fija en el código y muestra los mentores que devuelve el backend. Los admins deciden desde el panel de usuario quién aparece y en qué posición, y cada mentor completa en su perfil los datos que la landing necesita (incluida la nueva fecha de inicio de experiencia).

Se construye lo más sencillo posible, pero siguiendo `docs/architecture/conventions.md`: schema zod → hook con servicio + query key → componente cliente. Ejemplo canónico: `src/features/paths`.

## Contratos del backend (fuente: changelogs del backend)

Todas las respuestas vienen en el sobre `{ statusCode, message, data }`, que `apiClient` ya desempaqueta.

- `GET /mentors` (público) → `data`: array ya ordenado (no paginado) de `{ id, name, yearsOfExperience (int ≥ 0), professionalTitle, shortDescription, bio, photoUrl (siempre presente), linkedinUrl | null, githubUrl | null, portfolioUrl | null }`. Puede fallar con `503 STORAGE_UNAVAILABLE`.
- `GET /mentors/:userId/landing` (admin) → `data`: `{ userId, showOnLanding: boolean, landingOrder: int | null }`. Si el usuario no tiene perfil, devuelve `false` / `null`. Errores: `400`, `401`, `403 FORBIDDEN`, `404 USER_NOT_FOUND`.
- `PATCH /mentors/:userId/landing` (admin), body `{ showOnLanding?: boolean, landingOrder?: int 0..2147483647 | null }` → misma forma que el GET. Errores: `400 VALIDATION_ERROR`, `401`, `403 FORBIDDEN`, `404 USER_NOT_FOUND`, `409 LANDING_ORDER_TAKEN`.
- `GET`/`PATCH /profiles/me`: nuevo campo `experienceStartedAt` (`"AAAA-MM-DD"` | `null`, no puede ser futura en UTC → `400 EXPERIENCE_START_IN_FUTURE`). `bio` pasa a 1–1500 y `shortDescription` a 1–150 caracteres.
- `showOnLanding: true` no basta para aparecer: además el usuario tiene que ser mentor y tener el perfil completo (foto, título, descripción corta, bio y fecha de inicio de experiencia).

## Objetivos

1. **Landing pública.** `SwordvoicesSection` muestra los mentores de `GET /mentors`, en el orden que manda el backend.
2. **Panel de admin.** En el panel de usuario que ya existe (`features/admin/components/users-admin/user-panel`) hay una sección "Landing" para ver y cambiar `showOnLanding` y `landingOrder`.
3. **Perfil.** El formulario de perfil añade "Inicio de experiencia" y aplica los nuevos límites de `bio` y `shortDescription`.

## Fuera de alcance

- Página de detalle de un mentor (la `bio` no se muestra en la landing).
- Reordenar arrastrando, o una pantalla de admin nueva que liste a todos los mentores.
- Hacer las peticiones desde el servidor (SSR) o con prefetch: §4.4 lo prohíbe por ahora.
- Avisar en el panel de qué le falta al perfil de un mentor para aparecer.

## Antiobjetivos

- La web nunca reordena ni filtra la lista de `/mentors`: el orden y la visibilidad los decide el backend.
- No se deja la lista fija como respaldo si falla la API.
- No se pinta un enlace social cuando su valor es `null`.

## 1. Landing pública (`features/home`)

**Datos**
- `features/home/schemas/mentor.schema.ts`: `mentorSchema` (campos de arriba; `photoUrl` como string obligatorio) y `mentorsSchema = z.array(mentorSchema)`; tipo `Mentor`.
- `features/home/hooks/useMentorsQuery.ts`: el servicio `getMentors()` llama a `apiClient.get("/mentors")` y valida la respuesta con `mentorsSchema.parse`. Query key `["mentors"]`. Se usa la política global del QueryClient.

**UI (decidido con el usuario)**
- **Cargando:** skeleton de cards.
- **Error (incluido el 503):** mensaje "No pudimos cargar a los mentores." y un botón "Reintentar" que llama a `refetch`, con el mismo aspecto que `PathsError`.
- **Lista vacía:** la sección entera no se renderiza (devuelve `null`), y tampoco su separador.
- Con datos: el mismo carrusel (`react-slick`) y la misma card de hoy.
- Pocos mentores: `slidesToShow = min(slidesToShow del hook, mentors.length)`, y `infinite` y `autoplay` solo se activan si `mentors.length > slidesToShow`, para no duplicar cards. *(Decisión del diseñador.)*
- Si el backend todavía no tiene `/mentors` en un entorno, la sección muestra el estado de error. Se acepta porque no hay respaldo (antiobjetivo).

**Card (`swordvoices-card`)**, que ahora recibe un `Mentor`:
- La foto viene de `photoUrl` y siempre existe. El fallback de iniciales de `SwordvoicePhoto` se elimina porque ya no puede ocurrir.
- El título grande muestra `professionalTitle`; el texto, `shortDescription`.
- La experiencia se muestra según `yearsOfExperience`: `0` → "Menos de un año de experiencia", `1` → "1 año de experiencia", `n` → "n años de experiencia".
- `SocialLinks` recibe `linkedinUrl` / `githubUrl` / `portfolioUrl` y omite los `null`.
- El código de los `tags` que está comentado se borra.

**Limpieza:** se borran `features/home/constants/swordvoices.ts` (y sus tipos `Swordvoice` / `SwordvoiceLinks`) y las imágenes `public/swordvoices/*`, que ya no se usan.

**Separador:** hoy `page.tsx` pone un `SectionDivider` antes y otro después de `SwordvoicesSection`. Para que al ocultar la sección no queden dos separadores juntos, el separador de después (`className="relative top-2"`) pasa a estar dentro de `SwordvoicesSection` y solo se renderiza cuando hay mentores. *(Decisión del diseñador.)*

## 2. Panel de admin (`features/admin`)

**Datos**
- `features/admin/schemas/mentorLanding.schema.ts`:
  - `mentorLandingSchema` (respuesta: `{ userId, showOnLanding, landingOrder: int | null }`) y su tipo `MentorLanding`.
  - `mentorLandingFormSchema` para el formulario: `showOnLanding: boolean` y `landingOrder` como string con `.trim()`, que puede ir vacío (vacío significa `null`) o ser un entero entre 0 y 2147483647. Los mensajes van en español.
- `features/admin/hooks/useMentorLandingQuery.ts`: `GET /mentors/:userId/landing`, query key `["mentors", userId, "landing"]`, `enabled` solo cuando hay `userId` y el usuario es mentor. Devuelve `isNotFound` como hace `useUserQuery`.
- `features/admin/hooks/useUpdateMentorLandingMutation.ts`: `PATCH` con `{ showOnLanding, landingOrder }`. En `onSuccess` escribe la respuesta en la caché del GET (`setQueryData`), invalida `["mentors"]` (la lista pública) y muestra un toast "Configuración de landing guardada". En `onError` invalida `["auth","me"]` ante `FORBIDDEN` (igual que `handlePathRoleError`) y llama a `notifyError` para todo excepto `LANDING_ORDER_TAKEN`.
- `features/admin/hooks/useMentorLandingForm.ts`: react-hook-form + zodResolver. Los valores iniciales salen de la query y devuelve `{ control, onSubmit, isSubmitting, canSubmit }`. Ante `409 LANDING_ORDER_TAKEN` hace `setError("landingOrder", { message: adminMessages.LANDING_ORDER_TAKEN })`. Al guardar con éxito, hace `reset` con la respuesta.

**UI:** componente hijo `user-panel/mentor-landing-form/index.tsx`, que se renderiza debajo de "Roles por path" solo si `user.data.academyRole === "MENTOR"`:
- Título "Landing".
- `InputController type="checkbox"` con la etiqueta "Mostrar en la landing".
- `InputController type="number"` con la etiqueta "Posición" y la descripción "Vacío = sin posición; los mentores sin posición salen al final, por nombre."
- Un texto de ayuda: "Solo aparece si además su perfil de mentor está completo."
- Un botón "Guardar" (deshabilitado si no hay cambios o si está guardando).
- Estados de la query: "Cargando…", y si hay error, un mensaje con "Reintentar".

*Cambio frente a lo hablado en el chat:* en vez de un interruptor que guarda al momento más un botón aparte para la posición, se usa **un solo formulario con un botón Guardar**. Así se cumple §4.3 (todo campo con `InputController` dentro de un formulario react-hook-form), basta una mutación y un solo flujo de errores. *(Decisión del diseñador.)*

**Mensajes nuevos en `adminMessages`:** `LANDING_SAVED`, `LANDING_ORDER_TAKEN` ("Esa posición ya la tiene otro mentor. Libérala primero."), `LANDING_LOAD_FAILED`.

## 3. Perfil (`features/profile` + `common/api/profile.schema.ts`)

- `profileSchema` (en common): añade `experienceStartedAt: z.string().nullable().optional()`. Es opcional (decisión del usuario) para que la web se pueda publicar antes que el backend sin romper la página de perfil. `toProfileFormValues` trata `undefined` igual que `null` (`?? ""`).
- `profileFormSchema`: `bio` pasa a máx. 1500 ("La bio no puede superar 1500 caracteres") y `shortDescription` a máx. 150 ("La descripción no puede superar 150 caracteres"). El mínimo de 1 ya se cumple porque un valor vacío se envía como `null` (borrar). Se añade `experienceStartedAt`: string que puede ir vacío o ser `AAAA-MM-DD` válido y no posterior a hoy en UTC ("La fecha no puede ser futura").
- `toProfilePatch`: `experienceStartedAt` entra en `NULLABLE_FIELDS` y en `MENTOR_FIELDS`; `toProfileFormValues` lo mapea de `null` a `""`.
- `ProfileForm`: dentro del fieldset "Perfil de mentor" se añade `InputController type="date"` con la etiqueta "Inicio de experiencia" y la descripción "Se usa para calcular tus años de experiencia en la landing."
- `useProfileForm` / `useUpdateProfileMutation`: `EXPERIENCE_START_IN_FUTURE` se trata igual que `FREECODECAMP_USERNAME_TAKEN` (se muestra bajo su campo con `profileMessages.EXPERIENCE_START_IN_FUTURE` y no se notifica con un toast).

## Tests (§5)

- Schemas: `mentor.schema`, `mentorLanding.schema` (valores válidos e inválidos con el mensaje exacto: negativo, decimal, > 2147483647, vacío → null) y `profileForm.schema` (nuevos límites, fecha futura, formato).
- Hooks de datos: `useMentorsQuery`, `useMentorLandingQuery` y `useUpdateMentorLandingMutation`, con el mock de `apiClient`: éxito, `ApiError` y respuesta que no cumple el schema.
- `toProfilePatch`: `experienceStartedAt` vacío → `null`, y se ignora si el usuario no es mentor.
- Componentes: la sección de la landing (skeleton, error + reintentar, vacía → no renderiza, card sin enlaces `null`, texto de 0/1/n años); el formulario de landing (solo para mentores, guarda, muestra el error de 409 bajo "Posición"); el campo de fecha en `ProfileForm`.

## Lo que queda a criterio del builder

- El aspecto del skeleton de cards de mentores.
- Los nombres exactos de los componentes hijos nuevos, siempre que sigan §4.1.
- Si `PathsError` se generaliza y se mueve a `common/components` (§2, segundo uso) o la home tiene su propio componente de error.
