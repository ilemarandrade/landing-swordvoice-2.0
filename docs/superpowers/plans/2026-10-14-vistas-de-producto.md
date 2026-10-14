# Vistas de producto (auth, dashboard, footer, legales) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir en Next.js las 7 vistas del canvas "SwordVoice · Vistas de producto" (Login, Registro, Recuperar contraseña, Dashboard, Footer, Términos, Privacidad) siguiendo `docs/architecture/conventions.md`, con un guard de sesión para vistas protegidas y layouts compartidos por grupo de rutas.

**Architecture:** Tres grupos de rutas con su propio `layout.tsx` para no duplicar marcos: `(marketing)` (landing + legales, con Footer), `(auth)` (fondo, header y barra legal compartidos; solo invitados) y `(app)` (sidebar + header del dashboard; solo con sesión). La sesión es estado global de cliente en Zustand (`common/store/useSessionStore`) y la consume un `SessionGuard` en los layouts. No hay backend de autenticación todavía: los formularios validan con zod y abren una **sesión local temporal** que se reemplaza en la feature 1 del roadmap.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind 3, react-hook-form + zod 4, Zustand 5 (`persist`), next/link, next/navigation.

**Spec:** Canvas https://claude.ai/artifact/58TU5ekJGfP32AiPttxyXq (artboards `Main`, `Registro`, `Recuperar`, `Dashboard`, `Footer`, `Terminos`, `Privacidad`) + `docs/roadmap/features.md` (Fase 0-B/0-C y feature 1).

## Global Constraints

- Toda regla de `docs/architecture/conventions.md` aplica (estructura, dependencias, `InputController`, Tailwind, exports nombrados, textos en español, sin `any`/`@ts-ignore`/`eslint-disable`).
- **Sin tests en este plan** (decisión del usuario). La verificación de cada tarea es `pnpm lint`, `pnpm typecheck` y la revisión manual en `pnpm dev` indicada en la tarea. `pnpm test` debe seguir en verde (tests existentes).
- Alcance de auth: **solo UI + validación**. Ninguna vista llama a un backend nuevo.
- El botón de login social (Google/GitHub) **se crea pero no se monta** en ninguna vista.
- Colores del diseño → tokens Tailwind existentes: `#FF7A00` = `primary`, `#00C2FF` = `secondary`, `#104454` = `blue`. Grises del diseño como valores arbitrarios (`text-[#C9C9D6]`, `text-[#E6E6EE]`, `text-[#9A9AAE]`), panel `bg-[#000E2799]`.
- Tipografías: Sedgwick con `font-sedgwick` (ya cargada en `src/app/layout.tsx`), cuerpo con Inter (ya en `body`).
- Imágenes de fondo: los blobs del canvas no se pueden descargar; se usan los fondos de `public/backgrounds` ya registrados en Tailwind: auth → `bg-home`, legales → `bg-ourServices`, banner del dashboard → `bg-ourPathsBackground`.
- Rutas nuevas (en español): `/iniciar-sesion`, `/registro`, `/recuperar-contrasena`, `/dashboard`, `/terminos`, `/privacidad`.
- Áreas táctiles ≥ 44px (`min-h-11`); todo control es un `<button>`, `<a>`/`<Link>` o `<input>` real con su `<label>`.

## Review Focus

Sin tests automatizados, estos casos se verifican a mano en la tarea que los posee:

1. **Recargar `/dashboard` con sesión abierta** no debe parpadear ni redirigir al login (hidratación del store persistido) → Task 3 y Task 9.
2. **Usuario con sesión que abre `/iniciar-sesion` o `/registro`** debe ir a `/dashboard`; tras "Cerrar sesión" debe volver a `/iniciar-sesion` → Task 3 y Task 9.
3. **Registro con contraseñas distintas o sin aceptar términos** muestra el error en el campo correcto y no abre sesión → Task 7.
4. **Teclado**: las opciones de path se recorren con Tab/flechas y tienen foco visible; el botón de mostrar contraseña no envía el formulario → Task 2 y Task 6.
5. **Ancho de teléfono (390px)**: auth en una columna, nav del dashboard con scroll horizontal, índice legal encima del texto, footer apilado → Tasks 4–9.

---

## Mapa de archivos

```
src/app/
  layout.tsx                                 M  title template
  page.tsx                                   →  movido a (marketing)/page.tsx
  sitemap.ts, robots.ts                      M
  (marketing)/layout.tsx                     C  children + <Footer/>
  (marketing)/page.tsx                       C  (movido)
  (marketing)/(legal)/layout.tsx             C  <LegalLayout>
  (marketing)/(legal)/terminos/page.tsx      C
  (marketing)/(legal)/privacidad/page.tsx    C
  (auth)/layout.tsx                          C  <SessionGuard guest><AuthLayout>
  (auth)/iniciar-sesion/page.tsx             C
  (auth)/registro/page.tsx                   C
  (auth)/recuperar-contrasena/page.tsx       C
  (app)/layout.tsx                           C  <SessionGuard private><DashboardLayout>
  (app)/dashboard/page.tsx                   C
src/common/
  constants/routes.ts, site.ts               M
  constants/learningPaths.ts                 C
  constants/footerLinks.ts                   C
  components/button/index.tsx                M  hover, fullWidth, className
  components/button-link/index.tsx           C
  components/input/index.tsx                 M  ReactNode label, description, ver contraseña
  components/textarea/index.tsx              M  ReactNode label
  components/checkbox/index.tsx              C
  components/option-group/index.tsx          C
  components/input-controller/index.tsx      M  checkbox, options, description
  components/footer/index.tsx                C
  components/footer/footer-column/index.tsx  C
  components/session-guard/index.tsx         C
  hooks/useSessionGuard.ts                   C
  store/useSessionStore.ts                   C
src/features/home/components/hero-section/index.tsx      M  Registrarme → /registro
src/features/home/components/services-section/index.tsx  M  Registrarme → /registro
src/features/legal/      C  (feature nueva)
src/features/auth/       C  (feature nueva)
src/features/dashboard/  C  (feature nueva)
docs/architecture/conventions.md             M  §4.3 nuevos campos de InputController
```

---

### Task 1: Rama, constantes compartidas y botones

**Files:**
- Modify: `src/common/constants/routes.ts`
- Modify: `src/common/constants/site.ts`
- Create: `src/common/constants/learningPaths.ts`
- Modify: `src/common/components/button/index.tsx`
- Create: `src/common/components/button-link/index.tsx`
- Modify: `src/features/home/components/hero-section/index.tsx`
- Modify: `src/features/home/components/services-section/index.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `routes.LOGIN | REGISTER | RECOVER_PASSWORD | DASHBOARD | TERMS | PRIVACY`; `SITE_NAME`, `CONTACT_EMAIL`; `LEARNING_PATH_IDS`, `type LearningPathId`, `learningPaths: Record<LearningPathId, { name: string; role: string }>`; `buttonClassName(fullWidth?: boolean): string`; `<Button label fullWidth? className? …buttonProps>`; `<ButtonLink href label fullWidth? className?>`.

- [ ] **Step 1: Crear la rama**

```bash
git switch -c feat/product-views
```

- [ ] **Step 2: Rutas** — reemplazar `src/common/constants/routes.ts`:

```ts
export const routes = {
  HOME: "/",
  SERVICES: "/#services",
  MEET_US: "/#meet-us",
  OUR_PATHS: "/#our_paths",
  CONTACT_US: "/#contact_us",
  LOGIN: "/iniciar-sesion",
  REGISTER: "/registro",
  RECOVER_PASSWORD: "/recuperar-contrasena",
  DASHBOARD: "/dashboard",
  TERMS: "/terminos",
  PRIVACY: "/privacidad",
};
```

- [ ] **Step 3: Datos del sitio** — reemplazar `src/common/constants/site.ts`:

```ts
export const SITE_URL = "https://swordvoice.com";
export const SITE_NAME = "Swordvoice Academy";
// Pendiente: correo público definitivo (roadmap 0.4).
export const CONTACT_EMAIL = "[correo@swordvoice.com]";
```

- [ ] **Step 4: Paths de aprendizaje** — crear `src/common/constants/learningPaths.ts` (lo usan auth y dashboard; la sección de la landing mantiene sus textos de marketing en `features/home/constants/paths.ts`):

```ts
export const LEARNING_PATH_IDS = ["iniciated", "wanderer"] as const;

export type LearningPathId = (typeof LEARNING_PATH_IDS)[number];

type LearningPath = { name: string; role: string };

export const learningPaths: Record<LearningPathId, LearningPath> = {
  iniciated: { name: "Iniciated", role: "Jr Frontend Developer" },
  wanderer: { name: "Wanderer", role: "Jr Backend Developer" },
};
```

- [ ] **Step 5: Button** — reemplazar `src/common/components/button/index.tsx` (se quita `mt-4` del estilo base; quien lo necesite lo pasa por `className`):

```tsx
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "className"> & {
  label: string;
  fullWidth?: boolean;
  className?: string;
};

export function buttonClassName(fullWidth = false) {
  return `${
    fullWidth ? "w-full" : "w-max"
  } inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white bg-black px-8 py-2 text-base font-bold text-primary no-underline transition-colors hover:bg-primary hover:text-black disabled:cursor-not-allowed disabled:opacity-60`;
}

export function Button({
  label,
  fullWidth,
  className,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      className={`${buttonClassName(fullWidth)} ${className ?? ""}`}
      {...buttonProps}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 6: ButtonLink** — crear `src/common/components/button-link/index.tsx`:

```tsx
import Link from "next/link";
import { buttonClassName } from "@/common/components/button";

type ButtonLinkProps = {
  href: string;
  label: string;
  fullWidth?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  label,
  fullWidth,
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${buttonClassName(fullWidth)} ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}
```

- [ ] **Step 7: Los "Registrarme" de la landing llevan a `/registro`** — en `src/features/home/components/hero-section/index.tsx` y `src/features/home/components/services-section/index.tsx`, reemplazar el import de `Button` por:

```tsx
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";
```

y `<Button label="Registrarme" />` por:

```tsx
<ButtonLink href={routes.REGISTER} label="Registrarme" className="mt-4" />
```

(Si `routes` ya está importado en el archivo, no duplicar el import.)

- [ ] **Step 8: Plantilla de título** — en `src/app/layout.tsx` cambiar `title: "Swordvoice Academy",` por:

```ts
  title: { default: "Swordvoice Academy", template: "%s · Swordvoice Academy" },
```

- [ ] **Step 9: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. En `pnpm dev`, `/` se ve igual y los dos "Registrarme" navegan a `/registro` (404 por ahora es esperado).

- [ ] **Step 10: Commit**

```bash
git add src/common/constants src/common/components/button src/common/components/button-link src/features/home src/app/layout.tsx
git commit -m "feat: :sparkles: add product routes, learning paths and ButtonLink

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Campos de formulario (Input, Checkbox, OptionGroup, InputController)

**Files:**
- Modify: `src/common/components/input/index.tsx`
- Modify: `src/common/components/textarea/index.tsx`
- Create: `src/common/components/checkbox/index.tsx`
- Create: `src/common/components/option-group/index.tsx`
- Modify: `src/common/components/input-controller/index.tsx`
- Modify: `docs/architecture/conventions.md` (§4.3)

**Interfaces:**
- Produces: `<InputController control name label: ReactNode type? autoComplete? placeholder? multiline? description?: string options?: OptionGroupOption[]>`. `type="password"` muestra botón ver/ocultar; `type="checkbox"` mapea a boolean; `options` renderiza un grupo de radios (valor string).
- Produces: `type OptionGroupOption = { value: string; label: string; description?: string }`.

- [ ] **Step 1: Input** — reemplazar `src/common/components/input/index.tsx`:

```tsx
"use client";
import {
  useId,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { Typography } from "@/common/components/typography";

type InputProps = Omit<ComponentPropsWithRef<"input">, "className"> & {
  label: ReactNode;
  error?: string;
  description?: string;
};

export function Input({
  label,
  error,
  description,
  id,
  type,
  ...inputProps
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy =
    [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" htmlFor={inputId} className="mb-3">
        {label}
      </Typography>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && isPasswordVisible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full p-3 rounded text-black focus:outline-none focus:ring-[3px] focus:ring-primary ${
            isPassword ? "pr-14" : ""
          } ${error ? "border-red-600 border-2" : ""}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={
              isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#5A5A5A]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
      {description && (
        <Typography
          as="span"
          variant="small"
          id={descriptionId}
          className="mt-1 text-[#C9C9D6]"
        >
          {description}
        </Typography>
      )}
      {error && (
        <Typography
          as="span"
          variant="small"
          id={errorId}
          className="mt-1 text-red-400"
        >
          {error}
        </Typography>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Textarea acepta label ReactNode** — en `src/common/components/textarea/index.tsx` cambiar el import a `import { useId, type ComponentPropsWithRef, type ReactNode } from "react";` y `label: string;` por `label: ReactNode;`.

- [ ] **Step 3: Checkbox** — crear `src/common/components/checkbox/index.tsx`:

```tsx
import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Typography } from "@/common/components/typography";

type CheckboxProps = Omit<
  ComponentPropsWithRef<"input">,
  "className" | "type"
> & {
  label: ReactNode;
  error?: string;
};

export function Checkbox({ label, error, id, ...inputProps }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="mb-4 flex w-full max-w-md flex-col">
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-start gap-3 pt-2 text-sm leading-relaxed text-[#E6E6EE] md:text-[15px]"
      >
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-[18px] w-[18px] flex-none accent-primary"
          {...inputProps}
        />
        <span>{label}</span>
      </label>
      {error && (
        <Typography
          as="span"
          variant="small"
          id={errorId}
          className="mt-1 text-red-400"
        >
          {error}
        </Typography>
      )}
    </div>
  );
}
```

- [ ] **Step 4: OptionGroup** — crear `src/common/components/option-group/index.tsx` (radios reales, estilizados como tarjetas):

```tsx
import { useId, type ReactNode } from "react";
import { Typography } from "@/common/components/typography";

export type OptionGroupOption = {
  value: string;
  label: string;
  description?: string;
};

type OptionGroupProps = {
  legend: ReactNode;
  name: string;
  value: string;
  options: OptionGroupOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  hint?: string;
  error?: string;
};

export function OptionGroup({
  legend,
  name,
  value,
  options,
  onChange,
  onBlur,
  hint,
  error,
}: OptionGroupProps) {
  const baseId = useId();
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      aria-describedby={describedBy}
      className="mb-4 flex w-full max-w-md flex-col gap-2.5"
    >
      <legend className="mb-2.5 text-sm md:text-base">{legend}</legend>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isChecked = option.value === value;
          return (
            <label
              key={option.value}
              className={`flex min-h-11 cursor-pointer flex-col gap-1.5 rounded-xl border-2 p-3.5 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-primary ${
                isChecked
                  ? "border-primary bg-primary/[0.12]"
                  : "border-white/25 bg-black/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
                className="sr-only"
              />
              <span className="font-bold">{option.label}</span>
              {option.description && (
                <span className="text-[13px] leading-snug text-[#C9C9D6]">
                  {option.description}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {hint && (
        <p id={hintId} className="text-[13px] text-[#9A9AAE]">
          {hint}
        </p>
      )}
      {error && (
        <Typography
          as="span"
          variant="small"
          id={errorId}
          className="text-red-400"
        >
          {error}
        </Typography>
      )}
    </fieldset>
  );
}
```

- [ ] **Step 5: InputController** — reemplazar `src/common/components/input-controller/index.tsx`:

```tsx
"use client";
import type { HTMLInputTypeAttribute, ReactNode } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Checkbox } from "@/common/components/checkbox";
import { Input } from "@/common/components/input";
import {
  OptionGroup,
  type OptionGroupOption,
} from "@/common/components/option-group";
import { Textarea } from "@/common/components/textarea";

type InputControllerProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: ReactNode;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
  description?: string;
  options?: OptionGroupOption[];
};

export function InputController<TValues extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  multiline = false,
  description,
  options,
}: InputControllerProps<TValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const errorMessage = error?.message;

  if (options) {
    return (
      <OptionGroup
        legend={label}
        name={field.name}
        value={field.value ?? ""}
        options={options}
        onChange={field.onChange}
        onBlur={field.onBlur}
        hint={description}
        error={errorMessage}
      />
    );
  }

  if (type === "checkbox") {
    return (
      <Checkbox
        ref={field.ref}
        name={field.name}
        checked={field.value === true}
        onChange={(event) => field.onChange(event.target.checked)}
        onBlur={field.onBlur}
        label={label}
        error={errorMessage}
      />
    );
  }

  const shared = {
    ...field,
    value: field.value ?? "",
    label,
    placeholder,
    error: errorMessage,
  };

  if (multiline) {
    return <Textarea {...shared} />;
  }
  return (
    <Input
      {...shared}
      type={type}
      autoComplete={autoComplete}
      description={description}
    />
  );
}
```

- [ ] **Step 6: Documentar en conventions.md** — en §4.3, reemplazar la línea que empieza por "- Todo campo se renderiza con `InputController`" por:

```md
- Todo campo se renderiza con `InputController` (`src/common/components/input-controller/index.tsx`): usa `useController` de react-hook-form por dentro y recibe solo lo que define el input — `control`, `name`, `label` y opcionales `type`, `autoComplete`, `placeholder`, `description` (texto de ayuda bajo el campo), `multiline` (textarea) y `options` (grupo de radios). `type="password"` añade el botón ver/ocultar; `type="checkbox"` guarda un boolean. El error del schema lo muestra solo.
```

- [ ] **Step 7: Verificar**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: todo en verde (el formulario de contacto sigue funcionando igual en `/`).

- [ ] **Step 8: Commit**

```bash
git add src/common/components docs/architecture/conventions.md
git commit -m "feat: :sparkles: extend InputController with checkbox, options and password toggle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Sesión y guard de vistas protegidas

**Files:**
- Create: `src/common/store/useSessionStore.ts`
- Create: `src/common/hooks/useSessionGuard.ts`
- Create: `src/common/components/session-guard/index.tsx`

**Interfaces:**
- Consumes: `LearningPathId` (Task 1), `routes.LOGIN`, `routes.DASHBOARD`.
- Produces: `type SessionUser = { name: string; email: string; path: LearningPathId | null }`; `useSessionStore` con `user`, `signIn(user)`, `signOut()`; `type SessionAccess = "private" | "guest"`; `<SessionGuard access children>`.

Decisión: es un store de Zustand + un guard, no un React Context — conventions §4.5 manda la sesión a `common/store`. El guard es el "provider" de las vistas protegidas: se monta una sola vez en el `layout.tsx` de cada grupo.

- [ ] **Step 1: Store** — crear `src/common/store/useSessionStore.ts`:

```ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LearningPathId } from "@/common/constants/learningPaths";

export type SessionUser = {
  name: string;
  email: string;
  path: LearningPathId | null;
};

type SessionState = {
  user: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
};

// Sesión local temporal mientras no exista backend de auth (roadmap feature 1).
// Solo decide qué vistas se muestran; no es una barrera de seguridad.
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "sv-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
```

- [ ] **Step 2: Hook del guard** — crear `src/common/hooks/useSessionGuard.ts`:

```ts
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { routes } from "@/common/constants/routes";
import { useSessionStore } from "@/common/store/useSessionStore";

export type SessionAccess = "private" | "guest";

const subscribeToHydration = (onChange: () => void) =>
  useSessionStore.persist.onFinishHydration(onChange);
const getIsHydrated = () => useSessionStore.persist.hasHydrated();
// En el servidor no hay localStorage: se asume "aún no hidratado".
const getServerIsHydrated = () => false;

export function useSessionGuard(access: SessionAccess) {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getIsHydrated,
    getServerIsHydrated,
  );
  const isAuthenticated = useSessionStore((state) => state.user !== null);
  const mustRedirect =
    isHydrated &&
    (access === "private" ? !isAuthenticated : isAuthenticated);

  useEffect(() => {
    if (mustRedirect) {
      router.replace(access === "private" ? routes.LOGIN : routes.DASHBOARD);
    }
  }, [mustRedirect, access, router]);

  // Las vistas de invitado se renderizan desde el servidor (SEO); las privadas
  // esperan a conocer la sesión para no mostrar contenido protegido.
  const canRender =
    access === "guest" ? !mustRedirect : isHydrated && !mustRedirect;

  return { canRender };
}
```

- [ ] **Step 3: Componente** — crear `src/common/components/session-guard/index.tsx`:

```tsx
"use client";
import type { ReactNode } from "react";
import {
  useSessionGuard,
  type SessionAccess,
} from "@/common/hooks/useSessionGuard";

type SessionGuardProps = {
  access: SessionAccess;
  children: ReactNode;
};

export function SessionGuard({ access, children }: SessionGuardProps) {
  const { canRender } = useSessionGuard(access);
  return canRender ? <>{children}</> : null;
}
```

- [ ] **Step 4: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. (El comportamiento se revisa en Task 9, cuando existan las rutas.)

- [ ] **Step 5: Commit**

```bash
git add src/common/store src/common/hooks/useSessionGuard.ts src/common/components/session-guard
git commit -m "feat: :lock: add local session store and SessionGuard for protected views

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Footer global y grupo `(marketing)`

**Files:**
- Create: `src/common/constants/footerLinks.ts`
- Create: `src/common/components/footer/index.tsx`
- Create: `src/common/components/footer/footer-column/index.tsx`
- Move: `src/app/page.tsx` → `src/app/(marketing)/page.tsx`
- Create: `src/app/(marketing)/layout.tsx`

**Interfaces:**
- Consumes: `navLinks`, `NavItem` (`@/common/constants/navLinks`), `routes`, `SITE_NAME`, `CONTACT_EMAIL`, `ButtonLink`.
- Produces: `<Footer />`; `accountLinks`, `legalLinks: NavItem[]`.

Los íconos de redes del diseño se omiten hasta tener las URLs oficiales (no hay ninguna en el repo).

- [ ] **Step 1: Links del footer** — crear `src/common/constants/footerLinks.ts`:

```ts
import type { NavItem } from "@/common/constants/navLinks";
import { routes } from "@/common/constants/routes";
import { CONTACT_EMAIL } from "@/common/constants/site";

export const accountLinks: NavItem[] = [
  { href: routes.LOGIN, label: "Iniciar sesión" },
  { href: routes.REGISTER, label: "Registrarme" },
  { href: routes.RECOVER_PASSWORD, label: "Recuperar contraseña" },
];

export const legalLinks: NavItem[] = [
  { href: routes.TERMS, label: "Términos y condiciones" },
  { href: routes.PRIVACY, label: "Política de privacidad" },
  { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
];
```

- [ ] **Step 2: Columna** — crear `src/common/components/footer/footer-column/index.tsx`:

```tsx
import Link from "next/link";
import type { NavItem } from "@/common/constants/navLinks";

type FooterColumnProps = {
  title: string;
  links: NavItem[];
};

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <nav aria-label={title} className="flex flex-[0_1_180px] flex-col gap-3">
      <h2 className="mb-1 font-sedgwick text-[22px] text-secondary">
        {title}
      </h2>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-[15px] text-[#E6E6EE] no-underline hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Footer** — crear `src/common/components/footer/index.tsx`:

```tsx
import Link from "next/link";
import { ButtonLink } from "@/common/components/button-link";
import { FooterColumn } from "@/common/components/footer/footer-column";
import { accountLinks, legalLinks } from "@/common/constants/footerLinks";
import { navLinks } from "@/common/constants/navLinks";
import { routes } from "@/common/constants/routes";
import { SITE_NAME } from "@/common/constants/site";

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-primary bg-black text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-10 px-4 pb-8 pt-10 md:px-12 md:pt-16">
        <div className="flex max-w-[360px] flex-[1_1_280px] flex-col gap-3.5">
          <Link
            href={routes.HOME}
            className="font-sedgwick text-4xl text-white no-underline"
          >
            Swordvoice
          </Link>
          <p className="text-[15px] leading-relaxed text-[#C9C9D6]">
            <strong className="text-white">Academia online</strong> no
            tradicional. Mentorías para developers y diseñadores que quieren su
            primer trabajo en tech.
          </p>
        </div>
        <FooterColumn title="Explorar" links={navLinks} />
        <FooterColumn title="Cuenta" links={accountLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-[13px] text-[#9A9AAE] md:px-12">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos
            reservados.
          </span>
          <ButtonLink href={routes.REGISTER} label="Registrarme" />
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Mover la home al grupo**

```bash
mkdir -p "src/app/(marketing)"
git mv src/app/page.tsx "src/app/(marketing)/page.tsx"
```

- [ ] **Step 5: Layout del grupo** — crear `src/app/(marketing)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { Footer } from "@/common/components/footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. En `pnpm dev`: `/` muestra el footer al final; "Explorar" lleva a las secciones; a 390px las columnas se apilan.

- [ ] **Step 7: Commit**

```bash
git add src/common/constants/footerLinks.ts src/common/components/footer "src/app/(marketing)"
git commit -m "feat: :sparkles: add global footer through the marketing route group

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Feature `legal` — Términos y Privacidad

**Files:**
- Create: `src/features/legal/index.ts`
- Create: `src/features/legal/TermsPage.tsx`, `src/features/legal/PrivacyPage.tsx`
- Create: `src/features/legal/constants/legalDocument.ts`, `company.ts`, `headerLinks.ts`, `terms.ts`, `privacy.ts`
- Create: `src/features/legal/components/legal-layout/index.tsx`, `legal-layout/legal-header/index.tsx`
- Create: `src/features/legal/components/legal-document/index.tsx`, `legal-document/legal-hero/index.tsx`, `legal-document/legal-toc/index.tsx`, `legal-document/legal-section/index.tsx`
- Create: `src/app/(marketing)/(legal)/layout.tsx`, `terminos/page.tsx`, `privacidad/page.tsx`

**Interfaces:**
- Produces: `export { LegalLayout, TermsPage, PrivacyPage }` desde `@/features/legal`.

- [ ] **Step 1: Tipos** — `src/features/legal/constants/legalDocument.ts`:

```ts
export type LegalLink = { label: string; href: string };

export type LegalItem = { label: string; text: string };

export type LegalSectionContent = {
  id: string;
  title: string;
  paragraphs: string[];
  items?: LegalItem[];
  links?: LegalLink[];
};

export type LegalDocumentContent = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSectionContent[];
};
```

- [ ] **Step 2: Datos de la empresa** — `src/features/legal/constants/company.ts`:

```ts
// Pendiente de los datos legales reales (roadmap 0.4). Se rellenan solo aquí.
export const company = {
  legalName: "[RAZÓN SOCIAL]",
  taxId: "[IDENTIFICACIÓN FISCAL]",
  address: "[DIRECCIÓN]",
  location: "[PAÍS / CIUDAD]",
  country: "[PAÍS]",
  minimumAge: "[EDAD MÍNIMA]",
  retentionPeriod: "[PLAZO]",
  updatedAt: "[DD/MM/AAAA]",
};
```

- [ ] **Step 3: Links del header** — `src/features/legal/constants/headerLinks.ts`:

```ts
import { routes } from "@/common/constants/routes";

export const legalHeaderLinks = [
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.LOGIN, label: "Iniciar sesión" },
];
```

- [ ] **Step 4: Términos** — `src/features/legal/constants/terms.ts`:

```ts
import { routes } from "@/common/constants/routes";
import { CONTACT_EMAIL, SITE_NAME } from "@/common/constants/site";
import { company } from "@/features/legal/constants/company";
import type { LegalDocumentContent } from "@/features/legal/constants/legalDocument";

export const terms: LegalDocumentContent = {
  title: "Términos y condiciones",
  updatedAt: company.updatedAt,
  intro: `Estos términos regulan el uso de swordvoice.com y de los servicios de mentoría de ${SITE_NAME}, operada por ${company.legalName}, con domicilio en ${company.location}.`,
  sections: [
    {
      id: "aceptacion",
      title: "Aceptación",
      paragraphs: [
        "Al crear una cuenta o usar la plataforma aceptas estos términos y nuestra Política de privacidad. Si no estás de acuerdo, no uses el servicio.",
      ],
      links: [{ label: "Política de privacidad", href: routes.PRIVACY }],
    },
    {
      id: "servicio",
      title: "El servicio",
      paragraphs: [
        `${SITE_NAME} ofrece un modelo de mentorías: asignación de un mentor, plan de aprendizaje por path, entrenamiento para entrevistas, orientación de portafolio y LinkedIn, y acceso a la comunidad. No es un programa de cursos tradicionales ni un título oficial.`,
      ],
    },
    {
      id: "cuenta",
      title: "Cuenta de usuario",
      paragraphs: [
        `Debes tener al menos ${company.minimumAge} años, dar datos veraces y mantener segura tu contraseña. Eres responsable de la actividad realizada desde tu cuenta.`,
      ],
    },
    {
      id: "mentorias",
      title: "Mentorías y paths",
      paragraphs: [
        "El mentor guía y propone recursos; el avance depende de tu dedicación. Te ayudamos a buscar tu primer empleo en el path elegido, pero no garantizamos una contratación.",
      ],
    },
    {
      id: "pagos",
      title: "Pagos y cancelación",
      paragraphs: [
        "[Describir precios, ciclo de facturación, medios de pago, política de reembolso y cómo cancelar.]",
      ],
    },
    {
      id: "conducta",
      title: "Conducta en la comunidad",
      paragraphs: [
        "Trata a mentores y miembros con respeto. No se permite acoso, spam, plagio ni compartir contenido ilegal. Podemos suspender cuentas que incumplan estas normas.",
      ],
    },
    {
      id: "propiedad-intelectual",
      title: "Propiedad intelectual",
      paragraphs: [
        "La marca, el diseño y los materiales de Swordvoice nos pertenecen. Los proyectos y el código que crees durante tu path son tuyos.",
      ],
    },
    {
      id: "responsabilidad",
      title: "Responsabilidad",
      paragraphs: [
        `[Limitación de responsabilidad y ley aplicable según la jurisdicción de ${company.country}.]`,
      ],
    },
    {
      id: "cambios-contacto",
      title: "Cambios y contacto",
      paragraphs: [
        `Podemos actualizar estos términos y te avisaremos por correo o en la plataforma. Para dudas escribe a ${CONTACT_EMAIL}.`,
      ],
      links: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
    },
  ],
};
```

- [ ] **Step 5: Privacidad** — `src/features/legal/constants/privacy.ts`:

```ts
import { routes } from "@/common/constants/routes";
import { CONTACT_EMAIL, SITE_NAME } from "@/common/constants/site";
import { company } from "@/features/legal/constants/company";
import type { LegalDocumentContent } from "@/features/legal/constants/legalDocument";

export const privacy: LegalDocumentContent = {
  title: "Política de privacidad",
  updatedAt: company.updatedAt,
  intro: `En ${SITE_NAME} solo usamos tus datos para darte la mentoría que elegiste. Aquí te explicamos qué recogemos, por qué y cómo controlarlo.`,
  sections: [
    {
      id: "responsable",
      title: "Responsable",
      paragraphs: [
        `${company.legalName}, ${company.taxId}, con domicilio en ${company.address}, es responsable del tratamiento de tus datos.`,
      ],
    },
    {
      id: "datos",
      title: "Datos que recogemos",
      paragraphs: [],
      items: [
        { label: "Cuenta", text: "nombre, correo electrónico y contraseña cifrada." },
        { label: "Aprendizaje", text: "path elegido, progreso, tareas y notas de sesiones." },
        { label: "Perfil profesional", text: "enlaces a LinkedIn, GitHub o portafolio que decidas compartir." },
        { label: "Uso", text: "datos técnicos del navegador y del dispositivo." },
      ],
    },
    {
      id: "finalidad",
      title: "Para qué los usamos",
      paragraphs: [
        "Para crear y mantener tu cuenta, asignarte un mentor, seguir tu progreso, prepararte para entrevistas, enviarte avisos del servicio y mejorar la plataforma.",
      ],
    },
    {
      id: "destinatarios",
      title: "Con quién los compartimos",
      paragraphs: [
        "Con tu mentor asignado y con proveedores necesarios para operar el servicio ([HOSTING], [CORREO], [PAGOS]). Solo compartimos tu perfil con reclutadores si lo autorizas expresamente. Nunca vendemos tus datos.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: ["[Detallar cookies técnicas, de analítica y cómo gestionarlas.]"],
    },
    {
      id: "conservacion",
      title: "Conservación y seguridad",
      paragraphs: [
        `Conservamos tus datos mientras tu cuenta esté activa y durante ${company.retentionPeriod} después. Aplicamos cifrado y controles de acceso para protegerlos.`,
      ],
    },
    {
      id: "derechos",
      title: "Tus derechos",
      paragraphs: [
        `Puedes acceder, rectificar, eliminar o exportar tus datos, y oponerte a ciertos usos, desde Ajustes o escribiéndonos. [Añadir la autoridad de control aplicable en ${company.country}.]`,
      ],
    },
    {
      id: "contacto",
      title: "Contacto",
      paragraphs: [
        `Escríbenos a ${CONTACT_EMAIL}. Consulta también nuestros Términos y condiciones.`,
      ],
      links: [
        { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
        { label: "Términos y condiciones", href: routes.TERMS },
      ],
    },
  ],
};
```

- [ ] **Step 6: Header** — `src/features/legal/components/legal-layout/legal-header/index.tsx`:

```tsx
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { legalHeaderLinks } from "@/features/legal/constants/headerLinks";

export function LegalHeader() {
  return (
    <header className="flex min-h-[85px] flex-wrap items-center justify-between gap-4 bg-black px-4 py-3 md:px-12">
      <Link
        href={routes.HOME}
        className="font-sedgwick text-[32px] text-white no-underline"
      >
        Swordvoice
      </Link>
      <nav aria-label="Principal" className="flex flex-wrap gap-6">
        {legalHeaderLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-sedgwick text-lg text-white no-underline hover:text-primary md:text-xl"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 7: Layout** — `src/features/legal/components/legal-layout/index.tsx`:

```tsx
import type { ReactNode } from "react";
import { LegalHeader } from "@/features/legal/components/legal-layout/legal-header";

type LegalLayoutProps = { children: ReactNode };

export function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LegalHeader />
      {children}
    </div>
  );
}
```

- [ ] **Step 8: Hero** — `src/features/legal/components/legal-document/legal-hero/index.tsx`:

```tsx
type LegalHeroProps = { title: string; updatedAt: string };

export function LegalHero({ title, updatedAt }: LegalHeroProps) {
  return (
    <div className="relative bg-ourServices bg-cover bg-center px-4 py-12 text-center text-white md:px-12 md:py-20">
      <div aria-hidden="true" className="absolute inset-0 bg-black/[0.35]" />
      <div className="relative flex flex-col items-center gap-3">
        <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">
          {title}
        </h1>
        <p className="text-[15px] text-[#E6E6EE]">
          Última actualización: {updatedAt}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Índice** — `src/features/legal/components/legal-document/legal-toc/index.tsx`:

```tsx
import type { LegalSectionContent } from "@/features/legal/constants/legalDocument";

type LegalTocProps = { sections: LegalSectionContent[] };

export function LegalToc({ sections }: LegalTocProps) {
  return (
    <nav
      aria-labelledby="legal-toc-title"
      className="flex w-full flex-col gap-2 md:sticky md:top-8 md:w-64 md:flex-none"
    >
      <h2 id="legal-toc-title" className="text-sm font-bold uppercase tracking-wider">
        Contenido
      </h2>
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="rounded-md px-3 py-2.5 text-[15px] text-black no-underline hover:bg-black/5"
        >
          {index + 1}. {section.title}
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 10: Sección** — `src/features/legal/components/legal-document/legal-section/index.tsx`:

```tsx
import Link from "next/link";
import type { LegalSectionContent } from "@/features/legal/constants/legalDocument";

type LegalSectionProps = { number: number; section: LegalSectionContent };

export function LegalSection({ number, section }: LegalSectionProps) {
  return (
    <section id={section.id} className="flex scroll-mt-8 flex-col gap-3">
      <h2 className="text-2xl font-bold leading-snug">
        {number}. {section.title}
      </h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="leading-relaxed">
          {paragraph}
        </p>
      ))}
      {section.items && (
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {section.items.map((item) => (
            <li key={item.label} className="leading-relaxed">
              <strong>{item.label}:</strong> {item.text}
            </li>
          ))}
        </ul>
      )}
      {section.links && (
        <p className="flex flex-wrap gap-4">
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-blue underline hover:text-[#0A2C37]"
            >
              {link.label}
            </Link>
          ))}
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 11: Documento** — `src/features/legal/components/legal-document/index.tsx`:

```tsx
import { LegalHero } from "@/features/legal/components/legal-document/legal-hero";
import { LegalSection } from "@/features/legal/components/legal-document/legal-section";
import { LegalToc } from "@/features/legal/components/legal-document/legal-toc";
import type { LegalDocumentContent } from "@/features/legal/constants/legalDocument";

type LegalDocumentProps = { content: LegalDocumentContent };

export function LegalDocument({ content }: LegalDocumentProps) {
  return (
    <main className="flex flex-col text-black">
      <LegalHero title={content.title} updatedAt={content.updatedAt} />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-8 md:flex-row md:items-start md:px-12 md:py-[72px]">
        <LegalToc sections={content.sections} />
        <article className="flex max-w-3xl flex-1 flex-col gap-10">
          <p className="text-[19px] leading-relaxed">{content.intro}</p>
          {content.sections.map((section, index) => (
            <LegalSection key={section.id} number={index + 1} section={section} />
          ))}
        </article>
      </div>
    </main>
  );
}
```

- [ ] **Step 12: Páginas y API pública**

`src/features/legal/TermsPage.tsx`:

```tsx
import { LegalDocument } from "@/features/legal/components/legal-document";
import { terms } from "@/features/legal/constants/terms";

export function TermsPage() {
  return <LegalDocument content={terms} />;
}
```

`src/features/legal/PrivacyPage.tsx`:

```tsx
import { LegalDocument } from "@/features/legal/components/legal-document";
import { privacy } from "@/features/legal/constants/privacy";

export function PrivacyPage() {
  return <LegalDocument content={privacy} />;
}
```

`src/features/legal/index.ts`:

```ts
export { LegalLayout } from "@/features/legal/components/legal-layout";
export { PrivacyPage } from "@/features/legal/PrivacyPage";
export { TermsPage } from "@/features/legal/TermsPage";
```

- [ ] **Step 13: Rutas**

`src/app/(marketing)/(legal)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { LegalLayout } from "@/features/legal";

export default function LegalRouteLayout({ children }: { children: ReactNode }) {
  return <LegalLayout>{children}</LegalLayout>;
}
```

`src/app/(marketing)/(legal)/terminos/page.tsx`:

```tsx
import type { Metadata } from "next";
import { TermsPage } from "@/features/legal";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Page() {
  return <TermsPage />;
}
```

`src/app/(marketing)/(legal)/privacidad/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PrivacyPage } from "@/features/legal";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Page() {
  return <PrivacyPage />;
}
```

- [ ] **Step 14: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. En `pnpm dev`: `/terminos` y `/privacidad` muestran header negro, hero, índice + secciones y el footer global (lo pone `(marketing)/layout.tsx`); los links del índice saltan a cada sección; a 390px el índice queda encima del texto; la pestaña dice "Términos y condiciones · Swordvoice Academy".

- [ ] **Step 15: Commit**

```bash
git add src/features/legal "src/app/(marketing)/(legal)"
git commit -m "feat: :page_facing_up: add terms and privacy pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Feature `auth` — layout compartido, login y botón social oculto

**Files:**
- Create: `src/features/auth/index.ts`, `src/features/auth/LoginPage.tsx`
- Create: `src/features/auth/schemas/authFields.schema.ts`, `src/features/auth/schemas/login.schema.ts`
- Create: `src/features/auth/hooks/useLoginForm.ts`
- Create: `src/features/auth/components/auth-layout/index.tsx`, `auth-layout/auth-header/index.tsx`, `auth-layout/auth-header/auth-header-link/index.tsx`, `auth-layout/auth-bottom-bar/index.tsx`
- Create: `src/features/auth/components/auth-intro/index.tsx`, `auth-card/index.tsx`, `login-form/index.tsx`, `social-login-button/index.tsx`
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/iniciar-sesion/page.tsx`

**Interfaces:**
- Consumes: `SessionGuard` (Task 3), `useSessionStore().signIn` (Task 3), `InputController` (Task 2), `Button` (Task 1), `routes`, `SITE_NAME`.
- Produces: `emailField` (zod); `AuthIntro({ title: ReactNode; description: ReactNode; children?: ReactNode })`; `AuthCard({ title: string; subtitle?: ReactNode; children: ReactNode })`; `SocialLoginButton({ provider: "google" | "github"; onClick: () => void; disabled?: boolean })`; `export { AuthLayout, LoginPage }`.

- [ ] **Step 1: Campo de correo compartido** — `src/features/auth/schemas/authFields.schema.ts`:

```ts
import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .max(254, "El correo no puede superar 254 caracteres")
  .pipe(z.email("Ingresa un correo electrónico válido"));
```

- [ ] **Step 2: Schema de login** — `src/features/auth/schemas/login.schema.ts` (las contraseñas no llevan `.trim()`: los espacios forman parte de ellas):

```ts
import { z } from "zod";
import { emailField } from "@/features/auth/schemas/authFields.schema";

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .max(72, "La contraseña no puede superar 72 caracteres"),
  remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

- [ ] **Step 3: Hook** — `src/features/auth/hooks/useLoginForm.ts`:

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSessionStore } from "@/common/store/useSessionStore";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
  remember: false,
};

export function useLoginForm() {
  const signIn = useSessionStore((state) => state.signIn);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  // Sin backend todavía (roadmap feature 1): abre la sesión local y el
  // SessionGuard del grupo (auth) redirige al dashboard. `remember` se
  // enviará al backend cuando exista.
  const onSubmit = handleSubmit(({ email }) => {
    signIn({ name: email.split("@")[0], email, path: null });
  });

  return { control, onSubmit, isSubmitting };
}
```

- [ ] **Step 4: Link dinámico del header** — `src/features/auth/components/auth-layout/auth-header/auth-header-link/index.tsx`:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/common/constants/routes";

export function AuthHeaderLink() {
  const pathname = usePathname();
  const link =
    pathname === routes.LOGIN
      ? { href: routes.HOME, label: "Volver al inicio" }
      : { href: routes.LOGIN, label: "Iniciar sesión" };

  return (
    <Link
      href={link.href}
      className="font-sedgwick text-lg text-white no-underline hover:text-primary md:text-xl"
    >
      {link.label}
    </Link>
  );
}
```

- [ ] **Step 5: Header** — `src/features/auth/components/auth-layout/auth-header/index.tsx`:

```tsx
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { AuthHeaderLink } from "@/features/auth/components/auth-layout/auth-header/auth-header-link";

export function AuthHeader() {
  return (
    <header className="relative z-10 flex h-[85px] items-center justify-between gap-4 bg-blurry px-4 md:px-12">
      <Link
        href={routes.HOME}
        className="font-sedgwick text-[32px] text-white no-underline"
      >
        Swordvoice
      </Link>
      <AuthHeaderLink />
    </header>
  );
}
```

- [ ] **Step 6: Barra inferior** — `src/features/auth/components/auth-layout/auth-bottom-bar/index.tsx`:

```tsx
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { SITE_NAME } from "@/common/constants/site";

export function AuthBottomBar() {
  return (
    <div className="relative z-10 flex flex-wrap justify-between gap-3 bg-black px-4 py-4 text-[13px] text-[#9A9AAE] md:px-12">
      <span>
        © {new Date().getFullYear()} {SITE_NAME}
      </span>
      <span className="flex gap-5">
        <Link href={routes.TERMS} className="text-[#C9C9D6] hover:text-primary">
          Términos
        </Link>
        <Link href={routes.PRIVACY} className="text-[#C9C9D6] hover:text-primary">
          Privacidad
        </Link>
      </span>
    </div>
  );
}
```

- [ ] **Step 7: Layout** — `src/features/auth/components/auth-layout/index.tsx` (el `<main>` es el contenedor de dos columnas; una página de una sola columna se centra con `mx-auto`):

```tsx
import type { ReactNode } from "react";
import { AuthBottomBar } from "@/features/auth/components/auth-layout/auth-bottom-bar";
import { AuthHeader } from "@/features/auth/components/auth-layout/auth-header";

type AuthLayoutProps = { children: ReactNode };

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-home bg-cover bg-bottom text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-black/[0.55]" />
      <AuthHeader />
      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-wrap items-center justify-between gap-12 px-4 py-8 md:px-12 md:py-20">
        {children}
      </main>
      <AuthBottomBar />
    </div>
  );
}
```

- [ ] **Step 8: Intro** — `src/features/auth/components/auth-intro/index.tsx`:

```tsx
import type { ReactNode } from "react";

type AuthIntroProps = {
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
};

export function AuthIntro({ title, description, children }: AuthIntroProps) {
  return (
    <section className="flex max-w-[520px] flex-[1_1_380px] flex-col gap-5">
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[64px]">
        {title}
      </h1>
      <p className="text-lg leading-relaxed text-[#E6E6EE]">{description}</p>
      {children}
    </section>
  );
}
```

- [ ] **Step 9: Tarjeta** — `src/features/auth/components/auth-card/index.tsx`:

```tsx
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="flex w-full max-w-[480px] flex-[1_1_360px] flex-col gap-6 rounded-[18px] border border-white/15 bg-[#000E2799] p-6 md:p-10">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-[15px] text-[#C9C9D6]">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 10: Formulario** — `src/features/auth/components/login-form/index.tsx`:

```tsx
"use client";
import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export function LoginForm() {
  const { control, onSubmit, isSubmitting } = useLoginForm();

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@correo.com"
      />
      <InputController
        control={control}
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
      />
      <Link
        href={routes.RECOVER_PASSWORD}
        className="-mt-2 mb-2 self-end text-sm text-primary hover:text-[#FFA34D]"
      >
        ¿Olvidaste tu contraseña?
      </Link>
      <InputController
        control={control}
        name="remember"
        label="Mantener sesión iniciada"
        type="checkbox"
      />
      <Button type="submit" label="Entrar" fullWidth disabled={isSubmitting} />
    </form>
  );
}
```

- [ ] **Step 11: Botón social (no se monta)** — `src/features/auth/components/social-login-button/index.tsx`:

```tsx
// Listo para la feature 1 (roadmap): se monta en LoginForm cuando exista el
// proveedor de autenticación. Hoy no se renderiza en ninguna vista.
type SocialProvider = "google" | "github";

type SocialLoginButtonProps = {
  provider: SocialProvider;
  onClick: () => void;
  disabled?: boolean;
};

const labels: Record<SocialProvider, string> = {
  google: "Continuar con Google",
  github: "Continuar con GitHub",
};

const iconPaths: Record<SocialProvider, string> = {
  google:
    "M21.8 10.2H12v3.9h5.6c-.5 2.5-2.7 4.1-5.6 4.1a6.2 6.2 0 1 1 4-10.9l2.8-2.8A10 10 0 1 0 22 12c0-.6-.1-1.2-.2-1.8z",
  github:
    "M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
};

export function SocialLoginButton({
  provider,
  onClick,
  disabled,
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-full border-2 border-white/35 bg-transparent font-semibold text-white hover:border-primary disabled:opacity-60"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={iconPaths[provider]} />
      </svg>
      {labels[provider]}
    </button>
  );
}
```

- [ ] **Step 12: Página y API pública**

`src/features/auth/LoginPage.tsx`:

```tsx
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { LoginForm } from "@/features/auth/components/login-form";

export function LoginPage() {
  return (
    <>
      <AuthIntro
        title={
          <>
            Vuelve a tu <span className="text-primary">path</span>,{" "}
            <span className="text-secondary">Swordvoice</span>
          </>
        }
        description="Tu mentor, tu plan y tu progreso te están esperando. Entra y continúa donde lo dejaste."
      />
      <AuthCard
        title="Iniciar sesión"
        subtitle={
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link
              href={routes.REGISTER}
              className="font-bold text-primary hover:text-[#FFA34D]"
            >
              Regístrate
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthCard>
    </>
  );
}
```

`src/features/auth/index.ts`:

```ts
export { AuthLayout } from "@/features/auth/components/auth-layout";
export { LoginPage } from "@/features/auth/LoginPage";
```

- [ ] **Step 13: Rutas**

`src/app/(auth)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";
import { AuthLayout } from "@/features/auth";

export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard access="guest">
      <AuthLayout>{children}</AuthLayout>
    </SessionGuard>
  );
}
```

`src/app/(auth)/iniciar-sesion/page.tsx`:

```tsx
import type { Metadata } from "next";
import { LoginPage } from "@/features/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function Page() {
  return <LoginPage />;
}
```

- [ ] **Step 14: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. En `pnpm dev` → `/iniciar-sesion`: enviar vacío muestra "Ingresa un correo electrónico válido" e "Ingresa tu contraseña"; el ojo alterna la visibilidad **sin enviar** el formulario; Tab llega al checkbox y al botón con foco visible; un envío válido intenta ir a `/dashboard` (404 hasta Task 9 — esperado). Borra `sv-session` en DevTools → Application → Local Storage antes de seguir. El botón social no aparece.

- [ ] **Step 15: Commit**

```bash
git add src/features/auth "src/app/(auth)"
git commit -m "feat: :sparkles: add auth layout and login view

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Registro

**Files:**
- Create: `src/features/auth/schemas/register.schema.ts`
- Create: `src/features/auth/hooks/useRegisterForm.ts`
- Create: `src/features/auth/constants/registerBenefits.ts`, `src/features/auth/constants/pathOptions.ts`
- Create: `src/features/auth/components/register-benefits/index.tsx`, `register-form/index.tsx`
- Create: `src/features/auth/RegisterPage.tsx`
- Modify: `src/features/auth/index.ts`
- Create: `src/app/(auth)/registro/page.tsx`

**Interfaces:**
- Consumes: `emailField`, `AuthIntro`, `AuthCard` (Task 6), `LEARNING_PATH_IDS`, `learningPaths` (Task 1), `OptionGroupOption` (Task 2), `signIn` (Task 3).
- Produces: `RegisterPage`.

- [ ] **Step 1: Schema** — `src/features/auth/schemas/register.schema.ts`:

```ts
import { z } from "zod";
import { LEARNING_PATH_IDS } from "@/common/constants/learningPaths";
import { emailField } from "@/features/auth/schemas/authFields.schema";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ingresa tu nombre y apellido")
      .max(120, "El nombre no puede superar 120 caracteres"),
    email: emailField,
    // Las contraseñas no se recortan: los espacios forman parte de ellas.
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar 72 caracteres")
      .regex(/\d/, "La contraseña debe incluir al menos un número"),
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña")
      .max(72, "La contraseña no puede superar 72 caracteres"),
    path: z.enum(LEARNING_PATH_IDS, "Elige tu path"),
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

- [ ] **Step 2: Constantes**

`src/features/auth/constants/registerBenefits.ts`:

```ts
export const registerBenefits = [
  "Mentor asignado y plan personalizado",
  "Entrenamiento para entrevistas HR y técnicas",
  "Portafolio, LinkedIn y comunidad",
];
```

`src/features/auth/constants/pathOptions.ts`:

```ts
import type { OptionGroupOption } from "@/common/components/option-group";
import {
  LEARNING_PATH_IDS,
  learningPaths,
} from "@/common/constants/learningPaths";

export const pathOptions: OptionGroupOption[] = LEARNING_PATH_IDS.map((id) => ({
  value: id,
  label: learningPaths[id].name,
  description: learningPaths[id].role,
}));
```

- [ ] **Step 3: Hook** — `src/features/auth/hooks/useRegisterForm.ts`:

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSessionStore } from "@/common/store/useSessionStore";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";

const defaultValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  path: "iniciated",
  acceptTerms: false,
};

export function useRegisterForm() {
  const signIn = useSessionStore((state) => state.signIn);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues,
    resolver: zodResolver(registerSchema),
  });

  // Sin backend todavía (roadmap feature 1): abre la sesión local y el
  // SessionGuard del grupo (auth) redirige al dashboard.
  const onSubmit = handleSubmit(({ name, email, path }) => {
    signIn({ name, email, path });
  });

  return { control, onSubmit, isSubmitting };
}
```

- [ ] **Step 4: Beneficios** — `src/features/auth/components/register-benefits/index.tsx`:

```tsx
import { registerBenefits } from "@/features/auth/constants/registerBenefits";

export function RegisterBenefits() {
  return (
    <ul className="mt-2 flex flex-col gap-3">
      {registerBenefits.map((benefit) => (
        <li key={benefit} className="flex items-center gap-3 text-base">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="flex-none text-secondary"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {benefit}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Formulario** — `src/features/auth/components/register-form/index.tsx`:

```tsx
"use client";
import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import { pathOptions } from "@/features/auth/constants/pathOptions";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";

export function RegisterForm() {
  const { control, onSubmit, isSubmitting } = useRegisterForm();

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <InputController
        control={control}
        name="name"
        label="Nombre y Apellido"
        autoComplete="name"
      />
      <InputController
        control={control}
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
      />
      <InputController
        control={control}
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        description="Mínimo 8 caracteres, con al menos un número."
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
        name="path"
        label="Tu path"
        options={pathOptions}
        description="Warrior, Master y Ancient: próximamente."
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

- [ ] **Step 6: Página** — `src/features/auth/RegisterPage.tsx`:

```tsx
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { RegisterBenefits } from "@/features/auth/components/register-benefits";
import { RegisterForm } from "@/features/auth/components/register-form";

export function RegisterPage() {
  return (
    <>
      <AuthIntro
        title={
          <>
            Elige tu <span className="text-primary">path</span> y{" "}
            <span className="text-secondary">empieza</span>
          </>
        }
        description={
          <>
            Crea tu cuenta, elige tu ruta y te asignamos un{" "}
            <strong>MENTOR</strong> con el plan exacto que debes seguir.
          </>
        }
      >
        <RegisterBenefits />
      </AuthIntro>
      <AuthCard
        title="Crear cuenta"
        subtitle={
          <>
            ¿Ya tienes cuenta?{" "}
            <Link
              href={routes.LOGIN}
              className="font-bold text-primary hover:text-[#FFA34D]"
            >
              Inicia sesión
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthCard>
    </>
  );
}
```

- [ ] **Step 7: API pública y ruta** — añadir a `src/features/auth/index.ts`:

```ts
export { RegisterPage } from "@/features/auth/RegisterPage";
```

`src/app/(auth)/registro/page.tsx`:

```tsx
import type { Metadata } from "next";
import { RegisterPage } from "@/features/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function Page() {
  return <RegisterPage />;
}
```

- [ ] **Step 8: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. En `pnpm dev` → `/registro` (con `sv-session` borrado):
- Envío vacío: errores en nombre, correo, contraseña, confirmar contraseña y términos.
- `abcdefgh` → "La contraseña debe incluir al menos un número".
- Con todo válido salvo `confirmPassword` distinta → "Las contraseñas no coinciden" bajo **Confirmar contraseña**, sin sesión abierta.
- Las tarjetas de path: Tab entra al grupo, las flechas cambian la selección, el foco se ve con contorno naranja; "Iniciated" viene preseleccionado.
- El header dice "Iniciar sesión" (en `/iniciar-sesion` dice "Volver al inicio").
- A 390px: intro arriba, tarjeta debajo, sin scroll horizontal.

- [ ] **Step 9: Commit**

```bash
git add src/features/auth "src/app/(auth)/registro"
git commit -m "feat: :sparkles: add register view with path picker

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Recuperar contraseña

**Files:**
- Create: `src/features/auth/schemas/recoverPassword.schema.ts`
- Create: `src/features/auth/hooks/useRecoverPasswordForm.ts`
- Create: `src/features/auth/components/recover-password/index.tsx`, `recover-password/recover-password-form/index.tsx`, `recover-password/recover-email-sent/index.tsx`
- Create: `src/features/auth/RecoverPasswordPage.tsx`
- Modify: `src/features/auth/index.ts`
- Create: `src/app/(auth)/recuperar-contrasena/page.tsx`

**Interfaces:**
- Consumes: `emailField` (Task 6), `Button`, `ButtonLink` (Task 1).
- Produces: `useRecoverPasswordForm(): { control, onSubmit, isSubmitting, isSent: boolean, resend: () => void }`; `RecoverPasswordPage`.

- [ ] **Step 1: Schema** — `src/features/auth/schemas/recoverPassword.schema.ts`:

```ts
import { z } from "zod";
import { emailField } from "@/features/auth/schemas/authFields.schema";

export const recoverPasswordSchema = z.object({ email: emailField });

export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;
```

- [ ] **Step 2: Hook** — `src/features/auth/hooks/useRecoverPasswordForm.ts`:

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  recoverPasswordSchema,
  type RecoverPasswordFormValues,
} from "@/features/auth/schemas/recoverPassword.schema";

export function useRecoverPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  // Sin backend todavía (roadmap feature 1): solo muestra la confirmación.
  const onSubmit = handleSubmit(() => setIsSent(true));

  return {
    control,
    onSubmit,
    isSubmitting,
    isSent,
    resend: () => setIsSent(false),
  };
}
```

- [ ] **Step 3: Vista del formulario** — `src/features/auth/components/recover-password/recover-password-form/index.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import { routes } from "@/common/constants/routes";
import type { useRecoverPasswordForm } from "@/features/auth/hooks/useRecoverPasswordForm";

type RecoverPasswordFormProps = Pick<
  ReturnType<typeof useRecoverPasswordForm>,
  "control" | "onSubmit" | "isSubmitting"
>;

export function RecoverPasswordForm({
  control,
  onSubmit,
  isSubmitting,
}: RecoverPasswordFormProps) {
  return (
    <>
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-secondary text-secondary">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="8" cy="15" r="4" />
          <path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2" />
        </svg>
      </div>
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">
        ¿Perdiste tu <span className="text-primary">llave</span>?
      </h1>
      <p className="text-[17px] leading-relaxed text-[#E6E6EE]">
        Escribe el correo de tu cuenta y te enviaremos un enlace para crear una
        contraseña nueva.
      </p>
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
        <Button type="submit" label="Enviar enlace" fullWidth disabled={isSubmitting} />
      </form>
      <Link href={routes.LOGIN} className="text-[15px] font-semibold text-primary hover:text-[#FFA34D]">
        ← Volver a iniciar sesión
      </Link>
    </>
  );
}
```

- [ ] **Step 4: Vista de confirmación** — `src/features/auth/components/recover-password/recover-email-sent/index.tsx`:

```tsx
import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";

type RecoverEmailSentProps = { onResend: () => void };

export function RecoverEmailSent({ onResend }: RecoverEmailSentProps) {
  return (
    <>
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-primary text-primary">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">
        Revisa tu <span className="text-secondary">correo</span>
      </h1>
      <p role="status" className="text-[17px] leading-relaxed text-[#E6E6EE]">
        Si existe una cuenta con ese correo, recibirás un enlace en unos
        minutos.
      </p>
      <div className="flex flex-col items-center gap-3.5">
        <ButtonLink href={routes.LOGIN} label="Volver a iniciar sesión" />
        <button
          type="button"
          onClick={onResend}
          className="min-h-11 text-sm font-bold tracking-wide text-primary hover:text-[#FFA34D]"
        >
          ¿NO LLEGÓ? REENVIAR
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Contenedor** — `src/features/auth/components/recover-password/index.tsx`:

```tsx
"use client";
import { RecoverEmailSent } from "@/features/auth/components/recover-password/recover-email-sent";
import { RecoverPasswordForm } from "@/features/auth/components/recover-password/recover-password-form";
import { useRecoverPasswordForm } from "@/features/auth/hooks/useRecoverPasswordForm";

export function RecoverPassword() {
  const { control, onSubmit, isSubmitting, isSent, resend } =
    useRecoverPasswordForm();

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-7 text-center">
      {isSent ? (
        <RecoverEmailSent onResend={resend} />
      ) : (
        <RecoverPasswordForm
          control={control}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 6: Página, API y ruta**

`src/features/auth/RecoverPasswordPage.tsx`:

```tsx
import { RecoverPassword } from "@/features/auth/components/recover-password";

export function RecoverPasswordPage() {
  return <RecoverPassword />;
}
```

Añadir a `src/features/auth/index.ts`:

```ts
export { RecoverPasswordPage } from "@/features/auth/RecoverPasswordPage";
```

`src/app/(auth)/recuperar-contrasena/page.tsx`:

```tsx
import type { Metadata } from "next";
import { RecoverPasswordPage } from "@/features/auth";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function Page() {
  return <RecoverPasswordPage />;
}
```

- [ ] **Step 7: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. En `pnpm dev` → `/recuperar-contrasena`: correo inválido muestra el error; uno válido cambia a "Revisa tu correo"; "¿No llegó? Reenviar" vuelve al formulario con el correo conservado; la columna queda centrada en desktop y en 390px.

- [ ] **Step 8: Commit**

```bash
git add src/features/auth "src/app/(auth)/recuperar-contrasena"
git commit -m "feat: :sparkles: add recover password view

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Feature `dashboard` — layout protegido e inicio

**Files:**
- Create: `src/features/dashboard/index.ts`, `src/features/dashboard/DashboardHomePage.tsx`
- Create: `src/features/dashboard/constants/dashboardNav.ts`, `constants/dashboardSlots.ts`
- Create: `src/features/dashboard/utils/getInitials.ts`
- Create: `src/features/dashboard/hooks/useActiveNavItem.ts`, `hooks/useAccountMenu.ts`
- Create: `src/features/dashboard/components/dashboard-layout/index.tsx`
- Create: `.../dashboard-layout/dashboard-sidebar/index.tsx`, `.../dashboard-sidebar/sidebar-nav-item/index.tsx`, `.../dashboard-sidebar/rank-card/index.tsx`
- Create: `.../dashboard-layout/dashboard-header/index.tsx`, `.../dashboard-header/account-menu/index.tsx`
- Create: `src/features/dashboard/components/welcome-banner/index.tsx`
- Create: `src/features/dashboard/components/dashboard-slots/index.tsx`, `dashboard-slots/dashboard-slot/index.tsx`
- Create: `src/app/(app)/layout.tsx`, `src/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `useSessionStore` (`user`, `signOut`), `SessionGuard` (Task 3), `learningPaths` (Task 1), `ButtonLink` (Task 1), `routes.DASHBOARD`, `routes.HOME`.
- Produces: `export { DashboardLayout, DashboardHomePage }` desde `@/features/dashboard`.

Decisiones: solo existe la ruta "Inicio"; el resto del menú se muestra deshabilitado con "Pronto" (sin links rotos). El buscador y la campana del diseño se omiten hasta tener su feature (serían controles muertos). El avatar abre un menú con "Cerrar sesión".

- [ ] **Step 1: Navegación** — `src/features/dashboard/constants/dashboardNav.ts`:

```ts
import { routes } from "@/common/constants/routes";

export type DashboardNavItem = { id: string; label: string; href?: string };

export const dashboardNav: DashboardNavItem[] = [
  { id: "inicio", label: "Inicio", href: routes.DASHBOARD },
  { id: "path", label: "Mi path" },
  { id: "mentor", label: "Mi mentor" },
  { id: "sesiones", label: "Sesiones" },
  { id: "portafolio", label: "Portafolio" },
  { id: "comunidad", label: "Comunidad" },
  { id: "ajustes", label: "Ajustes" },
];
```

- [ ] **Step 2: Tarjetas** — `src/features/dashboard/constants/dashboardSlots.ts`:

```ts
export type DashboardSlotContent = {
  id: string;
  title: string;
  highlight?: string;
  emptyMessage: string;
  isWide?: boolean;
};

export const dashboardSlots: DashboardSlotContent[] = [
  {
    id: "progreso",
    title: "Progreso del path",
    emptyMessage: "Aquí verás tus módulos completados y tu avance.",
    isWide: true,
  },
  {
    id: "proxima-sesion",
    title: "Próxima sesión con tu",
    highlight: "mentor",
    emptyMessage: "Aquí verás la fecha, la hora y el enlace de tu próxima sesión.",
  },
  {
    id: "tareas",
    title: "Tareas de la semana",
    emptyMessage: "Aquí verás las tareas que te asigne tu mentor.",
  },
  {
    id: "recursos",
    title: "Recursos recomendados",
    emptyMessage: "Aquí verás los recursos que te recomiende tu mentor.",
  },
  {
    id: "comunidad",
    title: "Comunidad",
    emptyMessage: "Aquí verás la actividad reciente de la comunidad.",
  },
];
```

- [ ] **Step 3: Iniciales** — `src/features/dashboard/utils/getInitials.ts`:

```ts
export function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return initials || "SV";
}
```

- [ ] **Step 4: Hooks**

`src/features/dashboard/hooks/useActiveNavItem.ts`:

```ts
import { usePathname } from "next/navigation";
import { dashboardNav } from "@/features/dashboard/constants/dashboardNav";

export function useActiveNavItem() {
  const pathname = usePathname();
  const activeItem =
    dashboardNav.find((item) => item.href === pathname) ?? dashboardNav[0];
  return { activeItem };
}
```

`src/features/dashboard/hooks/useAccountMenu.ts`:

```ts
import { useState } from "react";
import { useSessionStore } from "@/common/store/useSessionStore";
import { getInitials } from "@/features/dashboard/utils/getInitials";

export function useAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const name = useSessionStore((state) => state.user?.name ?? "");
  const signOut = useSessionStore((state) => state.signOut);

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    initials: getInitials(name),
    // El SessionGuard del grupo (app) redirige al login al cerrar sesión.
    signOut,
  };
}
```

- [ ] **Step 5: Item del menú** — `.../dashboard-sidebar/sidebar-nav-item/index.tsx`:

```tsx
import Link from "next/link";
import type { DashboardNavItem } from "@/features/dashboard/constants/dashboardNav";

type SidebarNavItemProps = { item: DashboardNavItem; isActive: boolean };

const baseClassName =
  "flex min-h-11 flex-none items-center gap-3 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[15px] no-underline";

export function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  if (!item.href) {
    return (
      <span aria-disabled="true" className={`${baseClassName} text-white/40`}>
        <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full bg-white/25" />
        {item.label}
        <span className="ml-auto text-[11px] uppercase tracking-wider">Pronto</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`${baseClassName} ${
        isActive
          ? "bg-primary/[0.12] font-bold text-primary"
          : "font-medium text-[#E6E6EE] hover:bg-white/5"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 flex-none rounded-full ${isActive ? "bg-primary" : "bg-white/25"}`}
      />
      {item.label}
    </Link>
  );
}
```

- [ ] **Step 6: Tarjeta de rango** — `.../dashboard-sidebar/rank-card/index.tsx`:

```tsx
"use client";
import { learningPaths } from "@/common/constants/learningPaths";
import { useSessionStore } from "@/common/store/useSessionStore";

export function RankCard() {
  const path = useSessionStore((state) => state.user?.path ?? null);

  return (
    <div className="mx-3 mt-auto hidden flex-col gap-2 rounded-[18px] border border-white/15 bg-[#000E2799] p-4 md:flex">
      <span className="text-xs uppercase tracking-wider text-[#9A9AAE]">Tu rango</span>
      <span className="font-sedgwick text-[26px] text-primary">
        {path ? learningPaths[path].name : "Por definir"}
      </span>
    </div>
  );
}
```

- [ ] **Step 7: Sidebar** — `.../dashboard-layout/dashboard-sidebar/index.tsx`:

```tsx
"use client";
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { RankCard } from "@/features/dashboard/components/dashboard-layout/dashboard-sidebar/rank-card";
import { SidebarNavItem } from "@/features/dashboard/components/dashboard-layout/dashboard-sidebar/sidebar-nav-item";
import { dashboardNav } from "@/features/dashboard/constants/dashboardNav";
import { useActiveNavItem } from "@/features/dashboard/hooks/useActiveNavItem";

export function DashboardSidebar() {
  const { activeItem } = useActiveNavItem();

  return (
    <aside className="flex min-w-0 flex-col gap-2 border-white/10 bg-black/90 md:w-60 md:flex-none md:border-r md:pb-6">
      <div className="flex h-[85px] items-center border-b border-white/10 px-6">
        <Link href={routes.HOME} className="font-sedgwick text-[30px] text-white no-underline">
          Swordvoice
        </Link>
      </div>
      <nav
        aria-label="Principal"
        className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible md:py-4"
      >
        {dashboardNav.map((item) => (
          <SidebarNavItem key={item.id} item={item} isActive={item.id === activeItem.id} />
        ))}
      </nav>
      <RankCard />
    </aside>
  );
}
```

- [ ] **Step 8: Menú de cuenta** — `.../dashboard-header/account-menu/index.tsx`:

```tsx
"use client";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";

export function AccountMenu() {
  const { isOpen, toggle, initials, signOut } = useAccountMenu();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label="Mi cuenta"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-blue text-[15px] font-bold hover:border-primary"
      >
        {initials}
      </button>
      {isOpen && (
        <div
          id="account-menu"
          className="absolute right-0 top-14 z-20 w-48 rounded-xl border border-white/15 bg-black p-2"
        >
          <button
            type="button"
            onClick={signOut}
            className="min-h-11 w-full rounded-lg px-3 text-left hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Header** — `.../dashboard-layout/dashboard-header/index.tsx`:

```tsx
"use client";
import { AccountMenu } from "@/features/dashboard/components/dashboard-layout/dashboard-header/account-menu";
import { useActiveNavItem } from "@/features/dashboard/hooks/useActiveNavItem";

export function DashboardHeader() {
  const { activeItem } = useActiveNavItem();

  return (
    <header className="flex h-[85px] items-center justify-between gap-4 border-b border-white/10 bg-blurry px-4 md:px-10">
      <h1 className="text-xl font-bold">{activeItem.label}</h1>
      <AccountMenu />
    </header>
  );
}
```

- [ ] **Step 10: Layout** — `src/features/dashboard/components/dashboard-layout/index.tsx`:

```tsx
import type { ReactNode } from "react";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-layout/dashboard-header";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-layout/dashboard-sidebar";

type DashboardLayoutProps = { children: ReactNode };

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white md:flex-row">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-10">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Banner** — `src/features/dashboard/components/welcome-banner/index.tsx`:

```tsx
"use client";
import { ButtonLink } from "@/common/components/button-link";
import { learningPaths } from "@/common/constants/learningPaths";
import { useSessionStore } from "@/common/store/useSessionStore";

export function WelcomeBanner() {
  const user = useSessionStore((state) => state.user);
  const pathName = user?.path ? learningPaths[user.path].name : null;

  return (
    <section className="relative flex min-h-[200px] items-end overflow-hidden rounded-[18px] bg-ourPathsBackground bg-cover bg-center">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
      <div className="relative flex w-full flex-wrap items-end justify-between gap-5 p-5 md:p-9">
        <div className="flex max-w-xl flex-col gap-2.5">
          <h2 className="font-sedgwick text-[32px] leading-tight md:text-5xl">
            Hola, <span className="text-primary">{user?.name}</span>
          </h2>
          <p className="text-[17px] leading-normal text-[#E6E6EE]">
            {pathName ? (
              <>
                Estás en el path <strong className="text-secondary">{pathName}</strong>.
                Tu mentor te dejó el plan de esta semana.
              </>
            ) : (
              "Pronto te asignaremos un path y un mentor."
            )}
          </p>
        </div>
        <ButtonLink href="#progreso" label="Continuar plan" />
      </div>
    </section>
  );
}
```

- [ ] **Step 12: Tarjetas**

`src/features/dashboard/components/dashboard-slots/dashboard-slot/index.tsx`:

```tsx
import type { DashboardSlotContent } from "@/features/dashboard/constants/dashboardSlots";

type DashboardSlotProps = { slot: DashboardSlotContent };

export function DashboardSlot({ slot }: DashboardSlotProps) {
  return (
    <section
      id={slot.id}
      className={`flex min-h-[220px] scroll-mt-24 flex-col gap-3 rounded-[18px] border border-dashed border-white/25 bg-black/55 p-6 ${
        slot.isWide ? "md:col-span-2" : ""
      }`}
    >
      <h3 className="text-lg font-bold">
        {slot.title}
        {slot.highlight && <span className="text-primary"> {slot.highlight}</span>}
      </h3>
      <p className="flex flex-1 items-center justify-center rounded-xl bg-white/[0.04] p-3 text-center text-sm text-[#9A9AAE]">
        {slot.emptyMessage}
      </p>
    </section>
  );
}
```

`src/features/dashboard/components/dashboard-slots/index.tsx`:

```tsx
import { DashboardSlot } from "@/features/dashboard/components/dashboard-slots/dashboard-slot";
import { dashboardSlots } from "@/features/dashboard/constants/dashboardSlots";

export function DashboardSlots() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {dashboardSlots.map((slot) => (
        <DashboardSlot key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
```

- [ ] **Step 13: Página y API pública**

`src/features/dashboard/DashboardHomePage.tsx`:

```tsx
import { DashboardSlots } from "@/features/dashboard/components/dashboard-slots";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";

export function DashboardHomePage() {
  return (
    <>
      <WelcomeBanner />
      <DashboardSlots />
    </>
  );
}
```

`src/features/dashboard/index.ts`:

```ts
export { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
export { DashboardHomePage } from "@/features/dashboard/DashboardHomePage";
```

- [ ] **Step 14: Rutas**

`src/app/(app)/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";
import { DashboardLayout } from "@/features/dashboard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppRouteLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard access="private">
      <DashboardLayout>{children}</DashboardLayout>
    </SessionGuard>
  );
}
```

`src/app/(app)/dashboard/page.tsx`:

```tsx
import type { Metadata } from "next";
import { DashboardHomePage } from "@/features/dashboard";

export const metadata: Metadata = { title: "Inicio" };

export default function Page() {
  return <DashboardHomePage />;
}
```

- [ ] **Step 15: Verificar (Review Focus 1, 2 y 5)**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores. En `pnpm dev`, con `sv-session` borrado:
1. Abrir `/dashboard` → redirige a `/iniciar-sesion` sin mostrar el dashboard.
2. Registrarse en `/registro` eligiendo Wanderer → llega a `/dashboard`; banner "Hola, <nombre>", "Estás en el path Wanderer", rango "Wanderer", avatar con las iniciales.
3. Recargar `/dashboard` (F5) → sigue en el dashboard, sin pasar por el login.
4. Con sesión, abrir `/iniciar-sesion` y `/registro` → redirigen a `/dashboard`.
5. Avatar → "Cerrar sesión" → vuelve a `/iniciar-sesion`.
6. Iniciar sesión con un correo → banner con la parte local del correo y "Pronto te asignaremos un path y un mentor."; rango "Por definir".
7. "Continuar plan" baja a la tarjeta "Progreso del path".
8. A 390px: menú con scroll horizontal, tarjetas en una columna, sin scroll horizontal de la página.

- [ ] **Step 16: Commit**

```bash
git add src/features/dashboard "src/app/(app)"
git commit -m "feat: :sparkles: add protected dashboard layout and home

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Sitemap, robots y verificación final

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/robots.ts`

- [ ] **Step 1: Sitemap** — reemplazar `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";

import { routes } from "@/common/constants/routes";
import { SITE_URL } from "@/common/constants/site";

type SitemapPage = {
  path: string;
  priority: number;
  changeFrequency: "monthly" | "yearly";
};

const pages: SitemapPage[] = [
  { path: routes.HOME, priority: 1, changeFrequency: "monthly" },
  { path: routes.REGISTER, priority: 0.8, changeFrequency: "monthly" },
  { path: routes.LOGIN, priority: 0.5, changeFrequency: "yearly" },
  { path: routes.TERMS, priority: 0.3, changeFrequency: "yearly" },
  { path: routes.PRIVACY, priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
```

- [ ] **Step 2: Robots** — en `src/app/robots.ts` cambiar `disallow: "/api/",` por:

```ts
      disallow: ["/api/", "/dashboard"],
```

- [ ] **Step 3: Verificación completa**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: los cuatro en verde. En la salida de `pnpm build` aparecen `/`, `/iniciar-sesion`, `/registro`, `/recuperar-contrasena`, `/dashboard`, `/terminos`, `/privacidad`, `/sitemap.xml` y `/robots.txt`. `/sitemap.xml` en `pnpm dev` lista las 5 páginas públicas.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: :mag: add new public pages to sitemap and hide dashboard from crawlers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Pendientes fuera de este plan

- **Contenido legal real:** `src/features/legal/constants/company.ts`, los párrafos entre corchetes de `terms.ts`/`privacy.ts` y `CONTACT_EMAIL` en `src/common/constants/site.ts` (roadmap 0.4–0.7).
- **Redes sociales del footer:** se añaden cuando existan las URLs oficiales.
- **Backend de auth (feature 1):** sustituir `signIn` local por el proveedor real, montar `SocialLoginButton` y enviar `remember`. La sesión local actual no protege datos: solo decide qué vistas se ven.
- **Buscador y notificaciones del dashboard:** el diseño los tiene; llegan con sus features (notificaciones = feature 8).
- **Tests** de schemas, hooks y componentes nuevos, según conventions §5.
- **Fuera de alcance, pero barato:** `lang="es"` y la descripción en español de `src/app/layout.tsx` (roadmap 0.1).
