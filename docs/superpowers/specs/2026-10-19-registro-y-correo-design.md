# Registro y correo (registro, verificación, reenvío, contraseña olvidada) — Diseño

**Fecha:** 2026-10-19 · **Estado:** aprobado en conversación, pendiente de revisión escrita

Sub-proyecto 2 de 5 de la integración "Cuentas, roles por path y perfil". Depende del sub-proyecto 1 (`docs/superpowers/specs/2026-10-19-sesion-real-design.md`): usa `apiClient` con sus interceptores, `saveTokens`, `clearTokens`, el guard y `useLoginMutation`.

## Objetivo

Conectar con la API el registro, la confirmación del correo (`/verify-email`), el reenvío de la verificación, la contraseña olvidada y el restablecimiento (`/reset-password`), y atender en el login el 403 `EMAIL_NOT_VERIFIED`.

## Decisiones del usuario

- El registro **quita** el campo `path` (el path lo asigna el admin) y **mantiene** la casilla de Términos y Privacidad solo en el cliente (no se envía a la API).
- Contraseña nueva (registro y restablecimiento): de 8 a 128 caracteres, sin exigir números, igual que la API.
- Las rutas existentes en español se quedan como están; las **nuevas** van en inglés: `/verify-email` y `/reset-password` (además coinciden con los enlaces que arma `mail.service.ts` de la API).
- Las vistas usan el sistema de diseño existente (tokens de Tailwind, componentes de `common` y de `features/auth`); no se crean colores, tipografías ni componentes base nuevos.

## Fuera de alcance

- Renombrar a inglés las rutas existentes.
- Cuenta atrás en los botones de reenviar (el 429 se informa con el mensaje de la API).
- OAuth (sub-proyecto 3), perfil (4), admin (5).

---

## 1. Contrato de la API (leído en `swordvoice-api/src/modules/auth`)

| Endpoint | Cuerpo | Éxito | Errores propios |
|---|---|---|---|
| `POST /auth/register` | `{ name (1–80, trim), email (≤254, trim), password (8–128) }` | 201, `data: null` | 409 `EMAIL_TAKEN` |
| `POST /auth/email/verify` | `{ token (1–200), password (1–128) }` | 200, `data: AuthTokens` | 401 `INVALID_CREDENTIALS` (el enlace sigue sirviendo), 400 `INVALID_EMAIL_TOKEN` |
| `POST /auth/email/verify/resend` | `{ email }` | 200, `data: null` siempre | — |
| `POST /auth/password/forgot` | `{ email }` | 200, `data: null` siempre | — |
| `POST /auth/password/reset` | `{ token (1–200), password (8–128) }` | 200, `data: null`; cierra todas las sesiones | 400 `INVALID_EMAIL_TOKEN` |
| `POST /auth/login` | (sub-proyecto 1) | | 403 `EMAIL_NOT_VERIFIED` |

Todos comparten 5 solicitudes por minuto por IP → 429 `TOO_MANY_REQUESTS`. Enlaces de los correos: `${WEB_APP_URL}/verify-email?token=…` (24 h) y `${WEB_APP_URL}/reset-password?token=…` (1 h).

## 2. Pantallas y flujos

**`/registro`**
- Campos: nombre (1–80), correo, contraseña (8–128), confirmar contraseña, casilla de Términos.
- 201 → el formulario se reemplaza por "Revisa tu correo" con el correo usado y "¿NO LLEGÓ? REENVIAR" (`/auth/email/verify/resend`).
- 409 `EMAIL_TAKEN` → error bajo el campo correo: "Ya existe una cuenta con este correo", más el link "¿Olvidaste tu contraseña?" a `/recuperar-contrasena`. **Sin** reenviar verificación (otra persona pudo registrar ese correo).

**`/iniciar-sesion`**
- 403 `EMAIL_NOT_VERIFIED` → aviso "Confirma tu correo para entrar" dentro de la tarjeta con "REENVIAR CORREO", que reenvía al correo escrito en el formulario. Sin toast para este caso.

**`/recuperar-contrasena`**
- `POST /auth/password/forgot`; muestra la pantalla de "Revisa tu correo" existente (mensaje neutro). "¿NO LLEGÓ? REENVIAR" vuelve al formulario como hoy.

**`/verify-email?token=…`** (nueva)
- Sin `token` → estado "El enlace venció o ya se usó" con un formulario de correo para pedir otro (`resend`).
- Formulario: contraseña de la cuenta.
- 200 → `queryClient.clear()` + `saveTokens` → `router.replace(routes.DASHBOARD)`.
- 401 `INVALID_CREDENTIALS` → error bajo el campo: "La contraseña no es la de tu cuenta", más "¿Olvidaste tu contraseña?". Se puede reintentar.
- 400 `INVALID_EMAIL_TOKEN` → el estado de enlace vencido.

**`/reset-password?token=…`** (nueva)
- Sin `token` → estado "El enlace venció o ya se usó" con `ButtonLink` "Pedir otro enlace" a `/recuperar-contrasena`.
- Formulario: contraseña nueva (8–128) y confirmación ("Las contraseñas no coinciden").
- 200 → `clearTokens()` + `queryClient.clear()` + toast de éxito "Contraseña actualizada; inicia sesión de nuevo" → `router.replace(routes.LOGIN)`.
- 400 `INVALID_EMAIL_TOKEN` → el estado de enlace vencido.

**Reenvío correcto** (registro, login, verify-email): `toast.success("Si la cuenta existe y no está confirmada, enviamos un correo nuevo")`.

**Errores sin código manejado** (429, 5xx, sin conexión, `VALIDATION_ERROR`): `notifyError` con el mensaje de la API.

## 3. Guard y rutas

- `(auth)/layout.tsx` queda como marco visual (fondo, `Navbar`, `AuthBottomBar`), **sin** `SessionGuard`.
- Nuevo `(auth)/(guest)/layout.tsx` con `<SessionGuard access="guest">{children}</SessionGuard>`. Se mueven ahí `iniciar-sesion/`, `registro/` y `recuperar-contrasena/`; las URLs no cambian.
- `(auth)/verify-email/page.tsx` y `(auth)/reset-password/page.tsx` quedan fuera del guard de invitado: alguien con sesión abierta también puede usar el enlace. Leen `token` de `searchParams` (`await`, Next 15) y lo pasan a `<VerifyEmail token={token} />` / `<ResetPassword token={token} />` (`token?: string`; un array se trata como ausente).
- Metadata de las dos rutas nuevas: `title`, `robots: { index: false, follow: false }` y `referrer: "no-referrer"` (el token de la URL no debe salir en la cabecera `Referer` hacia links externos).
- `routes.ts`: `VERIFY_EMAIL: "/verify-email"`, `RESET_PASSWORD: "/reset-password"`.

## 4. Piezas (`src/features/auth`)

**Schemas**
- `authFields.schema.ts`: `newPasswordField` = string 8–128 sin `trim` ("La contraseña debe tener al menos 8 caracteres" / "La contraseña no puede superar 128 caracteres").
- `register.schema.ts`: `name` ≤ 80 ("El nombre no puede superar 80 caracteres"); `password: newPasswordField`; `confirmPassword` ≤ 128; sin `path`; `acceptTerms` como hoy; refine de coincidencia.
- `resetPassword.schema.ts` (nuevo): `{ password: newPasswordField, confirmPassword }` con el mismo refine.
- `verifyEmail.schema.ts` (nuevo): `{ password: 1–128 }` ("Ingresa tu contraseña").
- Reenviar verificación (formulario de `verify-email-expired`): reutiliza `recoverPasswordSchema` (`{ email }`).

**Utilidad**
- `utils/isApiErrorCode.ts`: `isApiErrorCode(error: unknown, code: string): boolean` (`error instanceof ApiError && error.errorCode === code`).

**Mutations** (`hooks/`, un archivo por mutation, §4.4)
- `useRegisterMutation`, `useResendVerificationMutation`, `useForgotPasswordMutation`, `useVerifyEmailMutation`, `useResetPasswordMutation`.
- Cada mutation llama a `notifyError` en `onError` **salvo** para los códigos que su pantalla muestra en línea: register → `EMAIL_TAKEN`; verify → `INVALID_CREDENTIALS`, `INVALID_EMAIL_TOKEN`; reset → `INVALID_EMAIL_TOKEN`.
- `useLoginMutation` (sub-proyecto 1) cambia igual: no notifica `EMAIL_NOT_VERIFIED`.
- `useVerifyEmailMutation.onSuccess`: `queryClient.clear()` + `saveTokens`. `useResetPasswordMutation.onSuccess`: `clearTokens()` + `queryClient.clear()` + toast de éxito.

**Hooks de formulario** (calculan los estados derivados del error)
- `useRegisterForm`: `{ control, onSubmit, isSubmitting, sentEmail, resend, isResending }`; 409 → `setError("email")`.
- `useLoginForm`: añade `unverifiedEmail: string | null` (el correo enviado cuando la API respondió 403), `resendVerification`, `isResending`.
- `useRecoverPasswordForm`: llama a `useForgotPasswordMutation`; `isSent` pasa a `true` al responder 200.
- `useVerifyEmailForm(token)`: `{ control, onSubmit, isSubmitting, isLinkExpired }`; 401 → `setError("password")`; 400 → `isLinkExpired`.
- `useResetPasswordForm(token)`: `{ control, onSubmit, isSubmitting, isLinkExpired }`.
- `useResendVerificationForm()`: formulario de correo del estado vencido; `{ control, onSubmit, isSubmitting }`.

**Componentes**
- `auth-status/` (nuevo, compartido en la feature): `AuthStatus({ icon: ReactNode; title: ReactNode; description: ReactNode; children?: ReactNode })`, la estructura de la pantalla de estado actual (§5). `recover-password/recover-email-sent` pasa a usarlo.
- `register-form/` muestra el formulario o su hijo `register-email-sent/` (usa `AuthStatus`).
- `login-form/` añade el hijo `unverified-email-notice/`.
- `verify-email/` (nuevo, exportado en `index.ts`): elige entre `verify-email-form/` y `verify-email-expired/` (usa `AuthStatus` + el formulario de reenvío).
- `reset-password/` (nuevo, exportado en `index.ts`): elige entre `reset-password-form/` y `reset-password-expired/` (usa `AuthStatus` + `ButtonLink`).

## 5. Vistas con el sistema de diseño existente

- Tokens: `primary` (#FF7A00), `secondary` (#00C2FF), textos `#E6E6EE` y `#C9C9D6`, `font-sedgwick` para títulos. Componentes: `Button`, `ButtonLink`, `InputController` (todo campo, §4.3) y el marco de `(auth)/layout.tsx`.
- **Pantallas con formulario** (verify-email y reset-password válidos): misma composición que login y registro — `AuthIntro` (título Sedgwick con una palabra en `secondary`) + `AuthCard` con el formulario.
- **Pantallas de estado** (registro enviado, enlace vencido en las dos rutas): `AuthStatus` con la estructura de `RecoverEmailSent` actual — ícono en círculo `border-2 border-primary text-primary`, título `font-sedgwick` con una palabra en `text-secondary`, texto `text-[#E6E6EE]` con `role="status"`, `ButtonLink` como acción principal y botón de texto `text-sm font-bold tracking-wide text-primary hover:text-[#FFA34D]` para "¿NO LLEGÓ? REENVIAR".
- **Aviso de correo sin confirmar** (login): caja con `role="alert"`, `rounded-xl border border-primary bg-[#000E2799] p-4 text-[#E6E6EE]`, y el mismo botón de texto para "REENVIAR CORREO".
- Errores de campo: los muestra `InputController` (vía `setError`), con su estilo actual.

## 6. Tests (Vitest, conventions §5)

- Schemas: válidos e inválidos con el mensaje exacto; contraseña de 8 sin números válida, 128 válida, 129 inválida; nombre de 81 inválido; `resetPassword` con contraseñas distintas.
- `isApiErrorCode`: `ApiError` con y sin el código; error que no es `ApiError`.
- Cada mutation: éxito (cuerpo enviado exacto), `ApiError` notificado, `ApiError` con código manejado **no** notificado, respuesta que no cumple el schema (verify); verify guarda tokens y limpia la caché; reset borra tokens.
- Hooks de formulario: 409 → error en correo sin toast; 401 en verify → error en contraseña; 400 → `isLinkExpired`; 403 en login → `unverifiedEmail`; 429 → toast.
- Componentes: registro correcto muestra "Revisa tu correo" y "REENVIAR" llama a la API con el correo; `/verify-email` sin token muestra el estado vencido; verify correcto redirige al dashboard; reset correcto redirige al login; el aviso del login reenvía al correo escrito.

## 7. Criterio de cierre

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde; en local contra `swordvoice-api` (con correo de desarrollo): registrarse → abrir el enlace → confirmar con la contraseña → entra al dashboard; login de una cuenta sin confirmar muestra el aviso y reenvía; contraseña olvidada → enlace → contraseña nueva → login con ella; un enlace usado muestra el estado vencido.
