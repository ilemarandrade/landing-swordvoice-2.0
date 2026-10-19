# Sesión real (login, tokens, refresh, logout, /auth/me) — Diseño

**Fecha:** 2026-10-19 · **Estado:** aprobado en conversación, pendiente de revisión escrita

Sub-proyecto 1 de 5 de la integración "Cuentas, roles por path y perfil" (los demás: 2 registro y correo, 3 OAuth, 4 perfil y foto, 5 admin y paneles por rol). Cada uno tiene su propio spec y plan, en secuencia.

## Objetivo

Reemplazar la sesión falsa (`useSessionStore`, Zustand + localStorage con `{ name, email, path }`) por una sesión real contra la API: login con `POST /auth/login`, tokens en `localStorage`, renovación automática con `POST /auth/refresh`, logout con `POST /auth/logout`, y el usuario actual desde `GET /auth/me`.

## Decisiones del usuario

- Todo el par de tokens vive en `localStorage` (sin `sessionStorage`, sin cookies httpOnly ni proxy en Next). Riesgo aceptado: un XSS podría leer el refresh token.
- El checkbox "Mantener sesión iniciada" se elimina del login y de `loginSchema`: con `localStorage` siempre, no cambia nada.
- No se despliega entre este sub-proyecto y el 2. Mientras tanto, registro y recuperación de contraseña quedan sin sesión (ver Fuera de alcance).

## Fuera de alcance

- Registro, verificación de correo, reenviar verificación y contraseña olvidada/reset (sub-proyecto 2). El formulario de registro deja de abrir la sesión falsa y no abre ninguna hasta el sub-proyecto 2.
- Botón "reenviar correo" ante 403 `EMAIL_NOT_VERIFIED` (sub-proyecto 2); aquí solo se muestra el mensaje de la API.
- OAuth (sub-proyecto 3), perfil (4), panel de admin y estado vacío de cuenta sin roles (5).
- Renovación proactiva antes de que venza el access token.

---

## 1. Contrato de la API (leído en `swordvoice-api/src/modules/auth`)

- `POST /auth/login` `{ email (≤254, trim), password (1–128) }` → `data: { accessToken, refreshToken, expiresIn }` (`expiresIn` en segundos, 900). Errores: 401 `INVALID_CREDENTIALS`, 403 `EMAIL_NOT_VERIFIED`, 429 `TOO_MANY_REQUESTS` (5/min).
- `POST /auth/refresh` `{ refreshToken (1–512) }` → par nuevo. **El refresh token es de un solo uso: reutilizarlo cierra todas las sesiones de esa cadena.** Error: 401 `INVALID_REFRESH_TOKEN`.
- `POST /auth/logout` `{ refreshToken }` → `data: null`; responde con éxito aunque el token no exista.
- `GET /auth/me` (Bearer) → `data: User`. Sin token o token vencido: 401 `UNAUTHENTICATED`.
- `User = { id, email, name, role: "USER" | "ADMIN", emailVerified: boolean, pathRoles: { path: { id, slug, name }, role: "MENTOR" | "APPRENTICE" }[] }`; `pathRoles` viene ordenado por `path.name` y vacío en una cuenta nueva.

## 2. Piezas

### `src/common/api/auth.schema.ts` (nuevo)
- `authTokensSchema` (respuesta de login/refresh), `userSchema` y sus tipos (`AuthTokens`, `User`, `PathRole`) con `z.infer`.

### `src/common/api/tokenStorage.ts` (nuevo)
- Clave `sv-auth` en `localStorage`; valor `{ accessToken, refreshToken, expiresAt }` (`expiresAt = Date.now() + expiresIn * 1000`), validado con zod al leer.
- `getTokens()`, `saveTokens(tokens: AuthTokens)`, `clearTokens()`, `subscribe(listener)`.
- Contenido corrupto o que no cumple el schema → se trata como sin sesión (devuelve `null`).
- `subscribe` avisa en los cambios de esta pestaña y en el evento `storage` (otras pestañas), así un logout en una pestaña cierra las demás.
- Todo acceso a `localStorage` va en `try/catch`: si el navegador lo bloquea, no hay sesión y la app no se rompe.

### `src/common/api/refreshSession.ts` (nuevo)
- `refreshSession(usedRefreshToken): Promise<string>` devuelve el access token nuevo.
- Una sola promesa en vuelo por pestaña: llamadas concurrentes comparten la misma.
- Entre pestañas: `navigator.locks.request("sv-auth-refresh", …)`. Dentro del lock vuelve a leer el storage; si el refresh token guardado ya no es `usedRefreshToken` (otra pestaña rotó), devuelve ese access token sin llamar a la API. Si `navigator.locks` no existe, solo se deduplica en la pestaña.
- Llama a `/auth/refresh` con la misma instancia `apiClient`, marcando la petición para que el interceptor no intente renovar sobre ella.
- 401 → `clearTokens()` + toast "Tu sesión expiró, inicia sesión de nuevo" y rechaza. Red o 5xx (status 0 o ≥ 500) → **no** borra los tokens y rechaza con el `ApiError`.

### `src/common/api/apiClient.ts` (cambia)
- Interceptor de request: añade `Authorization: Bearer <accessToken>` si hay tokens.
- Interceptor de respuesta, ante 401: si la petición no es `/auth/login` ni `/auth/refresh` ni un reintento, llama a `refreshSession()` y reintenta **una vez** con el token nuevo. En cualquier otro caso, `toApiError` como hoy.
- `unwrapEnvelope` y `toApiError` no cambian.

### `src/common/hooks/useSession.ts` (nuevo)
- `useSyncExternalStore(subscribe, () => getTokens() !== null, () => false)` → `{ isAuthenticated }`. En el servidor se asume sin sesión.

### `src/common/hooks/useMeQuery.ts` (nuevo)
- Servicio `getMe()` → `apiClient.get("/auth/me")` + `userSchema.parse`; query key `["auth", "me"]`; `enabled: isAuthenticated`.
- En `common/` porque lo usan el guard (common) y el dashboard (feature).

### `src/common/hooks/useSessionGuard.ts` y `SessionGuard` (cambian)
- `private`: sin tokens → `router.replace(routes.LOGIN)`. Con tokens → carga mientras `me` no llega; `me` en error de red/5xx → mensaje con botón "Reintentar" (`refetch`); `me` listo → `children`. Si el refresh borró los tokens, `isAuthenticated` pasa a `false` y redirige solo.
- `guest`: con tokens → `router.replace(routes.DASHBOARD)`; sin tokens → `children` (se sigue renderizando desde el servidor para SEO).
- Devuelve un estado con nombre (`{ status: "loading" | "error" | "ready" | "redirecting", retry }`) que `SessionGuard` traduce a UI.

### Login — `src/features/auth`
- `hooks/useLoginMutation.ts` (nuevo): `POST /auth/login` + `authTokensSchema.parse`; `onSuccess: saveTokens`; `onError: notifyError` (muestra el `message` de la API para 401, 403 y 429).
- `hooks/useLoginForm.ts`: usa la mutation; `isSubmitting` refleja `isPending`. El guard del grupo `(auth)` redirige al dashboard al guardar los tokens.
- `schemas/login.schema.ts`: sin `remember`; `password` hasta 128 caracteres (como la API).
- `components/login-form`: sin el checkbox.
- `hooks/useRegisterForm.ts`: deja de llamar a `signIn` (sin sesión hasta el sub-proyecto 2).

### Logout — `src/features/dashboard/hooks/useLogoutMutation.ts` (nuevo)
- `POST /auth/logout` con el refresh token, sin esperar a que salga bien; en `onSettled`: `clearTokens()` y `queryClient.clear()`. Funciona aunque no haya conexión.
- `useAccountMenu` usa esta mutation en lugar de `signOut`.

### Dashboard
- `useAccountMenu`: nombre desde `me.name`.
- `useMyPathHref`: `me.pathRoles[0]?.path.slug`, y si no hay roles, `LEARNING_PATH_IDS[0]` (el estado vacío llega en el sub-proyecto 5).
- `RankCard` y `WelcomeBanner`: leen `useMeQuery` en vez del store.

### Se elimina
- `src/common/store/useSessionStore.ts` y la clave `sv-session` de `localStorage` (no se migra: la sesión falsa no tenía tokens).

## 3. Flujo al abrir una página privada

1. Hay tokens → `useMeQuery` hace `GET /auth/me` con Bearer.
2. 200 → el guard renderiza.
3. 401 (access vencido) → `refreshSession` (deduplicado + lock) → guarda el par nuevo → reintenta `/auth/me` una vez.

## 4. Errores

| Caso | Comportamiento |
|---|---|
| Refresh 401 (vencido, reutilizado o revocado) | Borra el storage, toast "Tu sesión expiró, inicia sesión de nuevo", el guard manda al login |
| Refresh por red o 5xx | Conserva los tokens; el error llega a la query, que reintenta según `createQueryClient` |
| El reintento vuelve a dar 401 | Se propaga el error; nunca hay más de un reintento por petición |
| `/auth/me` falla por red o 5xx | El guard muestra un mensaje con "Reintentar" |
| Login 401 / 403 / 429 | `notifyError` con el mensaje de la API |
| Logout sin conexión | El storage se borra igual |
| Sin `navigator.locks` | Solo deduplicación en la pestaña |
| `localStorage` bloqueado o corrupto | Sin sesión; la app sigue funcionando |

## 5. Tests (Vitest, conventions §5)

- `tokenStorage`: guardar/leer/borrar; contenido corrupto → `null`; el evento `storage` avisa al listener.
- `refreshSession`: 3 llamadas concurrentes → un solo POST; otra pestaña ya rotó dentro del lock → sin POST; 401 → storage vacío; error de red → tokens intactos.
- `apiClient`: añade el header; 401 → refresh → reintento con éxito; sin segundo reintento; sin refresh en `/auth/login` ni `/auth/refresh`.
- `useMeQuery`, `useLoginMutation`, `useLogoutMutation`: éxito, `ApiError` y respuesta que no cumple el schema; logout borra el storage aunque falle.
- `useSessionGuard`: redirects `private` y `guest`, estado de carga mientras llega `me`, estado de error con reintento.
- `LoginForm`: un envío correcto guarda los tokens; un error muestra el toast.
- `login.schema`: casos válidos e inválidos con el mensaje exacto.

## 6. Criterio de cierre

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde; en local contra `swordvoice-api`: login con una cuenta confirmada abre el dashboard con el nombre real; recargar mantiene la sesión; con el access token vencido la sesión se renueva sola; logout en una pestaña cierra las demás.
