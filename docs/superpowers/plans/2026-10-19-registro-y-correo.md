# Registro y correo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Flujo del repo (CLAUDE.md):** en cada tarea el subagente `developer` hace los pasos de implementación y el `tester` los de tests; la sesión principal revisa contra `docs/architecture/conventions.md` y commitea con lint, typecheck, test y build en verde. Máximo 2 iteraciones developer↔tester por tarea.
>
> **Requisito previo:** el plan `docs/superpowers/plans/2026-10-19-sesion-real.md` (sub-proyecto 1) está implementado. Este plan parte de su código: `apiClient` con interceptores, `tokenStorage`, `useLoginMutation`, `useLoginForm` y `SessionGuard`.

**Goal:** Conectar con la API el registro, la confirmación del correo, el reenvío de la verificación, la contraseña olvidada y el restablecimiento, y atender en el login el 403 `EMAIL_NOT_VERIFIED`.

**Architecture:** Cada endpoint tiene su mutation en `src/features/auth/hooks`; los hooks de formulario traducen los códigos de error que la pantalla muestra en línea (`setError` o estados derivados) y el resto va a `notifyError`. Dos rutas nuevas en inglés, `/verify-email` y `/reset-password`, viven en `(auth)` fuera del guard de invitado, que pasa a un grupo anidado `(auth)/(guest)`. Las pantallas de estado comparten un componente `AuthStatus` extraído de la pantalla existente.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, axios (`apiClient`), TanStack Query 5, zod 4, react-hook-form, react-hot-toast, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-19-registro-y-correo-design.md`

## Global Constraints

- Rutas existentes en español sin cambios de URL; rutas nuevas: `/verify-email`, `/reset-password`.
- Contraseña nueva (registro y reset): 8–128 caracteres, sin exigir números, sin `trim`.
- Nombre del registro: 1–80 caracteres. El registro no envía ni muestra `path`; `acceptTerms` se valida solo en el cliente.
- Errores con código manejado en línea, sin toast: register `EMAIL_TAKEN`; login `EMAIL_NOT_VERIFIED`; verify `INVALID_CREDENTIALS` e `INVALID_EMAIL_TOKEN`; reset `INVALID_EMAIL_TOKEN`. Todo lo demás → `notifyError`.
- Tras `EMAIL_TAKEN` nunca se ofrece reenviar la verificación.
- Rutas nuevas con metadata `robots: { index: false, follow: false }` y `referrer: "no-referrer"`.
- Solo el sistema de diseño existente: `primary`, `secondary`, `#E6E6EE`, `#C9C9D6`, `font-sedgwick`, `Button`, `ButtonLink`, `InputController`, `AuthIntro`, `AuthCard`.
- Textos de UI en español; imports con `@/`; sin `any`, `@ts-ignore` ni `eslint-disable`.

## Review Focus

1. **Usuario con sesión abre un enlace de restablecimiento:** `/reset-password` no debe redirigirlo al dashboard. Lo garantiza la estructura de rutas (Task 5: la ruta vive fuera de `(guest)`) y lo comprueba la prueba manual de Task 7, paso 6; los layouts de `src/app` no tienen tests unitarios en este repo.
2. **El usuario corrige el correo tras un 409:** el error "Ya existe una cuenta con este correo" y el link a recuperar contraseña desaparecen al editar el campo — test en Task 3.
3. **Contraseña incorrecta en `/verify-email` y luego correcta:** el primer intento muestra el error en el campo y el segundo entra al dashboard (el enlace sigue sirviendo) — test en Task 5.
4. **`?token=a&token=b` o `?token=` vacío:** se tratan como enlace vencido, sin llamar a la API — test en Task 5 (`readToken`).
5. **429 al reenviar:** el toast muestra el mensaje de la API y la pantalla sigue igual — test en Task 3.

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/features/auth/schemas/authFields.schema.ts` | modificar | `newPasswordField` |
| `src/features/auth/schemas/register.schema.ts` | modificar | Sin `path`, nombre ≤80, contraseña 8–128 |
| `src/features/auth/schemas/resetPassword.schema.ts` | crear | Contraseña nueva + confirmación |
| `src/features/auth/schemas/verifyEmail.schema.ts` | crear | Contraseña de la cuenta |
| `src/features/auth/utils/isApiErrorCode.ts` | crear | Comprobar `ApiError.errorCode` |
| `src/features/auth/utils/readToken.ts` | crear | Normalizar `searchParams.token` |
| `src/features/auth/constants/authMessages.ts` | crear | Textos de error/éxito de los flujos |
| `src/common/constants/routes.ts` | modificar | `VERIFY_EMAIL`, `RESET_PASSWORD` |
| `src/features/auth/components/auth-status/index.tsx` | crear | Pantalla de estado compartida |
| `src/features/auth/components/auth-text-button/index.tsx` | crear | Botón de texto "REENVIAR" compartido |
| `src/features/auth/components/recover-password/recover-email-sent/index.tsx` | modificar | Usa `AuthStatus` + `AuthTextButton` |
| `src/features/auth/hooks/useForgotPasswordMutation.ts` | crear | `POST /auth/password/forgot` |
| `src/features/auth/hooks/useRecoverPasswordForm.ts` | modificar | Llama a la API |
| `src/features/auth/hooks/useRegisterMutation.ts` | crear | `POST /auth/register` |
| `src/features/auth/hooks/useResendVerificationMutation.ts` | crear | `POST /auth/email/verify/resend` |
| `src/features/auth/hooks/useRegisterForm.ts` | modificar | Registro real + reenvío |
| `src/features/auth/components/register-form/index.tsx` | modificar | Sin `path`; muestra el estado enviado |
| `src/features/auth/components/register-form/register-email-sent/index.tsx` | crear | "Revisa tu correo" del registro |
| `src/features/auth/constants/pathOptions.ts` | borrar | Ya no se usa |
| `src/app/(auth)/(guest)/registro/page.tsx` | mover + modificar | Textos sin "elige tu path" |
| `src/features/auth/hooks/useLoginMutation.ts` | modificar | No notifica `EMAIL_NOT_VERIFIED` |
| `src/features/auth/hooks/useLoginForm.ts` | modificar | `unverifiedEmail` + reenvío |
| `src/features/auth/components/login-form/unverified-email-notice/index.tsx` | crear | Aviso de correo sin confirmar |
| `src/app/(auth)/layout.tsx` | modificar | Marco sin guard |
| `src/app/(auth)/(guest)/layout.tsx` | crear | Guard de invitado |
| `src/app/(auth)/(guest)/iniciar-sesion/page.tsx`, `recuperar-contrasena/page.tsx` | mover | Mismas URLs |
| `src/features/auth/hooks/useVerifyEmailMutation.ts` | crear | `POST /auth/email/verify` |
| `src/features/auth/hooks/useVerifyEmailForm.ts` | crear | Formulario de confirmación |
| `src/features/auth/hooks/useResendVerificationForm.ts` | crear | Formulario de correo para reenviar |
| `src/features/auth/components/verify-email/**` | crear | Pantalla `/verify-email` |
| `src/app/(auth)/verify-email/page.tsx` | crear | Ruta |
| `src/features/auth/hooks/useResetPasswordMutation.ts` | crear | `POST /auth/password/reset` |
| `src/features/auth/hooks/useResetPasswordForm.ts` | crear | Formulario de contraseña nueva |
| `src/features/auth/components/reset-password/**` | crear | Pantalla `/reset-password` |
| `src/app/(auth)/reset-password/page.tsx` | crear | Ruta |
| `src/features/auth/index.ts` | modificar | Exporta `VerifyEmail`, `ResetPassword`, `readToken` |

---

### Task 1: Schemas, utilidades, mensajes y rutas

**Files:**
- Modify: `src/features/auth/schemas/authFields.schema.ts`, `src/features/auth/schemas/register.schema.ts`, `src/common/constants/routes.ts`
- Create: `src/features/auth/schemas/resetPassword.schema.ts`, `src/features/auth/schemas/verifyEmail.schema.ts`, `src/features/auth/utils/isApiErrorCode.ts`, `src/features/auth/utils/readToken.ts`, `src/features/auth/constants/authMessages.ts`
- Test: `src/features/auth/schemas/register.schema.test.ts`, `src/features/auth/schemas/resetPassword.schema.test.ts`, `src/features/auth/schemas/verifyEmail.schema.test.ts`, `src/features/auth/utils/isApiErrorCode.test.ts`, `src/features/auth/utils/readToken.test.ts`

**Interfaces:**
- Produces:
  - `newPasswordField` (zod string 8–128)
  - `registerSchema`, `type RegisterFormValues = { name; email; password; confirmPassword; acceptTerms }`
  - `resetPasswordSchema`, `type ResetPasswordFormValues = { password; confirmPassword }`
  - `verifyEmailSchema`, `type VerifyEmailFormValues = { password }`
  - `isApiErrorCode(error: unknown, code: string): boolean`
  - `readToken(value: string | string[] | undefined): string | null`
  - `authMessages` (ver Step 5)
  - `routes.VERIFY_EMAIL = "/verify-email"`, `routes.RESET_PASSWORD = "/reset-password"`

- [ ] **Step 1 (developer): Añadir a `src/features/auth/schemas/authFields.schema.ts`**

```ts
// Las contraseñas no se recortan: los espacios forman parte de ellas.
export const newPasswordField = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña no puede superar 128 caracteres");
```

- [ ] **Step 2 (developer): Reescribir `src/features/auth/schemas/register.schema.ts`**

```ts
import { z } from "zod";
import {
  emailField,
  newPasswordField,
} from "@/features/auth/schemas/authFields.schema";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ingresa tu nombre y apellido")
      .max(80, "El nombre no puede superar 80 caracteres"),
    email: emailField,
    password: newPasswordField,
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(128, "La contraseña no puede superar 128 caracteres"),
    acceptTerms: z
      .boolean()
      .refine(
        (accepted) => accepted,
        "Debes aceptar los Términos y la Política de privacidad",
      ),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
```

- [ ] **Step 3 (developer): Crear `src/features/auth/schemas/resetPassword.schema.ts` y `verifyEmail.schema.ts`**

```ts
// resetPassword.schema.ts
import { z } from "zod";
import { newPasswordField } from "@/features/auth/schemas/authFields.schema";

export const resetPasswordSchema = z
  .object({
    password: newPasswordField,
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(128, "La contraseña no puede superar 128 caracteres"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
```

```ts
// verifyEmail.schema.ts
import { z } from "zod";

export const verifyEmailSchema = z.object({
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .max(128, "La contraseña no puede superar 128 caracteres"),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
```

- [ ] **Step 4 (developer): Crear las utilidades**

```ts
// src/features/auth/utils/isApiErrorCode.ts
import { ApiError } from "@/common/api/ApiError";

export function isApiErrorCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.errorCode === code;
}
```

```ts
// src/features/auth/utils/readToken.ts
// `?token=a&token=b` llega como array y `?token=` como vacío: ambos son un enlace inválido.
export function readToken(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= 200
    ? value
    : null;
}
```

- [ ] **Step 5 (developer): Crear `src/features/auth/constants/authMessages.ts`**

```ts
export const authMessages = {
  EMAIL_TAKEN: "Ya existe una cuenta con este correo",
  WRONG_ACCOUNT_PASSWORD: "La contraseña no es la de tu cuenta",
  VERIFICATION_RESENT:
    "Si la cuenta existe y no está confirmada, enviamos un correo nuevo",
  PASSWORD_RESET: "Contraseña actualizada; inicia sesión de nuevo",
} as const;
```

- [ ] **Step 6 (developer): En `src/common/constants/routes.ts`** añadir después de `RECOVER_PASSWORD`:

```ts
  VERIFY_EMAIL: "/verify-email",
  RESET_PASSWORD: "/reset-password",
```

- [ ] **Step 7 (developer):** `pnpm lint && pnpm typecheck`. Fallará la compilación de `register-form` (usa `path`/`pathOptions`) y de `useRegisterForm` (default `path`): en esta tarea, quitar del `defaultValues` de `useRegisterForm` la clave `path` y del componente `register-form` el `InputController` de `name="path"` y el import de `pathOptions`. Luego borrar `src/features/auth/constants/pathOptions.ts` (`git rm`). Repetir `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 8 (tester): Escribir `src/features/auth/schemas/register.schema.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { registerSchema } from "@/features/auth/schemas/register.schema";

const valid = {
  name: "Ana Pérez",
  email: "ana@example.com",
  password: "sinnumeros",
  confirmPassword: "sinnumeros",
  acceptTerms: true,
};

function firstMessage(values: unknown) {
  const result = registerSchema.safeParse(values);
  return result.success ? null : result.error.issues[0]?.message;
}

describe("registerSchema", () => {
  it("accepts an 8-character password without numbers", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a 128-character password", () => {
    const password = "x".repeat(128);
    expect(
      registerSchema.safeParse({ ...valid, password, confirmPassword: password }).success,
    ).toBe(true);
  });

  it("does not keep a path field", () => {
    expect(registerSchema.parse({ ...valid, path: "initiated" })).not.toHaveProperty("path");
  });

  it.each([
    [{ ...valid, name: " " }, "Ingresa tu nombre y apellido"],
    [{ ...valid, name: "x".repeat(81) }, "El nombre no puede superar 80 caracteres"],
    [{ ...valid, password: "corta", confirmPassword: "corta" }, "La contraseña debe tener al menos 8 caracteres"],
    [
      { ...valid, password: "x".repeat(129), confirmPassword: "x".repeat(129) },
      "La contraseña no puede superar 128 caracteres",
    ],
    [{ ...valid, confirmPassword: "otra-cosa" }, "Las contraseñas no coinciden"],
    [{ ...valid, acceptTerms: false }, "Debes aceptar los Términos y la Política de privacidad"],
  ])("rejects %j with its message", (values, message) => {
    expect(firstMessage(values)).toBe(message);
  });
});
```

- [ ] **Step 9 (tester): Escribir `resetPassword.schema.test.ts` y `verifyEmail.schema.test.ts`**

```ts
// src/features/auth/schemas/resetPassword.schema.test.ts
import { describe, expect, it } from "vitest";
import { resetPasswordSchema } from "@/features/auth/schemas/resetPassword.schema";

describe("resetPasswordSchema", () => {
  it("accepts matching passwords of 8 characters", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "nuevaclave", confirmPassword: "nuevaclave" }).success,
    ).toBe(true);
  });

  it.each([
    [{ password: "corta", confirmPassword: "corta" }, "La contraseña debe tener al menos 8 caracteres"],
    [{ password: "nuevaclave", confirmPassword: "" }, "Confirma tu contraseña"],
    [{ password: "nuevaclave", confirmPassword: "distinta1" }, "Las contraseñas no coinciden"],
  ])("rejects %j with its message", (values, message) => {
    const result = resetPasswordSchema.safeParse(values);
    expect(result.success ? null : result.error.issues[0]?.message).toBe(message);
  });
});
```

```ts
// src/features/auth/schemas/verifyEmail.schema.test.ts
import { describe, expect, it } from "vitest";
import { verifyEmailSchema } from "@/features/auth/schemas/verifyEmail.schema";

describe("verifyEmailSchema", () => {
  it("accepts any non-empty password up to 128 characters", () => {
    expect(verifyEmailSchema.safeParse({ password: "x" }).success).toBe(true);
    expect(verifyEmailSchema.safeParse({ password: "x".repeat(128) }).success).toBe(true);
  });

  it.each([
    ["", "Ingresa tu contraseña"],
    ["x".repeat(129), "La contraseña no puede superar 128 caracteres"],
  ])("rejects %j with its message", (password, message) => {
    const result = verifyEmailSchema.safeParse({ password });
    expect(result.success ? null : result.error.issues[0]?.message).toBe(message);
  });
});
```

- [ ] **Step 10 (tester): Escribir los tests de las utilidades**

```ts
// src/features/auth/utils/isApiErrorCode.test.ts
import { describe, expect, it } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

describe("isApiErrorCode", () => {
  it("matches an ApiError with that code", () => {
    expect(isApiErrorCode(new ApiError(409, "x", "EMAIL_TAKEN"), "EMAIL_TAKEN")).toBe(true);
  });

  it("does not match another code, a missing code or a plain error", () => {
    expect(isApiErrorCode(new ApiError(409, "x", "OTHER"), "EMAIL_TAKEN")).toBe(false);
    expect(isApiErrorCode(new ApiError(409, "x"), "EMAIL_TAKEN")).toBe(false);
    expect(isApiErrorCode(new Error("x"), "EMAIL_TAKEN")).toBe(false);
    expect(isApiErrorCode(null, "EMAIL_TAKEN")).toBe(false);
  });
});
```

```ts
// src/features/auth/utils/readToken.test.ts
import { describe, expect, it } from "vitest";
import { readToken } from "@/features/auth/utils/readToken";

describe("readToken", () => {
  it("returns a single token", () => {
    expect(readToken("abc")).toBe("abc");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["repeated", ["a", "b"]],
    ["longer than 200 characters", "x".repeat(201)],
  ])("returns null when the token is %s", (_label, value) => {
    expect(readToken(value)).toBeNull();
  });
});
```

- [ ] **Step 11:** `pnpm test src/features/auth` → PASS.

- [ ] **Step 12: Commit**

```bash
git add src/features/auth src/common/constants/routes.ts
git commit -m "feat: :sparkles: align auth schemas with the API and add email-flow helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `AuthStatus`, `AuthTextButton` y contraseña olvidada real

**Files:**
- Create: `src/features/auth/components/auth-status/index.tsx`, `src/features/auth/components/auth-text-button/index.tsx`, `src/features/auth/hooks/useForgotPasswordMutation.ts`
- Modify: `src/features/auth/components/recover-password/recover-email-sent/index.tsx`, `src/features/auth/hooks/useRecoverPasswordForm.ts`
- Test: `src/features/auth/hooks/useForgotPasswordMutation.test.ts`, `src/features/auth/components/recover-password/index.test.tsx`

**Interfaces:**
- Consumes: `apiClient`, `notifyError`.
- Produces:
  - `AuthStatus({ icon: ReactNode; title: ReactNode; description: ReactNode; children?: ReactNode })`
  - `AuthTextButton({ label: string; onClick: () => void; disabled?: boolean })`
  - `useForgotPasswordMutation(): UseMutationResult<void, Error, string>` (variable: el correo)

- [ ] **Step 1 (developer): Crear `src/features/auth/components/auth-status/index.tsx`**

```tsx
import type { ReactNode } from "react";

type AuthStatusProps = {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
};

export function AuthStatus({ icon, title, description, children }: AuthStatusProps) {
  return (
    <div className="flex w-full flex-col items-center gap-7 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-primary text-primary">
        {icon}
      </div>
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">{title}</h1>
      <p role="status" className="text-[17px] leading-relaxed text-[#E6E6EE]">
        {description}
      </p>
      {children && (
        <div className="flex w-full flex-col items-center gap-3.5">{children}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2 (developer): Crear `src/features/auth/components/auth-text-button/index.tsx`**

```tsx
type AuthTextButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export function AuthTextButton({ label, onClick, disabled }: AuthTextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 text-sm font-bold tracking-wide text-primary hover:text-[#FFA34D] disabled:opacity-60"
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 3 (developer): Reescribir `recover-password/recover-email-sent/index.tsx`** (mismo resultado visual):

```tsx
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { AuthTextButton } from "@/features/auth/components/auth-text-button";

type RecoverEmailSentProps = { onResend: () => void };

export function RecoverEmailSent({ onResend }: RecoverEmailSentProps) {
  return (
    <AuthStatus
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      }
      title={
        <>
          Revisa tu <span className="text-secondary">correo</span>
        </>
      }
      description="Si existe una cuenta con ese correo, recibirás un enlace en unos minutos."
    >
      <ButtonLink href={routes.LOGIN} label="Volver a iniciar sesión" />
      <AuthTextButton label="¿NO LLEGÓ? REENVIAR" onClick={onResend} />
    </AuthStatus>
  );
}
```

- [ ] **Step 4 (developer): Crear `src/features/auth/hooks/useForgotPasswordMutation.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";

async function forgotPassword(email: string) {
  await apiClient.post("/auth/password/forgot", { email });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPassword, onError: notifyError });
}
```

- [ ] **Step 5 (developer): Reescribir `src/features/auth/hooks/useRecoverPasswordForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useForgotPasswordMutation } from "@/features/auth/hooks/useForgotPasswordMutation";
import {
  recoverPasswordSchema,
  type RecoverPasswordFormValues,
} from "@/features/auth/schemas/recoverPassword.schema";

export function useRecoverPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const { mutate, isPending } = useForgotPasswordMutation();
  const { control, handleSubmit } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  // La API responde igual exista o no la cuenta.
  const onSubmit = handleSubmit(({ email }) =>
    mutate(email, { onSuccess: () => setIsSent(true) }),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    isSent,
    resend: () => setIsSent(false),
  };
}
```

- [ ] **Step 6 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 7 (tester): Escribir `src/features/auth/hooks/useForgotPasswordMutation.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useForgotPasswordMutation } from "@/features/auth/hooks/useForgotPasswordMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useForgotPasswordMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts the email", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = renderHook(() => useForgotPasswordMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/forgot", { email: "ana@example.com" });
  });

  it("notifies a 429", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = renderHook(() => useForgotPasswordMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });
});
```

- [ ] **Step 8 (tester): Escribir `src/features/auth/components/recover-password/index.test.tsx`**

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { apiClient } from "@/common/api/apiClient";
import { RecoverPassword } from "@/features/auth/components/recover-password";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));

describe("RecoverPassword", () => {
  it("shows the neutral confirmation after the API accepts the request", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<RecoverPassword />);
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar enlace" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Si existe una cuenta con ese correo");
    await userEvent.click(screen.getByRole("button", { name: "¿NO LLEGÓ? REENVIAR" }));
    expect(screen.getByRole("button", { name: "Enviar enlace" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 9:** `pnpm test src/features/auth` → PASS.

- [ ] **Step 10: Commit**

```bash
git add src/features/auth
git commit -m "feat: :sparkles: request password resets from the API and share the auth status view

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Registro real con reenvío de verificación

**Files:**
- Create: `src/features/auth/hooks/useRegisterMutation.ts`, `src/features/auth/hooks/useResendVerificationMutation.ts`, `src/features/auth/components/register-form/register-email-sent/index.tsx`
- Modify: `src/features/auth/hooks/useRegisterForm.ts`, `src/features/auth/components/register-form/index.tsx`, `src/app/(auth)/registro/page.tsx`
- Test: `src/features/auth/hooks/useRegisterMutation.test.ts`, `src/features/auth/hooks/useResendVerificationMutation.test.ts`, `src/features/auth/components/register-form/index.test.tsx`

**Interfaces:**
- Consumes: `isApiErrorCode`, `authMessages`, `registerSchema` (Task 1), `AuthStatus`, `AuthTextButton` (Task 2).
- Produces:
  - `useRegisterMutation(): UseMutationResult<void, Error, { name: string; email: string; password: string }>`
  - `useResendVerificationMutation(): UseMutationResult<void, Error, string>` (variable: el correo; éxito → `toast.success(authMessages.VERIFICATION_RESENT)`)
  - `useRegisterForm(): { control; onSubmit; isSubmitting; isEmailTaken: boolean; sentEmail: string | null; resend: () => void; isResending: boolean }`

- [ ] **Step 1 (developer): Crear `src/features/auth/hooks/useRegisterMutation.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

type RegisterRequest = { name: string; email: string; password: string };

async function register(body: RegisterRequest) {
  await apiClient.post("/auth/register", body);
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    // EMAIL_TAKEN se muestra bajo el campo de correo.
    onError: (error) => {
      if (!isApiErrorCode(error, "EMAIL_TAKEN")) notifyError(error);
    },
  });
}
```

- [ ] **Step 2 (developer): Crear `src/features/auth/hooks/useResendVerificationMutation.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { authMessages } from "@/features/auth/constants/authMessages";

async function resendVerification(email: string) {
  await apiClient.post("/auth/email/verify/resend", { email });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: resendVerification,
    onSuccess: () => toast.success(authMessages.VERIFICATION_RESENT),
    onError: notifyError,
  });
}
```

- [ ] **Step 3 (developer): Reescribir `src/features/auth/hooks/useRegisterForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { authMessages } from "@/features/auth/constants/authMessages";
import { useRegisterMutation } from "@/features/auth/hooks/useRegisterMutation";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

const defaultValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function useRegisterForm() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();
  const resendMutation = useResendVerificationMutation();
  const {
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { isSubmitted, errors },
  } = useForm<RegisterFormValues>({
    defaultValues,
    resolver: zodResolver(registerSchema),
  });
  const password = useWatch({ control, name: "password" });

  // Tras un envío fallido, corregir `password` debe actualizar el error de `confirmPassword`.
  useEffect(() => {
    if (isSubmitted) void trigger("confirmPassword");
  }, [password, isSubmitted, trigger]);

  const onSubmit = handleSubmit(({ name, email, password }) =>
    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: () => setSentEmail(email),
        onError: (error) => {
          if (isApiErrorCode(error, "EMAIL_TAKEN")) {
            setError("email", { message: authMessages.EMAIL_TAKEN });
          }
        },
      },
    ),
  );

  return {
    control,
    onSubmit,
    isSubmitting: registerMutation.isPending,
    // Desaparece cuando el campo se vuelve a validar al editarlo.
    isEmailTaken: errors.email?.message === authMessages.EMAIL_TAKEN,
    sentEmail,
    resend: () => {
      if (sentEmail) resendMutation.mutate(sentEmail);
    },
    isResending: resendMutation.isPending,
  };
}
```

- [ ] **Step 4 (developer): Crear `src/features/auth/components/register-form/register-email-sent/index.tsx`**

```tsx
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { AuthTextButton } from "@/features/auth/components/auth-text-button";

type RegisterEmailSentProps = {
  email: string;
  onResend: () => void;
  isResending: boolean;
};

export function RegisterEmailSent({ email, onResend, isResending }: RegisterEmailSentProps) {
  return (
    <AuthStatus
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      }
      title={
        <>
          Revisa tu <span className="text-secondary">correo</span>
        </>
      }
      description={
        <>
          Te enviamos un enlace a <strong>{email}</strong> para confirmar tu
          cuenta. Vence en 24 horas.
        </>
      }
    >
      <ButtonLink href={routes.LOGIN} label="Ir a iniciar sesión" />
      <AuthTextButton label="¿NO LLEGÓ? REENVIAR" onClick={onResend} disabled={isResending} />
    </AuthStatus>
  );
}
```

- [ ] **Step 5 (developer): Reescribir `src/features/auth/components/register-form/index.tsx`**

```tsx
"use client";
import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import { RegisterEmailSent } from "@/features/auth/components/register-form/register-email-sent";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";

export function RegisterForm() {
  const { control, onSubmit, isSubmitting, isEmailTaken, sentEmail, resend, isResending } =
    useRegisterForm();

  if (sentEmail) {
    return <RegisterEmailSent email={sentEmail} onResend={resend} isResending={isResending} />;
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController control={control} name="name" label="Nombre y Apellido" autoComplete="name" />
      <InputController
        control={control}
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
      />
      {isEmailTaken && (
        <Link
          href={routes.RECOVER_PASSWORD}
          className="-mt-2 mb-4 self-start text-sm text-primary hover:text-[#FFA34D]"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      )}
      <InputController
        control={control}
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        description="Mínimo 8 caracteres."
      />
      <InputController
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
      />
      <InputController
        control={control}
        name="acceptTerms"
        type="checkbox"
        label={
          <>
            Acepto los{" "}
            <Link href={routes.TERMS} className="text-primary hover:text-[#FFA34D]">
              Términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link href={routes.PRIVACY} className="text-primary hover:text-[#FFA34D]">
              Política de privacidad
            </Link>
            .
          </>
        }
      />
      <Button type="submit" label="Registrarme" fullWidth disabled={isSubmitting} />
    </form>
  );
}
```

- [ ] **Step 6 (developer): Ajustar textos de `src/app/(auth)/registro/page.tsx`** (ya no se elige path al registrarse; el path lo asigna el admin):

```tsx
      <AuthIntro
        title={
          <>
            Crea tu <span className="text-primary">cuenta</span> y{" "}
            <span className="text-secondary">empieza</span>
          </>
        }
        description={
          <>
            Crea tu cuenta y, al activar tu membresía, te asignamos un{" "}
            <strong>MENTOR</strong> con el plan exacto que debes seguir.
          </>
        }
      >
```

- [ ] **Step 7 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 8 (tester): Escribir `useRegisterMutation.test.ts` y `useResendVerificationMutation.test.ts`**

```ts
// src/features/auth/hooks/useRegisterMutation.test.ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useRegisterMutation } from "@/features/auth/hooks/useRegisterMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const body = { name: "Ana Pérez", email: "ana@example.com", password: "unaclavesegura" };

describe("useRegisterMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts name, email and password only", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = renderHook(() => useRegisterMutation(), { wrapper });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", body);
  });

  it("does not toast EMAIL_TAKEN", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(409, "x", "EMAIL_TAKEN"));
    const { result } = renderHook(() => useRegisterMutation(), { wrapper });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("toasts any other error", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = renderHook(() => useRegisterMutation(), { wrapper });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });
});
```

```ts
// src/features/auth/hooks/useResendVerificationMutation.test.ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useResendVerificationMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts the email and confirms with a neutral message", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = renderHook(() => useResendVerificationMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/email/verify/resend", { email: "ana@example.com" });
    expect(toast.success).toHaveBeenCalledWith(
      "Si la cuenta existe y no está confirmada, enviamos un correo nuevo",
    );
  });

  it("toasts a 429 with the API message", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = renderHook(() => useResendVerificationMutation(), { wrapper });
    act(() => result.current.mutate("ana@example.com"));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });
});
```

- [ ] **Step 9 (tester): Escribir `src/features/auth/components/register-form/index.test.tsx`**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { RegisterForm } from "@/features/auth/components/register-form";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const okResponse = { data: null } as Awaited<ReturnType<typeof apiClient.post>>;

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText("Nombre y Apellido"), "Ana Pérez");
  await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
  await userEvent.type(screen.getByLabelText("Contraseña"), "unaclavesegura");
  await userEvent.type(screen.getByLabelText("Confirmar contraseña"), "unaclavesegura");
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: "Registrarme" }));
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("has no path field", () => {
    renderWithClient(<RegisterForm />);
    expect(screen.queryByText("Tu path")).not.toBeInTheDocument();
  });

  it("shows the sent screen and resends to the same email", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(okResponse);
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    expect(await screen.findByRole("status")).toHaveTextContent("ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "¿NO LLEGÓ? REENVIAR" }));
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenLastCalledWith("/auth/email/verify/resend", {
        email: "ana@example.com",
      }),
    );
  });

  it("shows EMAIL_TAKEN under the email field with a recovery link and no resend", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(409, "x", "EMAIL_TAKEN"));
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    expect(await screen.findByText("Ya existe una cuenta con este correo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toHaveAttribute(
      "href",
      "/recuperar-contrasena",
    );
    expect(screen.queryByRole("button", { name: /REENVIAR/ })).not.toBeInTheDocument();
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("clears the EMAIL_TAKEN error once the email is edited", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(409, "x", "EMAIL_TAKEN"));
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    await screen.findByText("Ya existe una cuenta con este correo");
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "x");
    await waitFor(() =>
      expect(screen.queryByText("Ya existe una cuenta con este correo")).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("link", { name: "¿Olvidaste tu contraseña?" })).not.toBeInTheDocument();
  });

  it("keeps the sent screen and toasts when the resend hits 429", async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce(okResponse)
      .mockRejectedValueOnce(new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS"));
    renderWithClient(<RegisterForm />);
    await fillAndSubmit();
    await userEvent.click(await screen.findByRole("button", { name: "¿NO LLEGÓ? REENVIAR" }));
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
    expect(screen.getByRole("status")).toHaveTextContent("ana@example.com");
  });
});
```

- [ ] **Step 10:** `pnpm test src/features/auth` → PASS.

- [ ] **Step 11: Commit**

```bash
git add src/features/auth "src/app/(auth)/registro/page.tsx"
git commit -m "feat: :sparkles: register against the API and resend the verification email

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Aviso de correo sin confirmar en el login

**Files:**
- Modify: `src/features/auth/hooks/useLoginMutation.ts`, `src/features/auth/hooks/useLoginForm.ts`, `src/features/auth/components/login-form/index.tsx`
- Create: `src/features/auth/components/login-form/unverified-email-notice/index.tsx`
- Test: `src/features/auth/hooks/useLoginMutation.test.ts` (añadir caso), `src/features/auth/components/login-form/index.test.tsx` (añadir casos)

**Interfaces:**
- Consumes: `useResendVerificationMutation` (Task 3), `AuthTextButton` (Task 2), `isApiErrorCode` (Task 1).
- Produces: `useLoginForm(): { control; onSubmit; isSubmitting; unverifiedEmail: string | null; resendVerification: () => void; isResending: boolean }`

- [ ] **Step 1 (developer): En `useLoginMutation.ts`** reemplazar `onError: notifyError,` por:

```ts
    // EMAIL_NOT_VERIFIED se muestra como aviso dentro del formulario.
    onError: (error) => {
      if (!isApiErrorCode(error, "EMAIL_NOT_VERIFIED")) notifyError(error);
    },
```

con el import `import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";`.

- [ ] **Step 2 (developer): Reescribir `src/features/auth/hooks/useLoginForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

const defaultValues: LoginFormValues = { email: "", password: "" };

export function useLoginForm() {
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const { mutate, isPending } = useLoginMutation();
  const resendMutation = useResendVerificationMutation();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  // Al guardar los tokens, el SessionGuard del grupo (guest) redirige al dashboard.
  const onSubmit = handleSubmit((values) => {
    setUnverifiedEmail(null);
    mutate(values, {
      onError: (error) => {
        if (isApiErrorCode(error, "EMAIL_NOT_VERIFIED")) setUnverifiedEmail(values.email);
      },
    });
  });

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    unverifiedEmail,
    resendVerification: () => {
      if (unverifiedEmail) resendMutation.mutate(unverifiedEmail);
    },
    isResending: resendMutation.isPending,
  };
}
```

- [ ] **Step 3 (developer): Crear `login-form/unverified-email-notice/index.tsx`**

```tsx
import { AuthTextButton } from "@/features/auth/components/auth-text-button";

type UnverifiedEmailNoticeProps = {
  email: string;
  onResend: () => void;
  isResending: boolean;
};

export function UnverifiedEmailNotice({ email, onResend, isResending }: UnverifiedEmailNoticeProps) {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-col items-start gap-1 rounded-xl border border-primary bg-[#000E2799] p-4 text-[15px] text-[#E6E6EE]"
    >
      <p>
        Confirma tu correo para entrar. Te enviamos un enlace a <strong>{email}</strong>.
      </p>
      <AuthTextButton label="REENVIAR CORREO" onClick={onResend} disabled={isResending} />
    </div>
  );
}
```

- [ ] **Step 4 (developer): En `login-form/index.tsx`** leer los campos nuevos del hook y renderizar el aviso antes del primer `InputController`:

```tsx
  const { control, onSubmit, isSubmitting, unverifiedEmail, resendVerification, isResending } =
    useLoginForm();
```

```tsx
      {unverifiedEmail && (
        <UnverifiedEmailNotice
          email={unverifiedEmail}
          onResend={resendVerification}
          isResending={isResending}
        />
      )}
```

con el import `import { UnverifiedEmailNotice } from "@/features/auth/components/login-form/unverified-email-notice";`.

- [ ] **Step 5 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 6 (tester): En `useLoginMutation.test.ts`** sustituir el caso "notifies the API error and saves nothing" (que usaba `EMAIL_NOT_VERIFIED`) por estos dos:

```ts
  it("notifies an error that the form does not handle", async () => {
    const error = new ApiError(401, "Credenciales inválidas", "INVALID_CREDENTIALS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
    expect(getTokens()).toBeNull();
  });

  it("does not toast EMAIL_NOT_VERIFIED", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"));
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
  });
```

- [ ] **Step 7 (tester): En `login-form/index.test.tsx`** añadir `vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));` y estos casos:

```tsx
  it("shows the unverified notice and resends to the typed email", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"))
      .mockResolvedValueOnce({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent("ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "REENVIAR CORREO" }));
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenLastCalledWith("/auth/email/verify/resend", {
        email: "ana@example.com",
      }),
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("hides the notice when the next attempt fails for another reason", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(403, "x", "EMAIL_NOT_VERIFIED"))
      .mockRejectedValueOnce(new ApiError(401, "x", "INVALID_CREDENTIALS"));
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
```

- [ ] **Step 8:** `pnpm test src/features/auth` → PASS.

- [ ] **Step 9: Commit**

```bash
git add src/features/auth
git commit -m "feat: :sparkles: offer to resend the verification email on unverified logins

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Grupo `(guest)` y ruta `/verify-email`

**Files:**
- Modify: `src/app/(auth)/layout.tsx`, `src/features/auth/index.ts`
- Create: `src/app/(auth)/(guest)/layout.tsx`, `src/app/(auth)/verify-email/page.tsx`
- Move: `src/app/(auth)/iniciar-sesion/` → `src/app/(auth)/(guest)/iniciar-sesion/`, `src/app/(auth)/registro/` → `src/app/(auth)/(guest)/registro/`, `src/app/(auth)/recuperar-contrasena/` → `src/app/(auth)/(guest)/recuperar-contrasena/`
- Create: `src/features/auth/hooks/useVerifyEmailMutation.ts`, `src/features/auth/hooks/useVerifyEmailForm.ts`, `src/features/auth/hooks/useResendVerificationForm.ts`, `src/features/auth/components/verify-email/index.tsx`, `verify-email/verify-email-form/index.tsx`, `verify-email/verify-email-expired/index.tsx`
- Test: `src/features/auth/hooks/useVerifyEmailMutation.test.ts`, `src/features/auth/components/verify-email/index.test.tsx`

**Interfaces:**
- Consumes: `authTokensSchema`, `saveTokens` (sub-proyecto 1), `verifyEmailSchema`, `recoverPasswordSchema`, `readToken`, `isApiErrorCode`, `authMessages`, `routes.VERIFY_EMAIL` (Task 1), `AuthStatus` (Task 2), `useResendVerificationMutation` (Task 3).
- Produces:
  - `useVerifyEmailMutation(): UseMutationResult<AuthTokens, Error, { token: string; password: string }>`
  - `useVerifyEmailForm(token: string): { control; onSubmit; isSubmitting; isWrongPassword: boolean; isLinkExpired: boolean }`
  - `useResendVerificationForm(): { control; onSubmit; isSubmitting }`
  - `VerifyEmail({ token: string | null })` exportado en `@/features/auth`; `readToken` exportado en `@/features/auth`.

- [ ] **Step 1 (developer): Mover las rutas de invitado y separar el guard**

```bash
mkdir -p "src/app/(auth)/(guest)"
git mv "src/app/(auth)/iniciar-sesion" "src/app/(auth)/(guest)/iniciar-sesion"
git mv "src/app/(auth)/registro" "src/app/(auth)/(guest)/registro"
git mv "src/app/(auth)/recuperar-contrasena" "src/app/(auth)/(guest)/recuperar-contrasena"
```

`src/app/(auth)/layout.tsx` queda sin guard:

```tsx
import type { ReactNode } from "react";
import { Navbar } from "@/common/components/navbar";
import { AuthBottomBar } from "@/features/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-home bg-cover bg-bottom pt-[85px] text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-black/[0.55]" />
      <Navbar changeLogo />
      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-wrap items-center justify-between gap-12 px-4 py-8 md:px-12 md:py-20">
        {children}
      </main>
      <AuthBottomBar />
    </div>
  );
}
```

`src/app/(auth)/(guest)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";

// Login, registro y recuperar contraseña: con sesión abierta, al dashboard.
// /verify-email y /reset-password quedan fuera para que sus enlaces sirvan siempre.
export default function GuestLayout({ children }: { children: ReactNode }) {
  return <SessionGuard access="guest">{children}</SessionGuard>;
}
```

Nota: `SessionGuard` renderiza `children` directamente cuando está listo, así que login y registro siguen siendo hijos flex del `<main>` del layout padre.

- [ ] **Step 2 (developer): Crear `src/features/auth/hooks/useVerifyEmailMutation.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { authTokensSchema } from "@/common/api/auth.schema";
import { saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

type VerifyEmailRequest = { token: string; password: string };

async function verifyEmail(body: VerifyEmailRequest) {
  const { data } = await apiClient.post("/auth/email/verify", body);
  return authTokensSchema.parse(data);
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyEmail,
    // Confirmar el correo inicia sesión, igual que el login.
    onSuccess: (tokens) => {
      queryClient.clear();
      saveTokens(tokens);
    },
    // Contraseña incorrecta y enlace vencido se muestran en la pantalla.
    onError: (error) => {
      if (
        !isApiErrorCode(error, "INVALID_CREDENTIALS") &&
        !isApiErrorCode(error, "INVALID_EMAIL_TOKEN")
      ) {
        notifyError(error);
      }
    },
  });
}
```

- [ ] **Step 3 (developer): Crear `src/features/auth/hooks/useVerifyEmailForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { routes } from "@/common/constants/routes";
import { authMessages } from "@/features/auth/constants/authMessages";
import { useVerifyEmailMutation } from "@/features/auth/hooks/useVerifyEmailMutation";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/features/auth/schemas/verifyEmail.schema";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

export function useVerifyEmailForm(token: string) {
  const router = useRouter();
  const { mutate, isPending, error } = useVerifyEmailMutation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    defaultValues: { password: "" },
    resolver: zodResolver(verifyEmailSchema),
  });

  const onSubmit = handleSubmit(({ password }) =>
    mutate(
      { token, password },
      {
        onSuccess: () => router.replace(routes.DASHBOARD),
        // El enlace sigue sirviendo: se puede reintentar.
        onError: (mutationError) => {
          if (isApiErrorCode(mutationError, "INVALID_CREDENTIALS")) {
            setError("password", { message: authMessages.WRONG_ACCOUNT_PASSWORD });
          }
        },
      },
    ),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    isWrongPassword: errors.password?.message === authMessages.WRONG_ACCOUNT_PASSWORD,
    isLinkExpired: isApiErrorCode(error, "INVALID_EMAIL_TOKEN"),
  };
}
```

- [ ] **Step 4 (developer): Crear `src/features/auth/hooks/useResendVerificationForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useResendVerificationMutation } from "@/features/auth/hooks/useResendVerificationMutation";
import {
  recoverPasswordSchema,
  type RecoverPasswordFormValues,
} from "@/features/auth/schemas/recoverPassword.schema";

export function useResendVerificationForm() {
  const { mutate, isPending } = useResendVerificationMutation();
  const { control, handleSubmit } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  const onSubmit = handleSubmit(({ email }) => mutate(email));

  return { control, onSubmit, isSubmitting: isPending };
}
```

- [ ] **Step 5 (developer): Crear `verify-email/verify-email-form/index.tsx`**

```tsx
import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import type { useVerifyEmailForm } from "@/features/auth/hooks/useVerifyEmailForm";

type VerifyEmailFormProps = Pick<
  ReturnType<typeof useVerifyEmailForm>,
  "control" | "onSubmit" | "isSubmitting" | "isWrongPassword"
>;

export function VerifyEmailForm({ control, onSubmit, isSubmitting, isWrongPassword }: VerifyEmailFormProps) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
      />
      {isWrongPassword && (
        <Link
          href={routes.RECOVER_PASSWORD}
          className="-mt-2 mb-4 self-end text-sm text-primary hover:text-[#FFA34D]"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      )}
      <Button type="submit" label="Confirmar correo" fullWidth disabled={isSubmitting} />
    </form>
  );
}
```

- [ ] **Step 6 (developer): Crear `verify-email/verify-email-expired/index.tsx`**

```tsx
"use client";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { useResendVerificationForm } from "@/features/auth/hooks/useResendVerificationForm";

export function VerifyEmailExpired() {
  const { control, onSubmit, isSubmitting } = useResendVerificationForm();

  return (
    <section className="mx-auto flex w-full max-w-md flex-col">
    <AuthStatus
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      }
      title={
        <>
          El enlace <span className="text-secondary">venció</span>
        </>
      }
      description="El enlace venció o ya se usó. Escribe tu correo y te enviamos uno nuevo."
    >
      <form
        noValidate
        onSubmit={onSubmit}
        className="flex w-full flex-col rounded-[18px] border border-white/15 bg-[#000E2799] p-6 text-left md:p-9"
      >
        <InputController
          control={control}
          name="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
        />
        <Button type="submit" label="Enviar enlace nuevo" fullWidth disabled={isSubmitting} />
      </form>
    </AuthStatus>
    </section>
  );
}
```

- [ ] **Step 7 (developer): Crear `verify-email/index.tsx`**

```tsx
"use client";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { VerifyEmailExpired } from "@/features/auth/components/verify-email/verify-email-expired";
import { VerifyEmailForm } from "@/features/auth/components/verify-email/verify-email-form";
import { useVerifyEmailForm } from "@/features/auth/hooks/useVerifyEmailForm";

type VerifyEmailProps = { token: string | null };

export function VerifyEmail({ token }: VerifyEmailProps) {
  // El hook se llama siempre (reglas de hooks); sin token nunca se envía el formulario.
  const { control, onSubmit, isSubmitting, isWrongPassword, isLinkExpired } =
    useVerifyEmailForm(token ?? "");

  if (!token || isLinkExpired) return <VerifyEmailExpired />;

  return (
    <>
      <AuthIntro
        title={
          <>
            Confirma tu <span className="text-secondary">correo</span>
          </>
        }
        description="Escribe la contraseña de tu cuenta para confirmar tu correo y entrar."
      />
      <AuthCard title="Confirmar correo">
        <VerifyEmailForm
          control={control}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isWrongPassword={isWrongPassword}
        />
      </AuthCard>
    </>
  );
}
```

`VerifyEmail` solo importa a sus hijos (`verify-email-form`, `verify-email-expired`), como pide §4.1.

- [ ] **Step 8 (developer): Exportar en `src/features/auth/index.ts`**

```ts
export { ResetPassword } from "@/features/auth/components/reset-password";
export { VerifyEmail } from "@/features/auth/components/verify-email";
export { readToken } from "@/features/auth/utils/readToken";
```

(`ResetPassword` se crea en Task 6; en esta tarea añadir solo `VerifyEmail` y `readToken`.)

- [ ] **Step 9 (developer): Crear `src/app/(auth)/verify-email/page.tsx`**

```tsx
import type { Metadata } from "next";
import { readToken, VerifyEmail } from "@/features/auth";

export const metadata: Metadata = {
  title: "Confirmar correo",
  robots: { index: false, follow: false },
  // El token va en la URL: no se envía a otros sitios en la cabecera Referer.
  referrer: "no-referrer",
};

type VerifyEmailRouteProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyEmailRoute({ searchParams }: VerifyEmailRouteProps) {
  const { token } = await searchParams;
  return <VerifyEmail token={readToken(token)} />;
}
```

- [ ] **Step 10 (developer):** `pnpm lint && pnpm typecheck` → pasan. Comprobar que `/iniciar-sesion`, `/registro` y `/recuperar-contrasena` siguen respondiendo en `pnpm dev`.

- [ ] **Step 11 (tester): Escribir `src/features/auth/hooks/useVerifyEmailMutation.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { useVerifyEmailMutation } from "@/features/auth/hooks/useVerifyEmailMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useVerifyEmailMutation(), { wrapper }) };
}

const body = { token: "t1", password: "secreta" };

describe("useVerifyEmailMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts token and password, saves the tokens and drops the previous cache", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Otra persona" });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/email/verify", body);
    expect(getTokens()).toMatchObject({ accessToken: "a" });
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
  });

  it.each(["INVALID_CREDENTIALS", "INVALID_EMAIL_TOKEN"])("does not toast %s", async (code) => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(400, "x", code));
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("toasts a 429", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });

  it("saves nothing when the response does not match the schema", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: "a" } } as Awaited<
      ReturnType<typeof apiClient.post>
    >);
    const { result } = setup();
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getTokens()).toBeNull();
  });
});
```

- [ ] **Step 12 (tester): Escribir `src/features/auth/components/verify-email/index.test.tsx`**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { VerifyEmail } from "@/features/auth/components/verify-email";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const tokens = { data: { accessToken: "a", refreshToken: "r", expiresIn: 900 } } as Awaited<
  ReturnType<typeof apiClient.post>
>;

async function submitPassword(password: string) {
  const field = screen.getByLabelText("Contraseña");
  await userEvent.clear(field);
  await userEvent.type(field, password);
  await userEvent.click(screen.getByRole("button", { name: "Confirmar correo" }));
}

describe("VerifyEmail", () => {
  beforeEach(() => {
    localStorage.clear();
    router.replace.mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it("shows the expired state without a token and does not call the API", () => {
    renderWithClient(<VerifyEmail token={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("confirms the email and goes to the dashboard", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(tokens);
    renderWithClient(<VerifyEmail token="t1" />);
    await submitPassword("secreta");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/email/verify", { token: "t1", password: "secreta" });
    expect(getTokens()).not.toBeNull();
  });

  it("shows the wrong-password error and lets the person retry with the same link", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(401, "x", "INVALID_CREDENTIALS"))
      .mockResolvedValueOnce(tokens);
    renderWithClient(<VerifyEmail token="t1" />);
    await submitPassword("equivocada");
    expect(await screen.findByText("La contraseña no es la de tu cuenta")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toBeInTheDocument();
    await submitPassword("secreta");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("switches to the expired state on INVALID_EMAIL_TOKEN and resends", async () => {
    vi.mocked(apiClient.post)
      .mockRejectedValueOnce(new ApiError(400, "x", "INVALID_EMAIL_TOKEN"))
      .mockResolvedValueOnce({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<VerifyEmail token="t1" />);
    await submitPassword("secreta");
    expect(await screen.findByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar enlace nuevo" }));
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenLastCalledWith("/auth/email/verify/resend", {
        email: "ana@example.com",
      }),
    );
  });
});
```

- [ ] **Step 13:** `pnpm test` → todo PASS (incluidos los tests de login, registro y recuperar contraseña tras mover las rutas).

- [ ] **Step 14: Commit**

```bash
git add "src/app/(auth)" src/features/auth
git commit -m "feat: :sparkles: confirm the email at /verify-email outside the guest guard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Ruta `/reset-password`

**Files:**
- Create: `src/features/auth/hooks/useResetPasswordMutation.ts`, `src/features/auth/hooks/useResetPasswordForm.ts`, `src/features/auth/components/reset-password/index.tsx`, `reset-password/reset-password-form/index.tsx`, `reset-password/reset-password-expired/index.tsx`, `src/app/(auth)/reset-password/page.tsx`
- Modify: `src/features/auth/index.ts`
- Test: `src/features/auth/hooks/useResetPasswordMutation.test.ts`, `src/features/auth/components/reset-password/index.test.tsx`

**Interfaces:**
- Consumes: `clearTokens` (sub-proyecto 1), `resetPasswordSchema`, `readToken`, `isApiErrorCode`, `authMessages`, `routes` (Task 1), `AuthStatus` (Task 2).
- Produces:
  - `useResetPasswordMutation(): UseMutationResult<void, Error, { token: string; password: string }>`
  - `useResetPasswordForm(token: string): { control; onSubmit; isSubmitting; isLinkExpired: boolean }`
  - `ResetPassword({ token: string | null })` exportado en `@/features/auth`.

- [ ] **Step 1 (developer): Crear `src/features/auth/hooks/useResetPasswordMutation.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { clearTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { authMessages } from "@/features/auth/constants/authMessages";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

type ResetPasswordRequest = { token: string; password: string };

async function resetPassword(body: ResetPasswordRequest) {
  await apiClient.post("/auth/password/reset", body);
}

export function useResetPasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetPassword,
    // La API cierra todas las sesiones de la cuenta: también la de este navegador.
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      toast.success(authMessages.PASSWORD_RESET);
    },
    onError: (error) => {
      if (!isApiErrorCode(error, "INVALID_EMAIL_TOKEN")) notifyError(error);
    },
  });
}
```

- [ ] **Step 2 (developer): Crear `src/features/auth/hooks/useResetPasswordForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { routes } from "@/common/constants/routes";
import { useResetPasswordMutation } from "@/features/auth/hooks/useResetPasswordMutation";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/resetPassword.schema";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

export function useResetPasswordForm(token: string) {
  const router = useRouter();
  const { mutate, isPending, error } = useResetPasswordMutation();
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitted },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetPasswordSchema),
  });
  const password = useWatch({ control, name: "password" });

  // Igual que en el registro: corregir `password` actualiza el error de `confirmPassword`.
  useEffect(() => {
    if (isSubmitted) void trigger("confirmPassword");
  }, [password, isSubmitted, trigger]);

  const onSubmit = handleSubmit(({ password: newPassword }) =>
    mutate(
      { token, password: newPassword },
      { onSuccess: () => router.replace(routes.LOGIN) },
    ),
  );

  return {
    control,
    onSubmit,
    isSubmitting: isPending,
    isLinkExpired: isApiErrorCode(error, "INVALID_EMAIL_TOKEN"),
  };
}
```

- [ ] **Step 3 (developer): Crear `reset-password/reset-password-form/index.tsx`**

```tsx
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import type { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";

type ResetPasswordFormProps = Pick<
  ReturnType<typeof useResetPasswordForm>,
  "control" | "onSubmit" | "isSubmitting"
>;

export function ResetPasswordForm({ control, onSubmit, isSubmitting }: ResetPasswordFormProps) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="password"
        label="Contraseña nueva"
        type="password"
        autoComplete="new-password"
        description="Mínimo 8 caracteres."
      />
      <InputController
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
      />
      <Button type="submit" label="Guardar contraseña" fullWidth disabled={isSubmitting} />
    </form>
  );
}
```

- [ ] **Step 4 (developer): Crear `reset-password/reset-password-expired/index.tsx`**

```tsx
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
import { AuthStatus } from "@/features/auth/components/auth-status";

export function ResetPasswordExpired() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col">
      <AuthStatus
        icon={
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        }
        title={
          <>
            El enlace <span className="text-secondary">venció</span>
          </>
        }
        description="El enlace venció o ya se usó. Pide uno nuevo para crear tu contraseña."
      >
        <ButtonLink href={routes.RECOVER_PASSWORD} label="Pedir otro enlace" />
      </AuthStatus>
    </section>
  );
}
```

- [ ] **Step 5 (developer): Crear `reset-password/index.tsx`**

```tsx
"use client";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { ResetPasswordExpired } from "@/features/auth/components/reset-password/reset-password-expired";
import { ResetPasswordForm } from "@/features/auth/components/reset-password/reset-password-form";
import { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";

type ResetPasswordProps = { token: string | null };

export function ResetPassword({ token }: ResetPasswordProps) {
  // El hook se llama siempre (reglas de hooks); sin token nunca se envía el formulario.
  const { control, onSubmit, isSubmitting, isLinkExpired } = useResetPasswordForm(token ?? "");

  if (!token || isLinkExpired) return <ResetPasswordExpired />;

  return (
    <>
      <AuthIntro
        title={
          <>
            Crea tu nueva <span className="text-secondary">llave</span>
          </>
        }
        description="Elige una contraseña nueva. Al guardarla se cerrarán todas tus sesiones abiertas."
      />
      <AuthCard title="Nueva contraseña">
        <ResetPasswordForm control={control} onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </AuthCard>
    </>
  );
}
```

- [ ] **Step 6 (developer): Exportar en `src/features/auth/index.ts`**: `export { ResetPassword } from "@/features/auth/components/reset-password";`

- [ ] **Step 7 (developer): Crear `src/app/(auth)/reset-password/page.tsx`**

```tsx
import type { Metadata } from "next";
import { readToken, ResetPassword } from "@/features/auth";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
  // El token va en la URL: no se envía a otros sitios en la cabecera Referer.
  referrer: "no-referrer",
};

type ResetPasswordRouteProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordRoute({ searchParams }: ResetPasswordRouteProps) {
  const { token } = await searchParams;
  return <ResetPassword token={readToken(token)} />;
}
```

- [ ] **Step 8 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 9 (tester): Escribir `src/features/auth/hooks/useResetPasswordMutation.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { useResetPasswordMutation } from "@/features/auth/hooks/useResetPasswordMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const body = { token: "t1", password: "nuevaclave" };

describe("useResetPasswordMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts token and password, clears the local session and confirms", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = renderHook(() => useResetPasswordMutation(), { wrapper });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/reset", body);
    expect(getTokens()).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("Contraseña actualizada; inicia sesión de nuevo");
  });

  it("does not toast INVALID_EMAIL_TOKEN and keeps the session", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(400, "x", "INVALID_EMAIL_TOKEN"));
    const { result } = renderHook(() => useResetPasswordMutation(), { wrapper });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();
    expect(getTokens()).not.toBeNull();
  });

  it("toasts a 429", async () => {
    const error = new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = renderHook(() => useResetPasswordMutation(), { wrapper });
    act(() => result.current.mutate(body));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
  });
});
```

- [ ] **Step 10 (tester): Escribir `src/features/auth/components/reset-password/index.test.tsx`**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { ResetPassword } from "@/features/auth/components/reset-password";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

async function submit(password: string, confirmPassword = password) {
  await userEvent.type(screen.getByLabelText("Contraseña nueva"), password);
  await userEvent.type(screen.getByLabelText("Confirmar contraseña"), confirmPassword);
  await userEvent.click(screen.getByRole("button", { name: "Guardar contraseña" }));
}

describe("ResetPassword", () => {
  beforeEach(() => {
    router.replace.mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it("shows the expired state with a link to request another one when there is no token", () => {
    renderWithClient(<ResetPassword token={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
    expect(screen.getByRole("link", { name: "Pedir otro enlace" })).toHaveAttribute(
      "href",
      "/recuperar-contrasena",
    );
  });

  it("saves the new password and goes to the login", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<ResetPassword token="t1" />);
    await submit("nuevaclave");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion"));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/password/reset", { token: "t1", password: "nuevaclave" });
  });

  it("blocks mismatched passwords without calling the API", async () => {
    renderWithClient(<ResetPassword token="t1" />);
    await submit("nuevaclave", "otraclave1");
    expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("switches to the expired state on INVALID_EMAIL_TOKEN", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(400, "x", "INVALID_EMAIL_TOKEN"));
    renderWithClient(<ResetPassword token="t1" />);
    await submit("nuevaclave");
    expect(await screen.findByRole("status")).toHaveTextContent("El enlace venció o ya se usó");
  });
});
```

- [ ] **Step 11:** `pnpm test` → todo PASS.

- [ ] **Step 12: Commit**

```bash
git add "src/app/(auth)/reset-password" src/features/auth
git commit -m "feat: :sparkles: set a new password at /reset-password

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Verificación final contra la API

**Files:** ninguno nuevo (solo correcciones si algo falla).

- [ ] **Step 1:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` → los cuatro en verde.

- [ ] **Step 2: Prueba manual** con `swordvoice-api` en `http://localhost:4000` y `WEB_APP_URL=http://localhost:3000` (revisar en la API cómo ver los correos en desarrollo: consola o Resend en modo prueba):
  1. `/registro` con un correo nuevo → "Revisa tu correo" con el correo; "REENVIAR" muestra el toast neutro.
  2. `/registro` con un correo existente → error bajo el correo + link a recuperar contraseña; al editar el correo desaparecen.
  3. `/iniciar-sesion` con la cuenta sin confirmar → aviso "Confirma tu correo para entrar"; "REENVIAR CORREO" funciona.
  4. Abrir el enlace `/verify-email?token=…` → contraseña incorrecta muestra el error; la correcta entra al dashboard.
  5. Abrir de nuevo el mismo enlace → estado "El enlace venció o ya se usó".
  6. Con sesión abierta, `/recuperar-contrasena` redirige al dashboard; cerrar sesión, pedir el enlace, abrir `/reset-password?token=…` **con otra sesión abierta en otra pestaña** → la página no redirige; guardar contraseña nueva → toast de éxito, login, y la otra pestaña también queda sin sesión.
  7. En DevTools → Network, comprobar que `/verify-email` y `/reset-password` responden con `<meta name="referrer" content="no-referrer">`.

- [ ] **Step 3:** Si hubo correcciones, commit con `fix: :bug: …` y la línea `Co-Authored-By`.
