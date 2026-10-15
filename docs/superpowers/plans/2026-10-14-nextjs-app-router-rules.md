# Reglas de App Router de Next.js — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que toda implementación siga las convenciones de archivos de Next.js App Router: los `layout.tsx` y `page.tsx` de `src/app` componen la ruta (marco compartido, secciones, metadata), existen los archivos especiales que la app necesita (`not-found`, `global-error`), y las reglas del repo, los agentes y ESLint lo hacen cumplir.

**Architecture:** `src/app` pasa de "solo reenvía a `<XLayout>`/`<XPage>` de la feature" a "cada segmento compone su ruta con los archivos especiales de Next". Las features dejan de exportar páginas y layouts: exportan secciones y componentes por su `index.ts`. La regla vive en `docs/architecture/conventions.md` (§4.8 nuevo), se resume en una regla de Claude Code con alcance `src/app/**` (`.claude/rules/nextjs-app-router.md`), el agente `developer` la incluye en su checklist, y ESLint bloquea los dos errores mecánicos: exportar `XxxPage`/`XxxLayout` desde una feature y poner `"use client"` en `page.tsx`/`layout.tsx`.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript, Tailwind, ESLint 8 (`.eslintrc.json`), Claude Code `.claude/rules` y `.claude/agents`.

**Spec:** Petición del usuario (2026-10-14): "que al implementar código se implemente con las buenas prácticas de Next.js… no están usando los layout.tsx ni los routing files como lo indica la documentación… haz los ajustes en las rules o en el lugar que corresponda". Decisiones del usuario: los routing files **componen la ruta** (se eliminan los envoltorios `AuthLayout`/`LoginPage`/…) y el plan ajusta **reglas + código existente**. Referencia: https://nextjs.org/docs/app/getting-started/project-structure

## Global Constraints

- Next.js **15.5** (no 16): el middleware se llama `src/middleware.ts` (no `proxy.ts`); `params` y `searchParams` son `Promise` y se leen con `await`.
- Sin tests nuevos (decisión del usuario vigente). Verificación por tarea: `pnpm lint && pnpm typecheck && pnpm test`, más el HTML servido con `curl` cuando la tarea toca rutas.
- **No cambia ninguna URL, texto, clase ni comportamiento visible**: es una reubicación del código. El HTML servido de cada ruta debe contener lo mismo antes y después.
- `page.tsx` y `layout.tsx` son Server Components: nunca `"use client"`. Solo `error.tsx` y `global-error.tsx` llevan `"use client"`, porque Next lo exige.
- `src/app` importa de una feature SOLO por `@/features/<x>` (su `index.ts`) y de `@/common/...` libremente (conventions §3, ya forzado por ESLint).
- Los archivos de `src/app` usan `export default` (Next lo exige); el resto del código, exports nombrados.
- Textos de UI en español.
- Los servidores de desarrollo del usuario pueden estar corriendo: no borrar `.next/` ni matar procesos ajenos; para verificar se usa un `pnpm dev -p 3123` propio que se detiene al terminar.

## Review Focus

1. **URL inexistente** (`/no-existe`) → hoy muestra la 404 genérica de Next en inglés; tras el plan debe mostrar `not-found.tsx` en español con un link al inicio → Task 6, Step 3.
2. **Reubicar un layout cambia el árbol de layouts**: la landing debe seguir con su navbar animado y el footer; legales y auth, con navbar + emblema; el dashboard sin navbar público → Tasks 2–5, comprobación con `curl` en cada una.
3. **La landing en un grupo anidado `(marketing)/(home)`** sigue resolviendo `/` y no choca con otra `page.tsx` en `/` → Task 2, `pnpm build` en Task 7.
4. **Una feature vuelve a exportar `XxxPage`/`XxxLayout`** o una `page.tsx` recibe `"use client"` → ESLint falla con el mensaje de §4.8 → Task 7, Steps 2–3 (se prueba con un archivo temporal).
5. **`global-error.tsx` sin `<html>`/`<body>` o sin estilos** → pantalla en blanco si falla el layout raíz; debe traer su propio `<html lang="es">`, `<body>` e importar `globals.css` → Task 6, Step 2.

---

## Mapa de archivos

```
docs/architecture/conventions.md                 M  §1, §4.1, nueva §4.8
.claude/rules/nextjs-app-router.md               C  regla con alcance src/app/**
.claude/agents/developer.md                      M  lee §4.8 y la añade al checklist
CLAUDE.md                                        M  menciona §4.8 y .claude/rules
.eslintrc.json                                   M  2 overrides (Task 7)

src/app/(marketing)/page.tsx                     → (marketing)/(home)/page.tsx (compone la landing)
src/app/(marketing)/(home)/layout.tsx            C  <HomeNavbar/>
src/app/(marketing)/(legal)/layout.tsx           M  marco legal (antes LegalLayout)
src/app/(marketing)/(legal)/{terminos,privacidad}/page.tsx  M
src/app/(auth)/layout.tsx                        M  marco auth (antes AuthLayout)
src/app/(auth)/*/page.tsx                        M  componen intro + tarjeta + formulario
src/app/(app)/layout.tsx                         M  marco dashboard (antes DashboardLayout)
src/app/(app)/dashboard/page.tsx                 M
src/app/not-found.tsx                            C
src/app/global-error.tsx                         C

src/features/home/HomePage.tsx                   D
src/features/legal/{TermsPage,PrivacyPage}.tsx, components/legal-layout/   D
src/features/auth/{Login,Register,RecoverPassword}Page.tsx, components/auth-layout/index.tsx   D
src/features/auth/components/auth-layout/auth-bottom-bar → components/auth-bottom-bar
src/features/dashboard/DashboardHomePage.tsx, components/dashboard-layout/index.tsx   D
src/features/dashboard/components/dashboard-layout/{dashboard-sidebar,dashboard-header} → components/
src/features/*/index.ts                          M  exportan secciones/componentes
```

---

### Task 1: Reglas de App Router (convenciones, regla de Claude Code, agente, CLAUDE.md)

**Files:**
- Modify: `docs/architecture/conventions.md` (líneas 10, 20–21, 57 y nueva §4.8 después de §4.7)
- Create: `.claude/rules/nextjs-app-router.md`
- Modify: `.claude/agents/developer.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Produces: la sección "§4.8 Rutas (App Router)" que citan los mensajes de ESLint de Task 7 y la regla de `.claude/rules`.

- [ ] **Step 1: §1 Estructura** — en `docs/architecture/conventions.md`, reemplazar la línea 10:

```
src/app/                 Solo routing de Next (page, layout, error, route). Sin lógica.
```

por:

```
src/app/                 Rutas de Next: cada segmento compone su UI con los archivos especiales
                         (layout, page, error, not-found, loading, route…). Ver §4.8.
```

y reemplazar las líneas 20–21:

```
  <Page>Page.tsx         Compone las secciones (components/). Sin estado ni efectos.
  index.ts               API pública (lo que consume app/)
```

por:

```
  index.ts               API pública: secciones, componentes y constantes que componen las rutas de app/
```

- [ ] **Step 2: §4.1** — reemplazar la línea 57:

```
- **`<Page>Page.tsx`**: solo compone. Ej.: `src/features/home/HomePage.tsx`.
```

por:

```
- Las features NO definen páginas ni layouts (`XxxPage`, `XxxLayout`): exportan secciones y componentes, y la ruta los compone en `src/app` (§4.8).
```

- [ ] **Step 3: nueva §4.8** — insertar justo antes de `## 5. Tests`:

```md
### 4.8 Rutas (App Router)
Next.js 15.5. Referencia: https://nextjs.org/docs/app/getting-started/project-structure

- **`layout.tsx` es el marco del segmento**: renderiza directamente lo que comparten sus rutas (navbar, `<main>`, footer, guard de sesión) y recibe `children`. No envuelvas un componente `XxxLayout` de una feature. Ej.: `src/app/(auth)/layout.tsx`.
- **`page.tsx` compone la ruta**: importa las secciones desde `@/features/<x>` y las ordena; exporta `metadata` (o `generateMetadata` si depende de `params`). Sin estado ni efectos. Ej.: `src/app/(auth)/iniciar-sesion/page.tsx`.
- `page.tsx` y `layout.tsx` son **Server Components**: nunca `"use client"`. La interactividad va en un componente cliente de la feature o de `common`.
- **Route groups `(nombre)`** para compartir un layout entre rutas sin cambiar la URL; se pueden anidar (`(marketing)/(legal)`). Una carpeta sin `page.tsx` ni `route.ts` no es ruta.
- **Archivos especiales**, solo cuando aportan:
  - `error.tsx` (cliente): `src/app/error.tsx` cubre todos los segmentos hijos. Añade uno propio solo si un segmento necesita otra pantalla de error.
  - `global-error.tsx` (cliente): reemplaza al layout raíz si este falla; trae su propio `<html lang="es">` y `<body>` e importa `globals.css`.
  - `not-found.tsx`: `src/app/not-found.tsx` atiende URLs inexistentes y las llamadas a `notFound()`.
  - `loading.tsx`: solo en segmentos con trabajo asíncrono en el servidor (fetch en un Server Component). No sirve para estado de cliente.
  - `template.tsx` solo si el estado debe reiniciarse en cada navegación; `default.tsx` solo con rutas paralelas (`@slot`).
  - `route.ts` solo en `src/app/api/**` (§4.4).
- **Metadata**: con la Metadata API (`metadata` / `generateMetadata`) en `layout.tsx` o `page.tsx`, nunca con `<head>` ni `<title>` manuales. El título usa la plantilla del layout raíz (`%s · Swordvoice Academy`), así que la página solo da su parte. Las rutas privadas declaran `robots: { index: false, follow: false }` en el layout de su grupo. `sitemap.ts`, `robots.ts`, `favicon.ico` y `opengraph-image.*` viven en `src/app`.
- **Parámetros dinámicos**: en Next 15 `params` y `searchParams` son `Promise`: `const { slug } = await params`.
- **Navegación y recursos**: `next/link` para links internos; `redirect()` y `notFound()` de `next/navigation` en el servidor, `useRouter` solo en handlers de cliente; `next/image` para imágenes (el lint prohíbe `<img>`); fuentes con `next/font` en el layout raíz.
- **Middleware**: `src/middleware.ts` (en Next 15 todavía no se llama `proxy.ts`).
```

- [ ] **Step 4: Regla de Claude Code** — crear `.claude/rules/nextjs-app-router.md`:

```md
---
paths:
  - "src/app/**"
---

# Rutas de Next.js (App Router)

Antes de crear o editar un archivo en `src/app`, aplica `docs/architecture/conventions.md` §4.8. Lo esencial:

- `layout.tsx` renderiza el marco del segmento (navbar, `<main>`, footer, guard); nunca envuelve un `XxxLayout` de una feature.
- `page.tsx` compone las secciones importadas de `@/features/<x>` y exporta `metadata`; nunca reenvía a un `XxxPage`.
- `page.tsx` y `layout.tsx` son Server Components: sin `"use client"`.
- Route groups `(nombre)` para compartir layouts sin cambiar la URL.
- Archivos especiales solo cuando aportan: `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx` (solo con trabajo asíncrono en el servidor), `route.ts` (solo en `api/`).
- Next 15.5: `params`/`searchParams` son `Promise`; el middleware es `src/middleware.ts`.
```

- [ ] **Step 5: Agente developer** — en `.claude/agents/developer.md`:

a) En "## Antes de escribir código", después del punto 2, añadir:

```
3. Si la tarea crea o toca archivos en `src/app`, aplica §4.8 (Rutas): `layout.tsx` y `page.tsx` componen la ruta, nunca reenvían a un `XxxLayout`/`XxxPage` de la feature.
```

y renumerar el punto 3 actual ("Si la tarea no dice qué archivos tocar…") como 4.

b) En "### Checklist de convenciones", después de `- §4.7 estilo: sí/no/n.a.`, añadir:

```
- §4.8 rutas (App Router): sí/no/n.a.
```

- [ ] **Step 6: CLAUDE.md** — reemplazar la línea 14:

```
Toda implementación sigue `docs/architecture/conventions.md`. Ejemplo canónico: `src/features/home` (formulario de contacto).
```

por:

```
Toda implementación sigue `docs/architecture/conventions.md`. Ejemplos canónicos: `src/features/home` (formulario de contacto, de schema a route) y `src/app/(auth)` (rutas: layout + pages que componen, §4.8). Las reglas por ruta de archivo viven en `.claude/rules/`.
```

- [ ] **Step 7: Verificar**

Run: `pnpm lint && pnpm typecheck`
Expected: verde (solo cambian docs y configuración de agentes). Además: `grep -n "Page>Page" docs/architecture/conventions.md` no devuelve nada.

- [ ] **Step 8: Commit**

```bash
git add docs/architecture/conventions.md .claude/rules/nextjs-app-router.md .claude/agents/developer.md CLAUDE.md
git commit -m "docs: :memo: add App Router rules for layouts, pages and special files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Landing — la ruta compone las secciones

**Files:**
- Move: `src/app/(marketing)/page.tsx` → `src/app/(marketing)/(home)/page.tsx`
- Create: `src/app/(marketing)/(home)/layout.tsx`
- Modify: `src/features/home/index.ts`
- Delete: `src/features/home/HomePage.tsx`

**Interfaces:**
- Produces: `@/features/home` exporta `AboutSection, BackToTopButton, ContactSection, HeroSection, HomeNavbar, PathsSection, SectionDivider, ServicesSection, SwordvoicesSection`.

- [ ] **Step 1: API pública** — reemplazar `src/features/home/index.ts`:

```ts
export { AboutSection } from "@/features/home/components/about-section";
export { BackToTopButton } from "@/features/home/components/back-to-top-button";
export { ContactSection } from "@/features/home/components/contact-section";
export { HeroSection } from "@/features/home/components/hero-section";
export { HomeNavbar } from "@/features/home/components/home-navbar";
export { PathsSection } from "@/features/home/components/paths-section";
export { SectionDivider } from "@/features/home/components/section-divider";
export { ServicesSection } from "@/features/home/components/services-section";
export { SwordvoicesSection } from "@/features/home/components/swordvoices-section";
```

- [ ] **Step 2: Mover la página al grupo `(home)`**

```bash
mkdir -p "src/app/(marketing)/(home)"
git mv "src/app/(marketing)/page.tsx" "src/app/(marketing)/(home)/page.tsx"
```

- [ ] **Step 3: Layout del grupo** — crear `src/app/(marketing)/(home)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { HomeNavbar } from "@/features/home";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HomeNavbar />
      {children}
    </>
  );
}
```

- [ ] **Step 4: Página** — reemplazar `src/app/(marketing)/(home)/page.tsx`:

```tsx
import {
  AboutSection,
  BackToTopButton,
  ContactSection,
  HeroSection,
  PathsSection,
  SectionDivider,
  ServicesSection,
  SwordvoicesSection,
} from "@/features/home";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <SectionDivider />
      <ServicesSection />
      <SectionDivider />
      <AboutSection />
      <SectionDivider />
      <SwordvoicesSection />
      <SectionDivider className="relative top-2" />
      <PathsSection />
      <ContactSection />
      <BackToTopButton />
    </main>
  );
}
```

(El navbar es `fixed`, así que sacarlo del `<main>` no cambia la maquetación.)

- [ ] **Step 5: Borrar el envoltorio**

```bash
git rm src/features/home/HomePage.tsx
```

- [ ] **Step 6: Verificar**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: verde.
Luego `pnpm dev -p 3123` en segundo plano y `curl -s http://localhost:3123/`: responde 200 y contiene `aria-label="Ir al inicio"`, el svg `viewBox="0 0 315 120"`, `id="services"`, `id="contact_us"` y el `<footer>`. Detener el servidor de 3123.

- [ ] **Step 7: Commit**

```bash
git add -A src/features/home "src/app/(marketing)"
git commit -m "refactor: :recycle: compose the landing in its route files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Legales — layout y páginas componen

**Files:**
- Modify: `src/features/legal/index.ts`
- Modify: `src/app/(marketing)/(legal)/layout.tsx`
- Modify: `src/app/(marketing)/(legal)/terminos/page.tsx`, `src/app/(marketing)/(legal)/privacidad/page.tsx`
- Delete: `src/features/legal/TermsPage.tsx`, `src/features/legal/PrivacyPage.tsx`, `src/features/legal/components/legal-layout/`

**Interfaces:**
- Produces: `@/features/legal` exporta `LegalDocument`, `privacy`, `terms`.

- [ ] **Step 1: API pública** — reemplazar `src/features/legal/index.ts`:

```ts
export { LegalDocument } from "@/features/legal/components/legal-document";
export { privacy } from "@/features/legal/constants/privacy";
export { terms } from "@/features/legal/constants/terms";
```

- [ ] **Step 2: Layout** — reemplazar `src/app/(marketing)/(legal)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { Navbar } from "@/common/components/navbar";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar changeLogo />
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Páginas** — reemplazar `src/app/(marketing)/(legal)/terminos/page.tsx`:

```tsx
import type { Metadata } from "next";
import { LegalDocument, terms } from "@/features/legal";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return <LegalDocument content={terms} />;
}
```

y `src/app/(marketing)/(legal)/privacidad/page.tsx`:

```tsx
import type { Metadata } from "next";
import { LegalDocument, privacy } from "@/features/legal";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return <LegalDocument content={privacy} />;
}
```

- [ ] **Step 4: Borrar los envoltorios**

```bash
git rm src/features/legal/TermsPage.tsx src/features/legal/PrivacyPage.tsx
git rm -r src/features/legal/components/legal-layout
```

- [ ] **Step 5: Verificar**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: verde.
`curl` a `/terminos` y `/privacidad` (servidor propio en 3123): `<title>` "Términos y condiciones · Swordvoice Academy" / "Política de privacidad · Swordvoice Academy", el `<h1>`, 9 y 8 `<section id=…>`, el navbar con `viewBox="0 0 77 87"` y el `<footer>`. Detener el servidor.

- [ ] **Step 6: Commit**

```bash
git add -A src/features/legal "src/app/(marketing)/(legal)"
git commit -m "refactor: :recycle: compose legal pages in their route files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Auth — layout y páginas componen

**Files:**
- Move: `src/features/auth/components/auth-layout/auth-bottom-bar/` → `src/features/auth/components/auth-bottom-bar/`
- Delete: `src/features/auth/components/auth-layout/` (queda vacía tras el move y el borrado de su `index.tsx`), `src/features/auth/LoginPage.tsx`, `src/features/auth/RegisterPage.tsx`, `src/features/auth/RecoverPasswordPage.tsx`
- Modify: `src/features/auth/index.ts`
- Modify: `src/app/(auth)/layout.tsx`, `src/app/(auth)/iniciar-sesion/page.tsx`, `src/app/(auth)/registro/page.tsx`, `src/app/(auth)/recuperar-contrasena/page.tsx`

**Interfaces:**
- Produces: `@/features/auth` exporta `AuthBottomBar, AuthCard, AuthIntro, LoginForm, RecoverPassword, RegisterBenefits, RegisterForm`. (`SocialLoginButton` sigue sin exportarse ni montarse.)

- [ ] **Step 1: Mover la barra inferior y borrar el layout de la feature**

```bash
git mv src/features/auth/components/auth-layout/auth-bottom-bar src/features/auth/components/auth-bottom-bar
git rm src/features/auth/components/auth-layout/index.tsx
git rm src/features/auth/LoginPage.tsx src/features/auth/RegisterPage.tsx src/features/auth/RecoverPasswordPage.tsx
```

(`auth-bottom-bar/index.tsx` no importa nada de `auth-layout`, así que no cambia.)

- [ ] **Step 2: API pública** — reemplazar `src/features/auth/index.ts`:

```ts
export { AuthBottomBar } from "@/features/auth/components/auth-bottom-bar";
export { AuthCard } from "@/features/auth/components/auth-card";
export { AuthIntro } from "@/features/auth/components/auth-intro";
export { LoginForm } from "@/features/auth/components/login-form";
export { RecoverPassword } from "@/features/auth/components/recover-password";
export { RegisterBenefits } from "@/features/auth/components/register-benefits";
export { RegisterForm } from "@/features/auth/components/register-form";
```

- [ ] **Step 3: Layout** — reemplazar `src/app/(auth)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { Navbar } from "@/common/components/navbar";
import { SessionGuard } from "@/common/components/session-guard";
import { AuthBottomBar } from "@/features/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard access="guest">
      <div className="relative flex min-h-screen flex-col bg-home bg-cover bg-bottom pt-[85px] text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-black/[0.55]" />
        <Navbar changeLogo />
        <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-wrap items-center justify-between gap-12 px-4 py-8 md:px-12 md:py-20">
          {children}
        </main>
        <AuthBottomBar />
      </div>
    </SessionGuard>
  );
}
```

- [ ] **Step 4: Login** — reemplazar `src/app/(auth)/iniciar-sesion/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { AuthCard, AuthIntro, LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
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

- [ ] **Step 5: Registro** — reemplazar `src/app/(auth)/registro/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import {
  AuthCard,
  AuthIntro,
  RegisterBenefits,
  RegisterForm,
} from "@/features/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
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

- [ ] **Step 6: Recuperar** — reemplazar `src/app/(auth)/recuperar-contrasena/page.tsx`:

```tsx
import type { Metadata } from "next";
import { RecoverPassword } from "@/features/auth";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecoverPasswordPage() {
  return <RecoverPassword />;
}
```

- [ ] **Step 7: Verificar**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: verde. `grep -rn "auth-layout\|AuthLayout\|LoginPage\|RegisterPage\|RecoverPasswordPage" src/features` sin resultados.
`curl` a `/iniciar-sesion`, `/registro` y `/recuperar-contrasena` (servidor propio en 3123): mismos `<title>` que antes ("Iniciar sesión · …", "Crear cuenta · …", "Recuperar contraseña · …"), el formulario de cada una, el navbar con `viewBox="0 0 77 87"` y los links `/terminos` y `/privacidad` de la barra inferior. Detener el servidor.

- [ ] **Step 8: Commit**

```bash
git add -A src/features/auth "src/app/(auth)"
git commit -m "refactor: :recycle: compose auth routes in their layout and pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Dashboard — layout y página componen

**Files:**
- Move: `src/features/dashboard/components/dashboard-layout/dashboard-sidebar/` → `src/features/dashboard/components/dashboard-sidebar/`
- Move: `src/features/dashboard/components/dashboard-layout/dashboard-header/` → `src/features/dashboard/components/dashboard-header/`
- Delete: `src/features/dashboard/components/dashboard-layout/index.tsx`, `src/features/dashboard/DashboardHomePage.tsx`
- Modify: imports dentro de los componentes movidos, `src/features/dashboard/index.ts`, `src/app/(app)/layout.tsx`, `src/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Produces: `@/features/dashboard` exporta `DashboardHeader, DashboardSidebar, DashboardSlots, WelcomeBanner`.

- [ ] **Step 1: Mover y borrar**

```bash
git mv src/features/dashboard/components/dashboard-layout/dashboard-sidebar src/features/dashboard/components/dashboard-sidebar
git mv src/features/dashboard/components/dashboard-layout/dashboard-header src/features/dashboard/components/dashboard-header
git rm src/features/dashboard/components/dashboard-layout/index.tsx src/features/dashboard/DashboardHomePage.tsx
```

- [ ] **Step 2: Corregir los imports de los componentes movidos**

```bash
grep -rl "components/dashboard-layout/" src/features/dashboard | xargs sed -i 's#components/dashboard-layout/#components/#g'
```

Expected: `grep -rn "dashboard-layout" src` sin resultados.

- [ ] **Step 3: API pública** — reemplazar `src/features/dashboard/index.ts`:

```ts
export { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
export { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
export { DashboardSlots } from "@/features/dashboard/components/dashboard-slots";
export { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";
```

- [ ] **Step 4: Layout** — reemplazar `src/app/(app)/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";
import { DashboardHeader, DashboardSidebar } from "@/features/dashboard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard access="private">
      <div className="flex min-h-screen flex-col bg-black text-white md:flex-row">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-10">
            {children}
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
```

- [ ] **Step 5: Página** — reemplazar `src/app/(app)/dashboard/page.tsx`:

```tsx
import type { Metadata } from "next";
import { DashboardSlots, WelcomeBanner } from "@/features/dashboard";

export const metadata: Metadata = { title: "Inicio" };

export default function DashboardPage() {
  return (
    <>
      <WelcomeBanner />
      <DashboardSlots />
    </>
  );
}
```

- [ ] **Step 6: Verificar**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: verde.
`curl` a `/dashboard` (servidor propio en 3123): 200, `<title>Inicio · Swordvoice Academy</title>`, `<meta name="robots" content="noindex, nofollow"/>`, y NO contiene `aria-label="Ir al inicio"` (sin navbar público). Detener el servidor.

- [ ] **Step 7: Commit**

```bash
git add -A src/features/dashboard "src/app/(app)"
git commit -m "refactor: :recycle: compose the dashboard in its layout and page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Archivos especiales que faltan (`not-found`, `global-error`)

**Files:**
- Create: `src/app/not-found.tsx`
- Create: `src/app/global-error.tsx`

**Interfaces:**
- Consumes: `ButtonLink` (`@/common/components/button-link`), `Button` (`@/common/components/button`), `Typography`, `routes.HOME`.

- [ ] **Step 1: 404** — crear `src/app/not-found.tsx`:

```tsx
import { ButtonLink } from "@/common/components/button-link";
import { Typography } from "@/common/components/typography";
import { routes } from "@/common/constants/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black p-8 text-center text-white">
      <Typography as="h1" variant="h3" className="font-sedgwick">
        Esta página no existe
      </Typography>
      <Typography>Revisa la dirección o vuelve al inicio.</Typography>
      <ButtonLink href={routes.HOME} label="Volver al inicio" />
    </main>
  );
}
```

- [ ] **Step 2: Error del layout raíz** — crear `src/app/global-error.tsx`:

```tsx
"use client";
import { Button } from "@/common/components/button";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Reemplaza al layout raíz cuando este falla: necesita su propio <html> y <body>.
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Algo salió mal</h1>
        <Button type="button" label="Reintentar" onClick={reset} />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verificar (Review Focus 1)**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: verde.
`curl -s -w "%{http_code}" http://localhost:3123/no-existe` (servidor propio en 3123): código `404` y el HTML contiene "Esta página no existe" y `href="/"`. Detener el servidor.

- [ ] **Step 4: Commit**

```bash
git add src/app/not-found.tsx src/app/global-error.tsx
git commit -m "feat: :sparkles: add not-found and global-error route files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: ESLint hace cumplir §4.8 + verificación final

**Files:**
- Modify: `.eslintrc.json` (añadir 2 objetos al final del array `overrides`)

- [ ] **Step 1: Reglas** — en `.eslintrc.json`, añadir estos dos objetos al final del array `"overrides"` (después del objeto de `src/common/config/env.ts`):

```json
    {
      "files": ["src/features/**/*.ts", "src/features/**/*.tsx"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "ExportNamedDeclaration > FunctionDeclaration[id.name=/(Page|Layout)$/]",
            "message": "Las páginas y layouts se componen en src/app/**/page.tsx y layout.tsx (conventions §4.8)."
          }
        ]
      }
    },
    {
      "files": ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
      "rules": {
        "no-restricted-syntax": [
          "error",
          {
            "selector": "Program > ExpressionStatement[directive='use client']",
            "message": "page.tsx y layout.tsx son Server Components: mueve la interactividad a un componente cliente (conventions §4.8)."
          }
        ]
      }
    }
```

- [ ] **Step 2: Comprobar que la regla de features falla (Review Focus 4)**

```bash
printf 'export function FakePage() {\n  return null;\n}\n' > src/features/home/fakePage.tsx
pnpm lint
```

Expected: FAIL con "Las páginas y layouts se componen en src/app/**/page.tsx y layout.tsx (conventions §4.8)." en `src/features/home/fakePage.tsx`. Luego borrar el archivo:

```bash
rm src/features/home/fakePage.tsx
```

- [ ] **Step 3: Comprobar que la regla de `"use client"` falla**

```bash
mkdir -p src/app/zz-lint-check
printf '"use client";\n\nexport default function Page() {\n  return null;\n}\n' > src/app/zz-lint-check/page.tsx
pnpm lint
```

Expected: FAIL con "page.tsx y layout.tsx son Server Components…" en `src/app/zz-lint-check/page.tsx`. Luego borrar:

```bash
rm -r src/app/zz-lint-check
```

- [ ] **Step 4: Verificación completa**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: verde.
`pnpm build` SOLO si no hay otro `next dev`/`next start` corriendo sobre esta carpeta (si lo hay, se omite y se reporta): debe listar `/`, `/iniciar-sesion`, `/registro`, `/recuperar-contrasena`, `/dashboard`, `/terminos`, `/privacidad`, `/_not-found`, `/sitemap.xml`, `/robots.txt` y `/api/sendEmail`.
`find src/features -name "*Page.tsx" -o -name "*Layout*"` sin resultados.

- [ ] **Step 5: Commit**

```bash
git add .eslintrc.json
git commit -m "build: :rotating_light: lint page/layout wrappers and client directives in routes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
