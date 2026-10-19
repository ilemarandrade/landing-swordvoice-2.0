# OAuth (Google, GitHub, LinkedIn) — Diseño

**Fecha:** 2026-10-19 · **Estado:** aprobado en conversación, pendiente de revisión escrita

Sub-proyecto 3 de 5 de la integración "Cuentas, roles por path y perfil". Depende del sub-proyecto 1 (`apiClient`, `saveTokens`) y del 2 (`AuthStatus`, `isApiErrorCode`, rutas fuera de `(guest)`).

## Objetivo

Permitir entrar o crear la cuenta con Google, GitHub o LinkedIn: la web arma la URL de autorización (con `state` y, para Google y GitHub, PKCE S256), recibe al usuario en `/auth/callback` y canjea el `code` en `POST /auth/oauth/:provider`.

## Decisiones del usuario

- Los botones van en `/iniciar-sesion` y `/registro`, arriba del formulario, separados por "o".
- Solo se muestran los proveedores cuyo `NEXT_PUBLIC_*_CLIENT_ID` está configurado; sin ninguno, no aparece el bloque.
- Una sola ruta de retorno: `/auth/callback`. En `OAUTH_REDIRECT_URIS` de la API y en los tres paneles de proveedor se registran `http://localhost:3000/auth/callback` y `https://<dominio>/auth/callback`.
- Rutas nuevas en inglés; vistas con el sistema de diseño existente.

## Fuera de alcance

- Vincular o desvincular proveedores desde el perfil (no hay endpoint).
- Volver a la página de origen tras el login (siempre `/dashboard`).
- Actualizar la Política de Privacidad para OAuth (tarea de contenido del roadmap, Fase 0).

---

## 1. Contrato

**API** (`swordvoice-api/src/modules/auth`): `POST /auth/oauth/:provider` con `provider` ∈ `google | github | linkedin` y cuerpo `{ code (1–2000), redirectUri (URL http/https, ≤500), codeVerifier? (^[A-Za-z0-9._~-]{43,128}$) }` → `data: AuthTokens`. La `redirectUri` debe ser exactamente la usada al redirigir y estar en `OAUTH_REDIRECT_URIS`. Errores: 400 `INVALID_OAUTH_REDIRECT_URI`, 400 `INVALID_OAUTH_CODE`, 400 `OAUTH_EMAIL_NOT_VERIFIED`, 503 `OAUTH_PROVIDER_UNAVAILABLE`, 429 `TOO_MANY_REQUESTS` (5/min).

**Proveedores**

| Proveedor | URL de autorización | `scope` | PKCE |
|---|---|---|---|
| Google | `https://accounts.google.com/o/oauth2/v2/auth` | `openid email profile` | S256 |
| GitHub | `https://github.com/login/oauth/authorize` | `read:user user:email` | S256 |
| LinkedIn | `https://www.linkedin.com/oauth/v2/authorization` | `openid profile email` | no |

Parámetros comunes: `client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`; con PKCE además `code_challenge` y `code_challenge_method=S256`.

## 2. Configuración

- `src/common/config/publicEnv.ts`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GITHUB_CLIENT_ID`, `NEXT_PUBLIC_LINKEDIN_CLIENT_ID`, cada una `z.string().min(1).optional()`, leídas de forma literal.
- `.env.example`: las tres claves vacías con un comentario (es el mismo client ID que la API; el secret nunca va en la web).
- Despliegue: las `NEXT_PUBLIC_*` se incrustan en el build, así que se definen en el entorno de build de Cloudflare.

## 3. Piezas (`src/features/auth`)

- `constants/oauthProviders.ts`: `OAuthProviderId = "google" | "github" | "linkedin"`; por proveedor `{ id, label, authorizeUrl, scope, usesPkce, clientId }`; `availableOAuthProviders` = los que tienen `clientId`.
- `utils/pkce.ts`: `createState()` (32 bytes aleatorios en base64url), `createCodeVerifier()` (32 bytes → 43 caracteres base64url), `createCodeChallenge(verifier): Promise<string>` (SHA-256 con `crypto.subtle`, base64url sin relleno).
- `utils/oauthAttempt.ts`: `saveOAuthAttempt({ provider, state, codeVerifier? })` (añade `createdAt`), `takeOAuthAttempt(): OAuthAttempt | null` (lee **y borra** `sv-oauth` de `sessionStorage`; validado con zod; `null` si falta, está corrupto o tiene más de 10 minutos). Accesos en `try/catch`.
- `utils/buildAuthorizeUrl.ts`: `buildAuthorizeUrl(provider, { state, redirectUri, codeChallenge? }): string` con `URLSearchParams`.
- `utils/oauthRedirectUri.ts`: `oauthRedirectUri() = window.location.origin + routes.OAUTH_CALLBACK`.
- `hooks/useStartOAuth.ts`: `{ start(provider), isStarting }`; genera state y, si aplica, verifier + challenge; guarda el intento; `window.location.assign(buildAuthorizeUrl(...))`.
- `hooks/useOAuthSignInMutation.ts`: `POST /auth/oauth/${provider}` + `authTokensSchema.parse`; `onSuccess`: `queryClient.clear()` + `saveTokens`. Sin `notifyError` (la pantalla muestra todo).
- `hooks/useOAuthCallback.ts`: recibe `{ code, state, error }`; un `useRef` garantiza una sola ejecución (React 19 en desarrollo monta los efectos dos veces y el `code` es de un solo uso). Devuelve `{ status: "loading" | "error", providerLabel, message }`; al terminar bien hace `router.replace(routes.DASHBOARD)`.
- `components/social-login-button/`: suma `linkedin` (etiqueta "Continuar con LinkedIn" e ícono).
- `components/oauth-buttons/` (exportado en `index.ts`): un `SocialLoginButton` por proveedor disponible + separador "o"; `null` si no hay proveedores; botones deshabilitados con `isStarting`.
- `components/oauth-callback/` (exportado en `index.ts`): `OAuthCallback({ code, state, error })` con `AuthStatus`.
- `routes.ts`: `OAUTH_CALLBACK: "/auth/callback"`.
- `src/app/(auth)/auth/callback/page.tsx`: fuera de `(guest)`; metadata `title`, `robots: { index: false, follow: false }`, `referrer: "no-referrer"`; lee `code`, `state` y `error` de `searchParams` (string único o `null`, como `readToken`) y renderiza `<OAuthCallback />`.
- `/iniciar-sesion` y `/registro`: `<OAuthButtons />` dentro de `AuthCard`, antes del formulario.

## 4. Flujo de vuelta

1. `error` presente → mensaje de cancelación (`access_denied`) u otro error del proveedor. Se consume el intento para saber el proveedor. Sin llamada a la API.
2. `takeOAuthAttempt()` es `null`, o `state` ≠ `attempt.state`, o falta `code` → "El inicio de sesión no es válido o expiró. Vuelve a intentarlo." Sin llamada a la API.
3. `POST /auth/oauth/{attempt.provider}` con `{ code, redirectUri: oauthRedirectUri(), codeVerifier }` (`codeVerifier` solo si el proveedor usa PKCE).
4. 200 → caché limpia, tokens guardados, `router.replace("/dashboard")`.

## 5. Errores y mensajes

| Caso | Mensaje |
|---|---|
| `?error=access_denied` | "Cancelaste el inicio de sesión con {Proveedor}." |
| Otro `?error` | "{Proveedor} no pudo completar el inicio de sesión. Inténtalo de nuevo." |
| Sin intento, vencido, `state` distinto o sin `code` | "El inicio de sesión no es válido o expiró. Vuelve a intentarlo." |
| 400 `INVALID_OAUTH_CODE` | "No pudimos completar el inicio de sesión. Inténtalo de nuevo." |
| 400 `OAUTH_EMAIL_NOT_VERIFIED` | "Tu cuenta de {Proveedor} no tiene el correo confirmado. Confírmalo allí o entra con otro método." |
| 503 `OAUTH_PROVIDER_UNAVAILABLE` | "{Proveedor} no está disponible ahora. Prueba con otro método." |
| `INVALID_OAUTH_REDIRECT_URI`, 429, 5xx, sin conexión, respuesta inválida | `message` del `ApiError` (o el genérico) |

Cuando el proveedor no se conoce (no hay intento), `{Proveedor}` se reemplaza por "el proveedor". Reintentar = volver al login y pulsar el botón (nuevo `state` y nuevo `code`).

## 6. Vistas con el sistema de diseño existente

- Callback: `AuthStatus` (sub-proyecto 2). Cargando: ícono con `animate-spin`, título "Conectando con {Proveedor}…", texto con `role="status"`. Error: ícono de alerta, título "No pudimos <span class="text-secondary">entrar</span>", el mensaje, `ButtonLink` "Volver a iniciar sesión".
- Botones: `SocialLoginButton` existente (píldora, `border-white/35`, hover `border-primary`). Separador: dos líneas `border-white/15` con "o" en `text-[#C9C9D6]`.

## 7. Tests (Vitest)

- `pkce`: verifier de 43 caracteres del alfabeto permitido; challenge del vector de RFC 7636 (`dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk` → `E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`); `createState` distinto en cada llamada.
- `oauthAttempt`: guardar/tomar; tomar borra; más de 10 minutos → `null`; corrupto → `null`.
- `buildAuthorizeUrl`: parámetros exactos por proveedor; LinkedIn sin `code_challenge`.
- `OAuthButtons`: sin client IDs no renderiza nada; con uno, un botón.
- `useStartOAuth`: guarda el intento y llama a `window.location.assign` con la URL esperada.
- `useOAuthCallback`: éxito (cuerpo exacto, tokens, dashboard); LinkedIn sin `codeVerifier`; `state` distinto, sin intento o `?error` → sin POST; cada código de §5 → su mensaje; montado dos veces (StrictMode) → un solo POST.

## 8. Criterio de cierre

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde; en local, con al menos un proveedor configurado en la API y en la web: "Continuar con …" → autorizar → `/auth/callback` → dashboard; cancelar en el proveedor → mensaje de cancelación; recargar `/auth/callback` tras entrar → mensaje de inválido o expirado (el intento ya se consumió).
