> **Histórico.** La organización de rutas de este documento (`XxxPage`, `XxxLayout`, `<Page>Page.tsx`) quedó reemplazada por `docs/architecture/conventions.md` §4.8.

# Haiku Agents + Conventions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the SwordVoice landing to a screaming-folder architecture (`features/` + `common/`) enforced by ESLint, rebuild the contact flow as the canonical reference (zod + RHF + TanStack Query + httpClient), and add Haiku `developer`/`tester` subagents that follow a single conventions document.

**Architecture:** `src/app` only routes; each page lives in `src/features/<page>` exposing `index.ts` (client/page) and `server/index.ts` (server-only); shared code lives in `src/common`. Data flows component → hook (TanStack Query) → service → `common/api/httpClient` → `app/api` route (zod-validated) → `features/<page>/server`. `eslint-plugin-boundaries` + restricted imports/globals make the dependency rules mechanical.

**Tech Stack:** Next.js 15.5 App Router, React 19, TypeScript strict, Tailwind 3, react-hook-form 7 + zod 4 + @hookform/resolvers 5, @tanstack/react-query 5, zustand 5 (installed, unused), Vitest 3 + React Testing Library 16 + jsdom, ESLint 8 (legacy `.eslintrc.json`), pnpm 10.

**Spec:** `docs/superpowers/specs/2026-10-14-haiku-agents-conventions-design.md`

## Global Constraints

- Branch: `chore/haiku-agents-conventions`. Never commit `docs/roadmap/` or `.claude/settings.json` (untracked user files).
- Every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; message style `type: :gitmoji: summary` (e.g. `feat: :sparkles: ...`).
- No visual changes to the landing, except validation error text under contact inputs (needed to display the schema's Spanish messages).
- Imports always use the `@/` alias (also within the same feature). Named exports everywhere except files Next requires as default (`app/**/page.tsx`, `layout.tsx`, `error.tsx`, `robots.ts`, `sitemap.ts`).
- No `any`, no `@ts-ignore`, no `eslint-disable`.
- `process.env` only in `src/common/config/env.ts`; `fetch` only in `src/common/api/**` and `src/features/*/server/**`.
- User-facing strings in Spanish.
- After every task: `pnpm typecheck` and `pnpm build` green (from Task 1 on), `pnpm test` green (from Task 2 on), `pnpm lint` green (from Task 7 on).

## Review Focus

1. SMTP/delivery failure → the user sees an error toast and the form keeps its values (today it shows "Envío exitoso"). Pinned in Task 5 (route 500 test + ContactForm error test).
2. Hostile or malformed POST to `/api/sendEmail` (non-JSON, missing fields, 10 kB message) → 400 and no email sent. Pinned in Task 5 (route tests + schema max-length test).
3. HTML/script in name or message → escaped in the email body. Pinned in Task 2 (`escapeHtml`) and Task 5 (`buildContactEmailHtml`).
4. Missing/invalid SMTP env vars in production → 500 with a generic message, server log names the missing keys but never their values; build does not fail (env is read lazily). Pinned in Task 3.
5. Double-click on ENVIAR while a request is pending → only one request. Pinned in Task 5 (button disabled test).

---

## File Map (end state)

```
.claude/agents/developer.md, tester.md            (Task 8)
CLAUDE.md                                         (Task 8)
docs/architecture/conventions.md                  (Task 8)
.eslintrc.json                                    (Task 7)
vitest.config.ts, test/setup.ts, test/server-only.ts, test/renderWithClient.tsx (Task 1/2)
tailwind.config.ts (content paths)                (Task 4)
src/app/
  layout.tsx (Providers)        page.tsx (renders HomePage)      error.tsx
  robots.ts  sitemap.ts         api/sendEmail/route.ts (+ route.test.ts)
src/common/
  api/ApiError.ts httpClient.ts(+test) queryClient.ts
  config/env.ts(+test)
  errors/notifyError.ts(+test)
  utils/escapeHtml.ts(+test)
  constants/messages.ts routes.ts site.ts animations/navAnimation.ts navLinks.ts
  hooks/useIsMobile.ts
  assets/icons/*  assets/font/*
  components/atoms/Button.tsx Input.tsx Textarea.tsx Typography.tsx
  components/molecules/NavLink.tsx
  components/organisms/Navbar.tsx Providers.tsx
src/features/home/
  index.ts  HomePage.tsx
  server/index.ts deliverContactEmail.ts(+test)
  schemas/contact.schema.ts(+test)
  services/contactService.ts(+test)
  hooks/useSendContactEmail.ts useContactForm.ts useIsPastSection.ts(+test) useScrollToTopOnMount.ts
  utils/scrollToTop.ts
  constants/paths.ts services.ts swordvoices.ts sections.ts animations/*.ts
  components/atoms/SectionDivider.tsx
  components/molecules/PathAvailable.tsx ServiceItem.tsx SwordvoicesCard.tsx
  components/organisms/HomeNavbar.tsx HeroSection.tsx ServicesSection.tsx AboutSection.tsx
                       SwordvoicesSection.tsx SwordVoicesCarousel.tsx PathsSection.tsx
                       ContactSection.tsx ContactForm.tsx(+test) BackToTopButton.tsx
```

Deleted: `src/components/`, `src/constants/`, `src/app/hooks/`, `src/app/service/`, `src/assets/` (moved), dependency `yup`.

---

### Task 1: Tooling — dependencies, scripts, Vitest harness

**Files:**
- Modify: `package.json`, `tsconfig.json`
- Create: `vitest.config.ts`, `test/setup.ts`, `test/server-only.ts`

**Interfaces:**
- Produces: scripts `pnpm typecheck`, `pnpm test`, `pnpm lint` (lint script is final form; rules arrive in Task 7). `server-only` resolves to an empty module under Vitest.

- [ ] **Step 1: Install dependencies**

```bash
pnpm add zod@^4.1.12 @tanstack/react-query@^5.90.2 zustand@^5.0.8 server-only@^0.0.1 @hookform/resolvers@^5.2.2
pnpm add -D vitest@^3.2.4 @vitejs/plugin-react@^4.7.0 jsdom@^26.1.0 @testing-library/react@^16.3.0 @testing-library/dom@^10.4.1 @testing-library/jest-dom@^6.9.1 @testing-library/user-event@^14.6.1 vite-tsconfig-paths@^5.1.4 eslint-plugin-boundaries@^4.2.2 eslint-import-resolver-typescript@^3.10.1
```

(`yup` is removed in Task 5, once nothing imports it.)

- [ ] **Step 2: Scripts in `package.json`**

Replace the `"lint"` script and add two:

```json
"lint": "eslint src --ext .ts,.tsx --max-warnings 0",
"typecheck": "tsc --noEmit",
"test": "vitest run",
```

- [ ] **Step 3: `tsconfig.json` exclude build outputs**

```json
"exclude": ["node_modules", ".open-next", ".next"]
```

(keep `.next/types/**/*.ts` in `include`; explicit include wins for those files).

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./test/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
  },
});
```

- [ ] **Step 5: Create `test/setup.ts` and `test/server-only.ts`**

```ts
// test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

```ts
// test/server-only.ts
// Vitest stand-in for the "server-only" guard package (it throws outside the React server condition).
export {};
```

- [ ] **Step 6: Verify**

Run: `pnpm vitest run --passWithNoTests && pnpm typecheck && pnpm build`
Expected: vitest "No test files found, exiting with code 0"; tsc no output; build succeeds. (`pnpm lint` still uses the old config and passes.)

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts test/
git commit -m "build: :wrench: add zod, tanstack query, zustand and vitest tooling" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `common` infrastructure — ApiError, httpClient, notifyError, escapeHtml, queryClient

**Files:**
- Create: `src/common/constants/messages.ts`, `src/common/api/ApiError.ts`, `src/common/api/httpClient.ts`, `src/common/api/httpClient.test.ts`, `src/common/api/queryClient.ts`, `src/common/errors/notifyError.ts`, `src/common/errors/notifyError.test.ts`, `src/common/utils/escapeHtml.ts`, `src/common/utils/escapeHtml.test.ts`, `test/renderWithClient.tsx`

**Interfaces:**
- Produces:
  - `class ApiError extends Error { readonly status: number; constructor(status: number, message: string) }` (`name === "ApiError"`)
  - `request<TSchema extends z.ZodType>(path: string, options: { method?: "GET"|"POST"|"PUT"|"PATCH"|"DELETE"; body?: unknown; schema: TSchema }): Promise<z.infer<TSchema>>`
  - `makeQueryClient(): QueryClient`
  - `notifyError(error: unknown): void`
  - `escapeHtml(value: string): string`
  - constants `GENERIC_ERROR_MESSAGE`, `NETWORK_ERROR_MESSAGE`, `INVALID_RESPONSE_MESSAGE`
  - test helper `renderWithClient(ui: ReactElement): RenderResult`

- [ ] **Step 1: Write failing tests**

```ts
// src/common/api/httpClient.test.ts
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { request } from "@/common/api/httpClient";

const okSchema = z.object({ ok: z.literal(true) });

function mockFetch(result: Response | Error) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
}

describe("request", () => {
  it("sends a JSON body and returns the parsed response", async () => {
    const fetchSpy = mockFetch(Response.json({ ok: true }));

    await expect(
      request("/api/x", { method: "POST", body: { a: 1 }, schema: okSchema }),
    ).resolves.toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledWith("/api/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1 }),
    });
  });

  it("defaults to GET without body or headers", async () => {
    const fetchSpy = mockFetch(Response.json({ ok: true }));

    await request("/api/x", { schema: okSchema });
    expect(fetchSpy).toHaveBeenCalledWith("/api/x", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });
  });

  it("throws ApiError with the server message on non-2xx", async () => {
    mockFetch(
      Response.json({ message: "No se pudo enviar el mensaje" }, { status: 500 }),
    );

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      message: "No se pudo enviar el mensaje",
    });
  });

  it("uses the generic message when the error body is not JSON", async () => {
    mockFetch(new Response("boom", { status: 502 }));

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      status: 502,
      message: "Ha ocurrido un error",
    });
  });

  it("throws ApiError when a 2xx response does not match the schema", async () => {
    mockFetch(Response.json({ ok: false }));

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      status: 200,
      message: "Respuesta inválida del servidor",
    });
  });

  it("throws ApiError with status 0 on network failure", async () => {
    mockFetch(new TypeError("Failed to fetch"));

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      status: 0,
      message: "No se pudo conectar con el servidor",
    });
  });
});
```

```ts
// src/common/errors/notifyError.test.ts
import toast from "react-hot-toast";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { notifyError } from "@/common/errors/notifyError";

vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

describe("notifyError", () => {
  it("shows the ApiError message", () => {
    notifyError(new ApiError(500, "No se pudo enviar el mensaje"));
    expect(toast.error).toHaveBeenCalledWith("No se pudo enviar el mensaje");
  });

  it("shows the generic message for unknown errors", () => {
    notifyError(new Error("internal detail"));
    expect(toast.error).toHaveBeenCalledWith("Ha ocurrido un error");
  });
});
```

```ts
// src/common/utils/escapeHtml.test.ts
import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/common/utils/escapeHtml";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;",
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Hola, Juan")).toBe("Hola, Juan");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — cannot resolve `@/common/api/httpClient`, `@/common/errors/notifyError`, `@/common/utils/escapeHtml`.

- [ ] **Step 3: Implement**

```ts
// src/common/constants/messages.ts
export const GENERIC_ERROR_MESSAGE = "Ha ocurrido un error";
export const NETWORK_ERROR_MESSAGE = "No se pudo conectar con el servidor";
export const INVALID_RESPONSE_MESSAGE = "Respuesta inválida del servidor";
```

```ts
// src/common/api/ApiError.ts
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
```

```ts
// src/common/api/httpClient.ts
import { z } from "zod";
import { ApiError } from "@/common/api/ApiError";
import {
  GENERIC_ERROR_MESSAGE,
  INVALID_RESPONSE_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TSchema extends z.ZodType> = {
  method?: HttpMethod;
  body?: unknown;
  schema: TSchema;
};

export async function request<TSchema extends z.ZodType>(
  path: string,
  { method = "GET", body, schema }: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const hasBody = body !== undefined;
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, readMessage(data) ?? GENERIC_ERROR_MESSAGE);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(response.status, INVALID_RESPONSE_MESSAGE);
  }
  return parsed.data;
}

function readMessage(data: unknown): string | undefined {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }
  return undefined;
}
```

```ts
// src/common/api/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000 },
      mutations: { retry: 0 },
    },
  });
}
```

```ts
// src/common/errors/notifyError.ts
import toast from "react-hot-toast";
import { ApiError } from "@/common/api/ApiError";
import { GENERIC_ERROR_MESSAGE } from "@/common/constants/messages";

export function notifyError(error: unknown): void {
  toast.error(error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE);
}
```

```ts
// src/common/utils/escapeHtml.ts
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}
```

```tsx
// test/renderWithClient.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";

export function renderWithClient(ui: ReactElement): RenderResult {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test && pnpm typecheck`
Expected: 10 tests PASS; tsc clean.

- [ ] **Step 5: Commit**

```bash
git add src/common test/renderWithClient.tsx
git commit -m "feat: :sparkles: add http client, api error and error notification" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Validated server environment

**Files:**
- Create: `src/common/config/env.ts`, `src/common/config/env.test.ts`

**Interfaces:**
- Produces: `getServerEnv(source?: Record<string, string | undefined>): ServerEnv` where `ServerEnv = { EMAIL_TO_SEND_EMAIL: string; PASSWORD_TO_SEND_EMAIL: string; EMAILS_MENTORS: string }`. Lazy (called per request), so `next build` never needs the variables. Throws `Error("Variables de entorno inválidas: <keys>")` — key names only, never values.

- [ ] **Step 1: Write failing test**

```ts
// src/common/config/env.test.ts
import { describe, expect, it } from "vitest";
import { getServerEnv } from "@/common/config/env";

const valid = {
  EMAIL_TO_SEND_EMAIL: "bot@swordvoice.com",
  PASSWORD_TO_SEND_EMAIL: "s3cret-value",
  EMAILS_MENTORS: "a@swordvoice.com,b@swordvoice.com",
};

describe("getServerEnv", () => {
  it("returns the validated variables", () => {
    expect(getServerEnv(valid)).toEqual(valid);
  });

  it("names missing keys without leaking values", () => {
    const run = () =>
      getServerEnv({ ...valid, EMAILS_MENTORS: undefined, EMAIL_TO_SEND_EMAIL: "x" });

    expect(run).toThrow(/EMAIL_TO_SEND_EMAIL, EMAILS_MENTORS/);
    expect(run).not.toThrow(/s3cret-value/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/common/config`
Expected: FAIL — cannot resolve `@/common/config/env`.

- [ ] **Step 3: Implement**

```ts
// src/common/config/env.ts
import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  EMAIL_TO_SEND_EMAIL: z.email(),
  PASSWORD_TO_SEND_EMAIL: z.string().min(1),
  EMAILS_MENTORS: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

// Read per call (not at module load) so `next build` does not require the variables.
export function getServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Variables de entorno inválidas: ${keys}`);
  }
  return parsed.data;
}
```

(zod reports issues in schema key order, so the message is `EMAIL_TO_SEND_EMAIL, EMAILS_MENTORS`.)

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test && pnpm typecheck`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/common/config
git commit -m "feat: :lock: validate server environment variables with zod" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Move shared code to `common/` and home code to `features/home/` (no behavior change)

**Files:**
- Move (git mv): see Step 1
- Modify: `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, every moved component/constant
- Create: `src/common/constants/navLinks.ts`, `src/common/components/molecules/NavLink.tsx`

**Interfaces:**
- Produces (named exports): `Button({ label, ...buttonProps }: ComponentPropsWithoutRef<"button"> & { label: string })`, `Input`, `Textarea` (old API, changed in Task 5), `Typography`, `Navbar({ changeLogo }: { changeLogo: boolean })`, `useIsMobile(): boolean`, `routes`, `SITE_URL`, `navAnimation`, `paths`, `services`, `swordvoices`, `PathAvailable`, `ServiceItem`, `SwordvoicesCard`, `SwordVoicesCarousel`, `useBackToTopButton` (unchanged, reworked in Task 6), animations `homeAnimation`, `servicesAnimation`, `whatIsSwordvoiceAnimation`, `ourSwordvoicesAnimation`, `ourPathAnimation`.

- [ ] **Step 1: Move files**

```bash
mkdir -p src/common/components/{atoms,molecules,organisms} src/common/constants/animations src/common/hooks \
  src/features/home/components/{atoms,molecules,organisms} src/features/home/constants/animations src/features/home/hooks
git mv src/assets src/common/assets
git mv src/components/Button/index.tsx src/common/components/atoms/Button.tsx
git mv src/components/Input/index.tsx src/common/components/atoms/Input.tsx
git mv src/components/Textarea/index.tsx src/common/components/atoms/Textarea.tsx
git mv src/components/Typography/index.tsx src/common/components/atoms/Typography.tsx
git mv src/components/Navbar/index.tsx src/common/components/organisms/Navbar.tsx
git mv src/components/PathAvailable/index.tsx src/features/home/components/molecules/PathAvailable.tsx
git mv src/components/Services/index.tsx src/features/home/components/molecules/ServiceItem.tsx
git mv src/components/SwordvoicesCard/index.tsx src/features/home/components/molecules/SwordvoicesCard.tsx
git mv src/components/SwordVoicesCarousel/index.tsx src/features/home/components/organisms/SwordVoicesCarousel.tsx
git mv src/constants/animations/navAnimation.ts src/common/constants/animations/navAnimation.ts
git mv src/constants/animations/homeAnimation.ts src/constants/animations/servicesAnimation.ts \
  src/constants/animations/whatIsSwordvoiceAnimation.ts src/constants/animations/ourSwordvoicesAnimation.ts \
  src/constants/animations/ourPathAnimation.ts src/features/home/constants/animations/
git mv src/constants/routes.ts src/common/constants/routes.ts
git mv src/constants/site.ts src/common/constants/site.ts
git mv src/constants/paths.ts src/features/home/constants/paths.ts
git mv src/constants/services.ts src/features/home/constants/services.ts
git mv src/constants/swordvoices.tsx src/features/home/constants/swordvoices.ts
git mv src/app/hooks/useIsMobile.tsx src/common/hooks/useIsMobile.ts
git mv src/app/hooks/useBackToTopButton.tsx src/features/home/hooks/useBackToTopButton.ts
```

`src/app/hooks/api/useSendEmailOfContact.tsx` and `src/app/service/sendEmailService.ts` stay until Task 5 deletes them. Note: `useBackToTopButton` is only used by home, so per the promotion rule it lives in `features/home`, not `common` (spec §8 table listed `common/hooks`; §3 promotion rule wins).

- [ ] **Step 2: Tailwind must scan the new folders** (otherwise every class in moved files disappears)

```ts
// tailwind.config.ts — content
content: [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/common/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
],
```

- [ ] **Step 3: Convert default exports to named and fix imports**

Apply exactly these edits:

- `common/constants/routes.ts`: `export const routes = { ... };` (remove default export; fix indentation).
- `common/constants/site.ts`: `export const SITE_URL = "https://swordvoice.com";`
- `features/home/constants/paths.ts`, `services.ts`, `swordvoices.ts`: `export const paths = [...]` / `export const services = [...]` / `export const swordvoices = [...]`; icon imports become `@/common/assets/icons/<Name>`.
- `common/components/atoms/Button.tsx`:

```tsx
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & { label: string };

export function Button({ label, ...buttonProps }: ButtonProps) {
  return (
    <button
      className="w-max px-8 mt-4 py-2 rounded-full bg-black font-bold text-base text-primary border-2 border-white"
      {...buttonProps}
    >
      {label}
    </button>
  );
}
```

- `Input.tsx`, `Textarea.tsx`: `export function Input(...)` / `export function Textarea(...)` with `type InputProps`/`type TextareaProps` (rename from `IProps`), import `{ Typography } from "@/common/components/atoms/Typography"`. Body unchanged.
- `Typography.tsx`: already named; rename `interface Props` → `type TypographyProps`; fix class join to `` `${sizeClasses} ${className ?? ""}` ``.
- `common/hooks/useIsMobile.ts`: `export function useIsMobile(): boolean { ... }` (same body, double quotes).
- `features/home/hooks/useBackToTopButton.ts`: unchanged body, keep `export const useBackToTopButton`.
- `molecules/ServiceItem.tsx`: rename component `Services` → `ServiceItem`, type `ServiceItemProps`, named export, Typography import from `@/common/components/atoms/Typography`.
- `molecules/PathAvailable.tsx`: named export; imports `@/common/hooks/useIsMobile`, `@/common/components/atoms/Typography`, `@/features/home/constants/animations/ourPathAnimation`; replace `Icon: any` with `Icon: ComponentType<{ width?: number }>` (import `type ComponentType` from react).
- `molecules/SwordvoicesCard.tsx`: named export; icons from `@/common/assets/icons/*`; Typography from common; `photo: any` → `photo: string`; drop unused `StaticImageData` import.
- `organisms/SwordVoicesCarousel.tsx`: rename to `export function SwordVoicesCarousel()`; import `{ SwordvoicesCard } from "@/features/home/components/molecules/SwordvoicesCard"` and `{ swordvoices } from "@/features/home/constants/swordvoices"`; remove the unused `useRef`/`ref={slider}`.
- `app/sitemap.ts`, `app/robots.ts`: `import { SITE_URL } from "@/common/constants/site";`
- `app/layout.tsx`: font `src: "../common/assets/font/SedgwickAve-Regular.ttf"`.

- [ ] **Step 4: Split Navbar (it exceeds 150 lines) and remove the `@ts-ignore`**

```ts
// src/common/constants/navLinks.ts
import { routes } from "@/common/constants/routes";

export type NavItem = { label: string; href: string };

export const navLinks: NavItem[] = [
  { href: routes.SERVICES, label: "Servicios" },
  { href: routes.MEET_US, label: "Conócenos" },
  { href: routes.OUR_PATHS, label: "Nuestro path" },
  { href: routes.CONTACT_US, label: "Contáctanos" },
];

export const mobileNavLinks: NavItem[] = [
  { href: routes.HOME, label: "Home" },
  ...navLinks,
];
```

```tsx
// src/common/components/molecules/NavLink.tsx
import type { MouseEvent } from "react";
import { Typography } from "@/common/components/atoms/Typography";
import type { NavItem } from "@/common/constants/navLinks";

type NavLinkProps = {
  item: NavItem;
  variant: "h5" | "h6";
  className: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function NavLink({ item, variant, className, onNavigate }: NavLinkProps) {
  return (
    <a
      href={item.href}
      className="no-underline"
      onClick={(event) => onNavigate(event, item.href)}
    >
      <Typography variant={variant} className={className}>
        {item.label}
      </Typography>
    </a>
  );
}
```

In `Navbar.tsx`:
- Signature `export function Navbar({ changeLogo }: NavbarProps)` with `type NavbarProps = { changeLogo: boolean }`; replace `changeLogo.changeLogo` with `changeLogo`.
- Delete local `INavItem`, `links`, `linksResponsive`; import `navLinks`, `mobileNavLinks` from `@/common/constants/navLinks`, `NavLink` from molecules, `navAnimation` from `@/common/constants/animations/navAnimation`, `useIsMobile` from `@/common/hooks/useIsMobile`, icons from `@/common/assets/icons/*`.
- Replace the two `.map(... <a> <Typography> ...)` blocks with:

```tsx
{navLinks.map((link) => (
  <NavLink
    key={link.href}
    item={link}
    variant="h6"
    className="font-medium text-white no-underline font-sedgwick hover:text-primary"
    onNavigate={handleClick}
  />
))}
```

and (mobile)

```tsx
{mobileNavLinks.map((link) => (
  <NavLink
    key={link.href}
    item={link}
    variant="h5"
    className="font-medium text-white no-underline font-sedgwick my-4 hover:text-primary"
    onNavigate={handleClick}
  />
))}
```

- Replace the scroll computation in `handleClick`:

```ts
const handleClick = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
  event.preventDefault();
  if (isMobile) {
    setShowMenu(false);
  }
  const target = document.querySelector<HTMLElement>(
    anchor === "/" ? "#home" : anchor.slice(1),
  );
  if (!target) return;
  const navbarOffset = isMobile ? 110 : 85;
  window.scrollTo({ top: target.offsetTop - navbarOffset, behavior: "smooth" });
};
```

- [ ] **Step 5: Update `src/app/page.tsx` imports** (content otherwise unchanged)

```tsx
import Logo from "@/common/assets/icons/Logo";
import { Button } from "@/common/components/atoms/Button";
import { Navbar } from "@/common/components/organisms/Navbar";
import { PathAvailable } from "@/features/home/components/molecules/PathAvailable";
import { ServiceItem } from "@/features/home/components/molecules/ServiceItem";
import { services } from "@/features/home/constants/services";
import { paths } from "@/features/home/constants/paths";
import { Typography } from "@/common/components/atoms/Typography";
import World from "@/common/assets/icons/World";
import { Input } from "@/common/components/atoms/Input";
import { Textarea } from "@/common/components/atoms/Textarea";
import { homeAnimation } from "@/features/home/constants/animations/homeAnimation";
import { servicesAnimation } from "@/features/home/constants/animations/servicesAnimation";
import { SwordVoicesCarousel } from "@/features/home/components/organisms/SwordVoicesCarousel";
import HouseIcon from "@/common/assets/icons/HouseIcon";
import { useBackToTopButton } from "@/features/home/hooks/useBackToTopButton";
import { whatIsSwordvoiceAnimation } from "@/features/home/constants/animations/whatIsSwordvoiceAnimation";
import { ourSwordvoicesAnimation } from "@/features/home/constants/animations/ourSwordvoicesAnimation";
import { ourPathAnimation } from "@/features/home/constants/animations/ourPathAnimation";
import { routes } from "@/common/constants/routes";
```

Remove the unused `InstagramIcon`/`WorldIcon` imports. Replace `<Services ...` with `<ServiceItem ...` and `icon={<Icon className={""} />}` with `icon={<Icon />}`.

- [ ] **Step 6: Verify nothing still points to old paths**

Run: `git grep -nE "@/(components|constants|assets)/|@/app/hooks/(useIsMobile|useBackToTopButton)" -- src` 
Expected: no output.
Run: `rmdir src/components/* src/components src/constants/animations src/constants 2>/dev/null; pnpm typecheck && pnpm test && pnpm build`
Expected: all green.
Run: `pnpm dev`, open http://localhost:3000 and compare every section with production (https://swordvoice.com): backgrounds, fonts, navbar logo swap on scroll, carousel, paths, contact form styles.

- [ ] **Step 7: Commit**

```bash
git add -A src tailwind.config.ts
git commit -m "refactor: :truck: move shared code to common and home code to features" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Contact flow end-to-end (canonical reference)

**Files:**
- Create: `src/features/home/schemas/contact.schema.ts` (+`.test.ts`), `src/features/home/server/deliverContactEmail.ts` (+`.test.ts`), `src/features/home/server/index.ts`, `src/features/home/services/contactService.ts` (+`.test.ts`), `src/features/home/hooks/useSendContactEmail.ts`, `src/features/home/hooks/useContactForm.ts`, `src/features/home/components/organisms/ContactForm.tsx` (+`.test.tsx`), `src/common/components/organisms/Providers.tsx`, `src/app/api/sendEmail/route.test.ts`
- Modify: `src/app/api/sendEmail/route.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/common/components/atoms/{Input,Textarea,Typography}.tsx`, `package.json`
- Delete: `src/app/hooks/`, `src/app/service/`

**Interfaces:**
- Consumes: `request`, `ApiError`, `notifyError`, `escapeHtml`, `getServerEnv`, `makeQueryClient`, `renderWithClient` (Tasks 2–3).
- Produces:
  - `contactSchema` (zod object `{ name, email, message }`), `type ContactFormValues`, `contactResponseSchema = z.object({ ok: z.literal(true) })`
  - `POST /api/sendEmail` body `ContactFormValues` → `200 { ok: true }` | `400 { message: "Datos inválidos" }` | `500 { message: "No se pudo enviar el mensaje" }`
  - `deliverContactEmail(values: ContactFormValues): Promise<void>`, `buildContactEmailHtml(values: ContactFormValues): string`, `CONTACT_EMAIL_SUBJECT`
  - `@/features/home/server` exports `{ contactSchema, deliverContactEmail }`
  - `sendContactEmail(values): Promise<{ ok: true }>`, `CONTACT_ENDPOINT = "/api/sendEmail"`
  - `useSendContactEmail()` (useMutation), `useContactForm(): { register, errors, onSubmit, isSubmitting }`
  - `ContactForm()`; `Providers({ children })`
  - `Input`/`Textarea`: native element props + `{ label: string; error?: string }`; `Typography` gains `htmlFor?`, `id?`

- [ ] **Step 1: Failing schema test**

```ts
// src/features/home/schemas/contact.schema.test.ts
import { describe, expect, it } from "vitest";
import { contactSchema } from "@/features/home/schemas/contact.schema";

const valid = { name: "Ana Pérez", email: "ana@mail.com", message: "Hola" };

function firstMessage(input: unknown) {
  const result = contactSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0].message;
}

describe("contactSchema", () => {
  it("accepts and trims valid data", () => {
    expect(
      contactSchema.parse({ name: "  Ana Pérez ", email: " ana@mail.com ", message: " Hola " }),
    ).toEqual(valid);
  });

  it("rejects a whitespace-only name", () => {
    expect(firstMessage({ ...valid, name: "   " })).toBe("Ingresa tu nombre y apellido");
  });

  it("rejects an invalid email", () => {
    expect(firstMessage({ ...valid, email: "ana@" })).toBe(
      "Ingresa un correo electrónico válido",
    );
  });

  it("rejects an empty message", () => {
    expect(firstMessage({ ...valid, message: "" })).toBe("Escribe un mensaje");
  });

  it("rejects messages over 2000 characters", () => {
    expect(firstMessage({ ...valid, message: "a".repeat(2001) })).toBe(
      "El mensaje no puede superar 2000 caracteres",
    );
  });

  it("rejects names over 120 characters", () => {
    expect(firstMessage({ ...valid, name: "a".repeat(121) })).toBe(
      "El nombre no puede superar 120 caracteres",
    );
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm test src/features/home/schemas` → cannot resolve module.

- [ ] **Step 3: Implement schema**

```ts
// src/features/home/schemas/contact.schema.ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresa tu nombre y apellido")
    .max(120, "El nombre no puede superar 120 caracteres"),
  email: z.string().trim().pipe(z.email("Ingresa un correo electrónico válido")),
  message: z
    .string()
    .trim()
    .min(1, "Escribe un mensaje")
    .max(2000, "El mensaje no puede superar 2000 caracteres"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const contactResponseSchema = z.object({ ok: z.literal(true) });
```

- [ ] **Step 4: Run, expect PASS** — `pnpm test src/features/home/schemas`.

- [ ] **Step 5: Failing server tests**

```ts
// src/features/home/server/deliverContactEmail.test.ts
// @vitest-environment node
import nodemailer from "nodemailer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildContactEmailHtml,
  CONTACT_EMAIL_SUBJECT,
  deliverContactEmail,
} from "@/features/home/server/deliverContactEmail";

vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn() } }));

const values = { name: "Ana", email: "ana@mail.com", message: "Hola" };
const sendMail = vi.fn();

beforeEach(() => {
  vi.stubEnv("EMAIL_TO_SEND_EMAIL", "bot@swordvoice.com");
  vi.stubEnv("PASSWORD_TO_SEND_EMAIL", "pw");
  vi.stubEnv("EMAILS_MENTORS", "mentors@swordvoice.com");
  sendMail.mockReset();
  vi.mocked(nodemailer.createTransport).mockReturnValue(
    { sendMail } as unknown as ReturnType<typeof nodemailer.createTransport>,
  );
});

describe("buildContactEmailHtml", () => {
  it("escapes user input", () => {
    const html = buildContactEmailHtml({
      name: "<b>Ana</b>",
      email: "ana@mail.com",
      message: "<script>alert(1)</script>",
    });
    expect(html).toContain("&lt;b&gt;Ana&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
});

describe("deliverContactEmail", () => {
  it("sends the email to the mentors", async () => {
    sendMail.mockResolvedValue({});
    await deliverContactEmail(values);
    expect(sendMail).toHaveBeenCalledWith({
      from: { name: "Ana", address: "ana@mail.com" },
      to: "mentors@swordvoice.com",
      subject: CONTACT_EMAIL_SUBJECT,
      html: buildContactEmailHtml(values),
    });
  });

  it("propagates SMTP failures", async () => {
    sendMail.mockRejectedValue(new Error("SMTP down"));
    await expect(deliverContactEmail(values)).rejects.toThrow("SMTP down");
  });

  it("fails when env is missing", async () => {
    vi.stubEnv("EMAILS_MENTORS", "");
    await expect(deliverContactEmail(values)).rejects.toThrow(/EMAILS_MENTORS/);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
```

```ts
// src/app/api/sendEmail/route.test.ts
// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deliverContactEmail } from "@/features/home/server";
import { POST } from "@/app/api/sendEmail/route";

vi.mock("@/features/home/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/home/server")>()),
  deliverContactEmail: vi.fn(),
}));

const valid = { name: "Ana", email: "ana@mail.com", message: "Hola" };

function post(body: string) {
  return POST(new Request("http://localhost/api/sendEmail", { method: "POST", body }));
}

beforeEach(() => {
  vi.mocked(deliverContactEmail).mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/sendEmail", () => {
  it("returns 400 for a non-JSON body", async () => {
    const res = await post("not json");
    expect(res.status).toBe(400);
    expect(deliverContactEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for missing fields", async () => {
    const res = await post(JSON.stringify({ name: "Ana" }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Datos inválidos" });
    expect(deliverContactEmail).not.toHaveBeenCalled();
  });

  it("returns 400 for an oversized message", async () => {
    const res = await post(JSON.stringify({ ...valid, message: "a".repeat(10_000) }));
    expect(res.status).toBe(400);
    expect(deliverContactEmail).not.toHaveBeenCalled();
  });

  it("delivers trimmed data and returns 200", async () => {
    vi.mocked(deliverContactEmail).mockResolvedValue();
    const res = await post(JSON.stringify({ ...valid, name: " Ana " }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(deliverContactEmail).toHaveBeenCalledWith(valid);
  });

  it("returns a generic 500 when delivery fails", async () => {
    vi.mocked(deliverContactEmail).mockRejectedValue(new Error("SMTP password wrong"));
    const res = await post(JSON.stringify(valid));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ message: "No se pudo enviar el mensaje" });
  });
});
```

- [ ] **Step 6: Run, expect FAIL** — `pnpm test src/features/home/server src/app` → module not found / route lacks validation.

- [ ] **Step 7: Implement server + route**

```ts
// src/features/home/server/deliverContactEmail.ts
import "server-only";
import nodemailer from "nodemailer";
import { getServerEnv } from "@/common/config/env";
import { escapeHtml } from "@/common/utils/escapeHtml";
import type { ContactFormValues } from "@/features/home/schemas/contact.schema";

export const CONTACT_EMAIL_SUBJECT = "NUEVO MENTORIADO";

export function buildContactEmailHtml({ name, email, message }: ContactFormValues): string {
  return `
    <p>Name and Email: ${escapeHtml(name)} ${escapeHtml(email)}</p>
    <p>Message: ${escapeHtml(message)}</p>
  `;
}

export async function deliverContactEmail(values: ContactFormValues): Promise<void> {
  const env = getServerEnv();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: env.EMAIL_TO_SEND_EMAIL, pass: env.PASSWORD_TO_SEND_EMAIL },
  });

  await transporter.sendMail({
    from: { name: values.name, address: values.email },
    to: env.EMAILS_MENTORS,
    subject: CONTACT_EMAIL_SUBJECT,
    html: buildContactEmailHtml(values),
  });
}
```

```ts
// src/features/home/server/index.ts
export { contactSchema } from "@/features/home/schemas/contact.schema";
export { deliverContactEmail } from "@/features/home/server/deliverContactEmail";
```

```ts
// src/app/api/sendEmail/route.ts
import { contactSchema, deliverContactEmail } from "@/features/home/server";

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Datos inválidos" }, { status: 400 });
  }

  try {
    await deliverContactEmail(parsed.data);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("sendEmail failed", error);
    return Response.json({ message: "No se pudo enviar el mensaje" }, { status: 500 });
  }
}
```

- [ ] **Step 8: Run, expect PASS** — `pnpm test`.

- [ ] **Step 9: Failing client tests**

```ts
// src/features/home/services/contactService.test.ts
import { describe, expect, it, vi } from "vitest";
import { CONTACT_ENDPOINT, sendContactEmail } from "@/features/home/services/contactService";

describe("sendContactEmail", () => {
  it("posts the form values to the contact endpoint", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ ok: true }));
    const values = { name: "Ana", email: "ana@mail.com", message: "Hola" };

    await expect(sendContactEmail(values)).resolves.toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledWith(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
  });
});
```

```tsx
// src/features/home/components/organisms/ContactForm.test.tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/features/home/components/organisms/ContactForm";
import { renderWithClient } from "../../../../../test/renderWithClient";

vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nombre y Apellido"), "Ana Pérez");
  await user.type(screen.getByLabelText("Correo electrónico"), "ana@mail.com");
  await user.type(screen.getByLabelText("Mensaje"), "Quiero una mentoría");
  return user;
}

describe("ContactForm", () => {
  it("shows validation errors and does not submit when empty", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderWithClient(<ContactForm />);

    await userEvent.click(screen.getByRole("button", { name: "ENVIAR" }));

    expect(await screen.findByText("Ingresa tu nombre y apellido")).toBeInTheDocument();
    expect(screen.getByText("Ingresa un correo electrónico válido")).toBeInTheDocument();
    expect(screen.getByText("Escribe un mensaje")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre y Apellido")).toHaveAttribute("aria-invalid", "true");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the message, notifies success and resets the form", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ ok: true }));
    renderWithClient(<ContactForm />);
    const user = await fillForm();

    await user.click(screen.getByRole("button", { name: "ENVIAR" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Envío exitoso"));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toEqual({
      name: "Ana Pérez",
      email: "ana@mail.com",
      message: "Quiero una mentoría",
    });
    expect(screen.getByLabelText("Nombre y Apellido")).toHaveValue("");
  });

  it("shows the server error and keeps the values when sending fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ message: "No se pudo enviar el mensaje" }, { status: 500 }),
    );
    renderWithClient(<ContactForm />);
    const user = await fillForm();

    await user.click(screen.getByRole("button", { name: "ENVIAR" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("No se pudo enviar el mensaje"),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nombre y Apellido")).toHaveValue("Ana Pérez");
  });

  it("disables the submit button while sending", async () => {
    let resolve: (response: Response) => void = () => {};
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
    renderWithClient(<ContactForm />);
    const user = await fillForm();
    const button = screen.getByRole("button", { name: "ENVIAR" });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    await user.click(button);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    resolve(Response.json({ ok: true }));
    await waitFor(() => expect(button).toBeEnabled());
  });
});
```

(`renderWithClient` lives outside `src`, so it is imported relatively; that is the only allowed relative import.)

- [ ] **Step 10: Run, expect FAIL** — modules missing.

- [ ] **Step 11: Implement client side**

```ts
// src/features/home/services/contactService.ts
import { request } from "@/common/api/httpClient";
import {
  contactResponseSchema,
  type ContactFormValues,
} from "@/features/home/schemas/contact.schema";

export const CONTACT_ENDPOINT = "/api/sendEmail";

export function sendContactEmail(values: ContactFormValues) {
  return request(CONTACT_ENDPOINT, {
    method: "POST",
    body: values,
    schema: contactResponseSchema,
  });
}
```

```ts
// src/features/home/hooks/useSendContactEmail.ts
import { useMutation } from "@tanstack/react-query";
import { sendContactEmail } from "@/features/home/services/contactService";

export function useSendContactEmail() {
  return useMutation({ mutationFn: sendContactEmail });
}
```

```ts
// src/features/home/hooks/useContactForm.ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { notifyError } from "@/common/errors/notifyError";
import { useSendContactEmail } from "@/features/home/hooks/useSendContactEmail";
import {
  contactSchema,
  type ContactFormValues,
} from "@/features/home/schemas/contact.schema";

const defaultValues: ContactFormValues = { name: "", email: "", message: "" };

export function useContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({ defaultValues, resolver: zodResolver(contactSchema) });
  const { mutate, isPending } = useSendContactEmail();

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Envío exitoso");
        reset();
      },
      onError: notifyError,
    });
  });

  return { register, errors, onSubmit, isSubmitting: isPending };
}
```

Atoms — `Typography.tsx`: add `htmlFor?: string; id?: string;` to `TypographyProps`, destructure them and render `<Tag id={id} htmlFor={htmlFor} className={...}>`.

```tsx
// src/common/components/atoms/Input.tsx
import { useId, type ComponentPropsWithRef } from "react";
import { Typography } from "@/common/components/atoms/Typography";

type InputProps = Omit<ComponentPropsWithRef<"input">, "className"> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, ...inputProps }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" htmlFor={inputId} className="mb-3">
        {label}
      </Typography>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full p-3 rounded text-black ${error ? "border-red-600 border-2" : ""}`}
        {...inputProps}
      />
      {error && (
        <Typography as="span" variant="small" id={errorId} className="mt-1 text-red-400">
          {error}
        </Typography>
      )}
    </div>
  );
}
```

```tsx
// src/common/components/atoms/Textarea.tsx
import { useId, type ComponentPropsWithRef } from "react";
import { Typography } from "@/common/components/atoms/Typography";

type TextareaProps = Omit<ComponentPropsWithRef<"textarea">, "className"> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, id, ...textareaProps }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" htmlFor={textareaId} className="mb-3">
        {label}
      </Typography>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full p-3 rounded text-black resize-none h-[150px] ${
          error ? "border-red-600 border-2" : ""
        }`}
        {...textareaProps}
      />
      {error && (
        <Typography as="span" variant="small" id={errorId} className="mt-1 text-red-400">
          {error}
        </Typography>
      )}
    </div>
  );
}
```

```tsx
// src/features/home/components/organisms/ContactForm.tsx
"use client";
import Logo from "@/common/assets/icons/Logo";
import { Input } from "@/common/components/atoms/Input";
import { Textarea } from "@/common/components/atoms/Textarea";
import { useContactForm } from "@/features/home/hooks/useContactForm";

export function ContactForm() {
  const { register, errors, onSubmit, isSubmitting } = useContactForm();

  return (
    <form
      noValidate
      className="flex items-center flex-col mb-8 md:mb-0 z-20"
      onSubmit={onSubmit}
    >
      <div className="mb-8 flex justify-center">
        <Logo className="w-[80%] md:w-auto" />
      </div>
      <Input
        label="Nombre y Apellido"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Textarea label="Mensaje" error={errors.message?.message} {...register("message")} />
      <div className="w-full flex justify-end max-w-md mt-2">
        <button className="text-primary font-bold" type="submit" disabled={isSubmitting}>
          ENVIAR
        </button>
      </div>
    </form>
  );
}
```

```tsx
// src/common/components/organisms/Providers.tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { makeQueryClient } from "@/common/api/queryClient";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      {children}
    </QueryClientProvider>
  );
}
```

`src/app/layout.tsx`: remove the `Toaster` import; import `{ Providers } from "@/common/components/organisms/Providers"`; body becomes `<body className={...}><Providers>{children}</Providers></body>`.

`src/app/page.tsx`:
- Delete: the `yup` schema, imports of `useForm/Controller/SubmitHandler`, `toast`, `useSendEmailOfContact`, `yupResolver`, `yup`, `Input`, `Textarea`, `Logo`; the `useForm(...)` call, the `useSendEmailOfContact()` call and `onSubmit`.
- Replace the whole `<form ...> ... </form>` element with `<ContactForm />` and import `{ ContactForm } from "@/features/home/components/organisms/ContactForm"`.

Delete old code and yup:

```bash
git rm -r src/app/hooks src/app/service
pnpm remove yup
```

- [ ] **Step 12: Verify**

Run: `pnpm test && pnpm typecheck && pnpm build`
Expected: all green; `git grep -n "yup" -- src package.json` → no output.
Manual: `pnpm dev` with a valid `.env.local` → submit empty (Spanish messages under fields), submit valid (success toast, fields reset, email received), set `PASSWORD_TO_SEND_EMAIL=wrong` and restart → error toast "No se pudo enviar el mensaje", values kept.

- [ ] **Step 13: Commit**

```bash
git add -A src package.json pnpm-lock.yaml
git commit -m "feat: :sparkles: rebuild contact flow with zod, tanstack query and validated api route" -m "Fixes: endpoint always returned 200, client ignored non-2xx, user input was not escaped in the email." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Split the landing into `features/home` organisms

**Files:**
- Create: `src/features/home/index.ts`, `HomePage.tsx`, `constants/sections.ts`, `utils/scrollToTop.ts`, `hooks/useIsPastSection.ts` (+`.test.ts`), `hooks/useScrollToTopOnMount.ts`, `components/atoms/SectionDivider.tsx`, `components/organisms/{HomeNavbar,HeroSection,ServicesSection,AboutSection,SwordvoicesSection,PathsSection,ContactSection,BackToTopButton}.tsx`, `src/app/error.tsx`
- Modify: `src/app/page.tsx`, `src/features/home/constants/paths.ts`
- Delete: `src/features/home/hooks/useBackToTopButton.ts`

**Interfaces:**
- Consumes: everything from Task 4 and `ContactForm` (Task 5).
- Produces: `HomePage()` exported from `@/features/home`; `useIsPastSection(sectionId: string): boolean`; `scrollToTop(): void`; `SERVICES_SECTION_ID = "services"`; `availablePaths`, `upcomingPaths`.

- [ ] **Step 1: Failing hook test**

```ts
// src/features/home/hooks/useIsPastSection.test.ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useIsPastSection } from "@/features/home/hooks/useIsPastSection";

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

beforeEach(() => {
  const section = document.createElement("div");
  section.id = "services";
  Object.defineProperty(section, "offsetTop", { value: 500 });
  document.body.appendChild(section);
});

afterEach(() => {
  document.getElementById("services")?.remove();
});

describe("useIsPastSection", () => {
  it("is false before scrolling", () => {
    const { result } = renderHook(() => useIsPastSection("services"));
    expect(result.current).toBe(false);
  });

  it("turns true once the navbar passes the section top and back to false", () => {
    const { result } = renderHook(() => useIsPastSection("services"));
    scrollTo(450);
    expect(result.current).toBe(true);
    scrollTo(300);
    expect(result.current).toBe(false);
  });

  it("stays false when the section does not exist", () => {
    const { result } = renderHook(() => useIsPastSection("missing"));
    scrollTo(5000);
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — module not found.

- [ ] **Step 3: Implement hooks, utils, constants**

```ts
// src/features/home/hooks/useIsPastSection.ts
import { useEffect, useState } from "react";

const NAVBAR_HEIGHT = 85;

export function useIsPastSection(sectionId: string): boolean {
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const check = () => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      setIsPast(window.scrollY + NAVBAR_HEIGHT > section.offsetTop);
    };
    window.addEventListener("scroll", check);
    return () => window.removeEventListener("scroll", check);
  }, [sectionId]);

  return isPast;
}
```

```ts
// src/features/home/utils/scrollToTop.ts
export function scrollToTop(): void {
  window.scroll({ top: 0, left: 0, behavior: "smooth" });
}
```

```ts
// src/features/home/hooks/useScrollToTopOnMount.ts
import { useEffect } from "react";
import { scrollToTop } from "@/features/home/utils/scrollToTop";

export function useScrollToTopOnMount(): void {
  useEffect(() => {
    scrollToTop();
  }, []);
}
```

```ts
// src/features/home/constants/sections.ts
export const SERVICES_SECTION_ID = "services";
```

Append to `src/features/home/constants/paths.ts`:

```ts
export const availablePaths = paths.filter(({ isAvailable }) => isAvailable);
export const upcomingPaths = paths.filter(({ isAvailable }) => !isAvailable);
```

and type the array so `Icon` is optional for upcoming paths:

```ts
import type { ComponentType } from "react";

type Path = {
  name: string;
  description: string;
  Icon?: ComponentType<{ width?: number }>;
  isAvailable: boolean;
};

export const paths: Path[] = [ /* same entries; delete `Icon: ""` lines */ ];
```

(`PathAvailable` keeps a required `Icon`; `PathsSection` only renders available paths, which all have one — guard with `Icon &&` in the map, see Step 5.)

- [ ] **Step 4: Run, expect PASS** — `pnpm test src/features/home/hooks`.

- [ ] **Step 5: Create organisms by moving JSX verbatim from `src/app/page.tsx`**

Each section file starts with `"use client";` if it uses `motion`, imports exactly what its JSX uses (alias paths from Task 4), and exports a named function returning the JSX block delimited by the page's comments:

| File | JSX block from `page.tsx` | Changes inside the block |
|---|---|---|
| `HeroSection.tsx` (client) | `{/* First page */}` `<motion.div id="home" …>…</motion.div>` | call `useScrollToTopOnMount();` at top of the component |
| `ServicesSection.tsx` (client) | `{/* Second Page */}` `<motion.div id="services" …>` | remove `ref={elementWhereButtonAppears}`; `id={SERVICES_SECTION_ID}` |
| `AboutSection.tsx` (client) | `{/* Third Page */}` `<div id="meet-us" …>` | none |
| `SwordvoicesSection.tsx` (client) | `{/* Fourth Page */}` `<motion.div className="h-auto xl:min-h-screen bg-ourSwordVoices …">` | none |
| `PathsSection.tsx` (client) | `{/* Fifth Page */}` `<div id="our_paths" …>` | `pathAvailables` → `availablePaths`, `pathNotAvailables` → `upcomingPaths`; available map renders `Icon && <PathAvailable … Icon={Icon} />` |
| `ContactSection.tsx` (server) | `{/* Footer */}` `<div id="contact_us" …>` | already contains `<ContactForm />`; delete the commented-out Instagram/World links block (dead code) |

```tsx
// src/features/home/components/atoms/SectionDivider.tsx
type SectionDividerProps = { className?: string };

export function SectionDivider({ className = "" }: SectionDividerProps) {
  return <div className={`h-[58px] bg-[black] w-full ${className}`} />;
}
```

```tsx
// src/features/home/components/organisms/HomeNavbar.tsx
"use client";
import { Navbar } from "@/common/components/organisms/Navbar";
import { SERVICES_SECTION_ID } from "@/features/home/constants/sections";
import { useIsPastSection } from "@/features/home/hooks/useIsPastSection";

export function HomeNavbar() {
  const isPastServices = useIsPastSection(SERVICES_SECTION_ID);
  return <Navbar changeLogo={isPastServices} />;
}
```

```tsx
// src/features/home/components/organisms/BackToTopButton.tsx
"use client";
import HouseIcon from "@/common/assets/icons/HouseIcon";
import { SERVICES_SECTION_ID } from "@/features/home/constants/sections";
import { useIsPastSection } from "@/features/home/hooks/useIsPastSection";
import { scrollToTop } from "@/features/home/utils/scrollToTop";

export function BackToTopButton() {
  const isVisible = useIsPastSection(SERVICES_SECTION_ID);

  return (
    <div className="fixed bottom-0 right-5 mb-10 mr-4 z-30">
      {isVisible && (
        <button type="button" onClick={scrollToTop} aria-label="Volver al inicio">
          <HouseIcon />
        </button>
      )}
    </div>
  );
}
```

```tsx
// src/features/home/HomePage.tsx
import { SectionDivider } from "@/features/home/components/atoms/SectionDivider";
import { AboutSection } from "@/features/home/components/organisms/AboutSection";
import { BackToTopButton } from "@/features/home/components/organisms/BackToTopButton";
import { ContactSection } from "@/features/home/components/organisms/ContactSection";
import { HeroSection } from "@/features/home/components/organisms/HeroSection";
import { HomeNavbar } from "@/features/home/components/organisms/HomeNavbar";
import { PathsSection } from "@/features/home/components/organisms/PathsSection";
import { ServicesSection } from "@/features/home/components/organisms/ServicesSection";
import { SwordvoicesSection } from "@/features/home/components/organisms/SwordvoicesSection";

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HomeNavbar />
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

```ts
// src/features/home/index.ts
export { HomePage } from "@/features/home/HomePage";
```

```tsx
// src/app/page.tsx (entire file)
import { HomePage } from "@/features/home";

export default function Page() {
  return <HomePage />;
}
```

```tsx
// src/app/error.tsx
"use client";
import { Button } from "@/common/components/atoms/Button";
import { Typography } from "@/common/components/atoms/Typography";

type ErrorPageProps = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <Typography variant="h3">Algo salió mal</Typography>
      <Button type="button" label="Reintentar" onClick={reset} />
    </main>
  );
}
```

```bash
git rm src/features/home/hooks/useBackToTopButton.ts
```

- [ ] **Step 6: Verify**

Run: `pnpm test && pnpm typecheck && pnpm build`
Expected: green; build output lists `/` as static (○) since `page.tsx` is now a server component.
Manual (`pnpm dev`): page identical to Task 4 check; logo swaps and house button appears after scrolling past "¿Qué incluye nuestro servicio?"; house button scrolls to top; navbar anchors scroll to each section; contact form works.

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "refactor: :recycle: split landing into home feature organisms" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: ESLint enforcement

**Files:**
- Modify: `.eslintrc.json`, `src/common/assets/icons/{Hamburguer,UsersIcon,Logo,LogoSwordvoice}.tsx`, any file the new rules flag

**Interfaces:**
- Produces: `pnpm lint` fails on: cross-feature imports, `common` → `features`, deep imports into a feature (only `index.ts` / `server/index.ts`), `server/` imports outside `src/app/api`, `yup`, global `fetch` outside `common/api` and `features/*/server`, `process.env` outside `common/config/env.ts`, `any`, `@ts-ignore`.

- [ ] **Step 1: Write `.eslintrc.json`**

```json
{
  "root": true,
  "extends": ["next/core-web-vitals", "next/typescript"],
  "plugins": ["boundaries"],
  "settings": {
    "import/resolver": {
      "typescript": { "alwaysTryTypes": true, "project": "./tsconfig.json" }
    },
    "boundaries/include": ["src/**/*"],
    "boundaries/elements": [
      { "type": "app", "pattern": "src/app", "mode": "folder" },
      { "type": "feature", "pattern": "src/features/*", "mode": "folder", "capture": ["feature"] },
      { "type": "common", "pattern": "src/common", "mode": "folder" }
    ]
  },
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          { "from": "app", "allow": ["app", "feature", "common"] },
          { "from": "feature", "allow": [["feature", { "feature": "${from.feature}" }], "common"] },
          { "from": "common", "allow": ["common"] }
        ]
      }
    ],
    "boundaries/entry-point": [
      "error",
      {
        "default": "disallow",
        "rules": [
          { "target": ["app", "common"], "allow": "**" },
          { "target": ["feature"], "allow": ["index.ts", "server/index.ts"] }
        ]
      }
    ],
    "no-restricted-imports": [
      "error",
      { "paths": [{ "name": "yup", "message": "Usa zod (docs/architecture/conventions.md §4.3)." }] }
    ],
    "no-restricted-globals": [
      "error",
      { "name": "fetch", "message": "Usa request() de @/common/api/httpClient (conventions §4.4)." }
    ],
    "no-restricted-properties": [
      "error",
      { "object": "process", "property": "env", "message": "Usa getServerEnv() de @/common/config/env (conventions §4.6)." }
    ]
  },
  "overrides": [
    {
      "files": ["src/**/*.ts", "src/**/*.tsx"],
      "excludedFiles": ["src/app/api/**", "src/features/*/server/**", "**/*.test.ts", "**/*.test.tsx"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "paths": [{ "name": "yup", "message": "Usa zod (docs/architecture/conventions.md §4.3)." }],
            "patterns": [
              {
                "group": ["@/features/*/server", "@/features/*/server/*"],
                "message": "server/ solo se importa desde src/app/api (conventions §3)."
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["src/common/api/**", "src/features/*/server/**"],
      "rules": { "no-restricted-globals": "off" }
    },
    {
      "files": ["src/common/config/env.ts"],
      "rules": { "no-restricted-properties": "off" }
    }
  ]
}
```

Note: imports between files of the same feature (e.g. `HomePage.tsx` → `@/features/home/components/...`) are internal to the element and are not checked by `entry-point`.

- [ ] **Step 2: Run and fix existing violations**

Run: `pnpm lint`
Expected violations and their fixes:
- `Hamburguer.tsx`, `UsersIcon.tsx`: `(props: any)` → `(props: SVGProps<SVGSVGElement>)` with `import type { SVGProps } from "react";`.
- `Logo.tsx`, `LogoSwordvoice.tsx`: `React.ForwardRefRenderFunction<any, …>` → `React.ForwardRefRenderFunction<SVGSVGElement, …>`.
- Anything else flagged: fix the code to satisfy the rule (no `eslint-disable`). If a boundaries rule flags a legitimate import from Tasks 4–6, the import is wrong, not the rule — move the code per conventions §3.

Re-run `pnpm lint` → `✔` with no warnings.

- [ ] **Step 3: Prove the rules bite** (revert after each)

```bash
echo 'import { HomePage } from "@/features/home"; export const x = HomePage;' > src/common/utils/_bite.ts
pnpm lint   # Expected: boundaries/element-types error in _bite.ts
rm src/common/utils/_bite.ts
echo 'import { contactSchema } from "@/features/home/schemas/contact.schema"; export const x = contactSchema;' > src/app/_bite.ts
pnpm lint   # Expected: boundaries/entry-point error
rm src/app/_bite.ts
echo 'export const x = () => fetch("/x");' > src/features/home/utils/_bite.ts
pnpm lint   # Expected: no-restricted-globals error
rm src/features/home/utils/_bite.ts
echo 'import { deliverContactEmail } from "@/features/home/server"; export const x = deliverContactEmail;' > src/features/home/utils/_bite.ts
pnpm lint   # Expected: no-restricted-imports error (server/)
rm src/features/home/utils/_bite.ts
```

If any of the four does NOT error, fix `.eslintrc.json` until it does (e.g. boundaries template syntax `${from.feature}` vs `${feature}`, or resolver settings), then re-run Step 2.

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` → all green.

- [ ] **Step 5: Commit**

```bash
git add .eslintrc.json src
git commit -m "build: :rotating_light: enforce architecture boundaries with eslint" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Conventions doc, Haiku agents, CLAUDE.md

**Files:**
- Create: `docs/architecture/conventions.md`, `.claude/agents/developer.md`, `.claude/agents/tester.md`, `CLAUDE.md`

**Interfaces:**
- Consumes: the real code from Tasks 2–7 (examples in conventions point to real files).

- [ ] **Step 1: Create `docs/architecture/conventions.md`**

```markdown
# Convenciones de arquitectura — SwordVoice

Fuente única de verdad para implementar código en este repo. `pnpm lint` hace cumplir las reglas de estructura (§1, §3); el resto se revisa en code review. Si una regla no cubre tu caso: **detente y pregunta**, no improvises.

Ejemplo canónico de punta a punta: el formulario de contacto de `src/features/home` (schema → service → hooks → organism → route → server).

## 1. Estructura

    src/app/                 Solo routing de Next (page, layout, error, route). Sin lógica.
    src/features/<page>/     Una carpeta por página/dominio.
      components/{atoms,molecules,organisms}/
      hooks/                 Lógica del módulo + useXxxQuery / useXxxMutation
      services/              Funciones cliente que llaman a request()
      server/                Solo servidor (import "server-only"); entra por server/index.ts
      schemas/               *.schema.ts (zod) → tipos con z.infer
      store/                 Slice Zustand (solo si §4.5 lo justifica)
      constants/             Incluye queryKeys.ts cuando haya queries
      utils/
      <Page>Page.tsx         Compone organisms. Sin estado ni efectos.
      index.ts               API pública (lo que consume app/)
    src/common/              Lo compartido: components, hooks, api, store, config, errors, utils, constants, assets

## 2. Cuándo algo va a common

Nace en la feature. Se mueve a `common/` cuando lo usa **una segunda feature**. Excepción: atoms genéricos (Button, Input, Textarea, Typography) viven en `common/components/atoms`.

## 3. Dependencias (ESLint las hace cumplir)

- `app` → `features/<x>` (solo `index.ts` o `server/index.ts`) → `common`.
- Una feature NO importa de otra feature. `common` NO importa de `features` ni `app`.
- Dentro de una feature: `components → hooks → services → @/common/api`. Un componente nunca importa `services/` ni `server/`.
- `server/` solo se importa desde `src/app/api/**`.
- Imports siempre con `@/` (también dentro de la misma feature).

## 4. Reglas por capa

### 4.1 Componentes (atomic design)
- **atoms**: un elemento visual, sin lógica de negocio ni hooks de datos. Ej.: `src/common/components/atoms/Input.tsx`.
- **molecules**: combinan atoms. Sin hooks de datos. Ej.: `src/common/components/molecules/NavLink.tsx`.
- **organisms**: secciones con comportamiento; usan hooks de su feature; nunca `services`/`fetch`. Ej.: `src/features/home/components/organisms/ContactForm.tsx`.
- **`<Page>Page.tsx`**: solo compone. Ej.: `src/features/home/HomePage.tsx`.
- Un componente por archivo `PascalCase.tsx`, export nombrado, props en `type XxxProps`. Más de 150 líneas → divide.
- Solo Tailwind. `"use client"` solo en el componente más bajo que lo necesite (usa hooks, eventos o framer-motion).

✅ `export function ServiceItem({ title }: ServiceItemProps)` ❌ `export default (props: any) =>`

### 4.2 Hooks
- Crea un hook cuando la lógica tiene estado/efectos y es cerrada para el módulo, o se reutiliza.
- `features/<x>/hooks/useXxx.ts`; a `common/hooks` al segundo uso entre features.
- Devuelve un objeto con nombre (no tuplas de más de 2).
- Máximo un `useEffect` por componente; más → hook. Ej.: `useIsPastSection.ts`.

### 4.3 Formularios
- Siempre `react-hook-form` + `zodResolver`. Prohibido yup.
- Schema en `schemas/<nombre>.schema.ts`; tipo `export type XxxFormValues = z.infer<typeof xxxSchema>`. Mensajes en español dentro del schema. Strings con `.trim()` y `.max()`.
- Lógica en `useXxxForm` → devuelve `{ register, errors, onSubmit, isSubmitting }` (ver `useContactForm.ts`).
- El organism solo renderiza: `<Input label="…" error={errors.x?.message} {...register("x")} />`.

### 4.4 Endpoints
- Toda llamada HTTP del cliente pasa por `request(path, { method, body, schema })` de `@/common/api/httpClient`. Lanza `ApiError` si `!res.ok` o si la respuesta no cumple el schema.
- `services/<recurso>Service.ts`: funciones que solo llaman a `request`.
- `hooks/`: `useQuery`/`useMutation` envolviendo services. Query keys en `constants/queryKeys.ts`: `export const xKeys = { all: ["x"] as const, detail: (id: string) => ["x", id] as const }`.
- `app/api/**/route.ts`: `safeParse` del body con el MISMO schema → 400 `{ message }`; llama a `features/<x>/server`; 200 con JSON validable por el schema de respuesta; 500 `{ message }` genérico, error real solo a `console.error`.
- Prohibido `fetch` fuera de `src/common/api` y `src/features/*/server`.

### 4.5 Estado
- Datos de servidor: SOLO TanStack Query. Nunca copiarlos a Zustand ni useState.
- Zustand: solo estado de cliente compartido por componentes no relacionados (sesión, UI global). Global en `common/store/useXStore.ts`, de feature en `features/<x>/store/`. Consumo con selector atómico: `useXStore((s) => s.value)`; nunca `useXStore()` entero.
- Estado local: `useState` en el componente o su hook.

### 4.6 Errores y entorno
- `ApiError` es el único error de red. Mutations: `onError: notifyError` (de `@/common/errors/notifyError`). Nunca `toast.error` suelto para errores.
- Un `error.tsx` por segmento de ruta.
- Variables de servidor: añade la clave al schema de `src/common/config/env.ts` y léela con `getServerEnv()` dentro de la función que la usa (nunca a nivel de módulo). Variables `NEXT_PUBLIC_*`: crea `publicEnv` en ese mismo archivo. Prohibido `process.env` en cualquier otro lugar.
- Texto de usuario que va a HTML (emails): `escapeHtml`.

### 4.7 Estilo
- TypeScript strict. Prohibido `any`, `@ts-ignore`, `eslint-disable`.
- Componentes `PascalCase.tsx`; resto `camelCase.ts`; schemas `*.schema.ts`; tests `*.test.ts(x)` junto al archivo.
- Exports nombrados (salvo archivos que Next exige default en `app/`).
- Textos de UI en español.

## 5. Tests (Vitest + React Testing Library)
- Junto al código: `x.ts` → `x.test.ts`.
- Schemas: válidos e inválidos con el mensaje exacto (`contact.schema.test.ts`).
- Services / httpClient: `vi.spyOn(globalThis, "fetch")` — éxito, `!res.ok`, respuesta inválida.
- Hooks: `renderHook`; con React Query usa `renderWithClient` de `test/renderWithClient.tsx`.
- Organisms: comportamiento visible con `getByRole`/`getByLabelText` + `userEvent` (`ContactForm.test.tsx`). Sin snapshots.
- Server y route handlers: `// @vitest-environment node` (`route.test.ts`).

## 6. Comandos
`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` — los cuatro en verde antes de entregar.
```

- [ ] **Step 2: Create `.claude/agents/developer.md`**

```markdown
---
name: developer
description: Implements one scoped task in this repo following docs/architecture/conventions.md. Use for feature code (components, hooks, services, schemas, routes). Does not write tests.
model: haiku
tools: Read, Edit, Write, Glob, Grep, Bash
---

Eres el developer de SwordVoice (Next.js 15 App Router, React 19, TypeScript, Tailwind, react-hook-form + zod, TanStack Query, Zustand).

## Antes de escribir código
1. Lee `docs/architecture/conventions.md` completo.
2. Lee los archivos de la feature afectada y el ejemplo canónico: `src/features/home` (flujo de contacto).
3. Si la tarea no dice qué archivos tocar o una regla no cubre el caso, DETENTE y repórtalo en "Dudas". No improvises.

## Al implementar
- Solo toca los archivos dentro del alcance de la tarea.
- Copia los patrones del ejemplo canónico en vez de inventar nuevos.
- Ejecuta `pnpm lint && pnpm typecheck` y corrige hasta que ambos pasen. Si un error de lint te impide algo, la regla gana: reestructura el código.

## Prohibido
- Instalar o quitar dependencias.
- Escribir o modificar tests.
- `git commit`, `git push` o cualquier cambio de rama.
- `any`, `@ts-ignore`, `eslint-disable`.
- Editar `.eslintrc.json` o `docs/architecture/conventions.md`.

## Reporte final (siempre este formato)
### Archivos
- creado|modificado: ruta — qué hace
### Decisiones
- …
### Checklist de convenciones
- §3 dependencias: sí/no/n.a.
- §4.1 componentes: sí/no/n.a.
- §4.2 hooks: sí/no/n.a.
- §4.3 formularios: sí/no/n.a.
- §4.4 endpoints: sí/no/n.a.
- §4.5 estado: sí/no/n.a.
- §4.6 errores/env: sí/no/n.a.
- §4.7 estilo: sí/no/n.a.
### Verificación
- pnpm lint: ✅/❌ (pega el error si falla)
- pnpm typecheck: ✅/❌
### Dudas
- … (o "ninguna")
```

- [ ] **Step 3: Create `.claude/agents/tester.md`**

```markdown
---
name: tester
description: Writes and runs Vitest + React Testing Library tests for code the developer agent just implemented, following docs/architecture/conventions.md §5. Never edits production code.
model: haiku
tools: Read, Edit, Write, Glob, Grep, Bash
---

Eres el tester de SwordVoice. Recibes el reporte del developer y los criterios de aceptación.

## Proceso
1. Lee `docs/architecture/conventions.md` (sobre todo §5) y los tests de referencia:
   `src/features/home/schemas/contact.schema.test.ts`, `src/common/api/httpClient.test.ts`,
   `src/features/home/components/organisms/ContactForm.test.tsx`, `src/app/api/sendEmail/route.test.ts`.
2. Lee el código a probar.
3. Escribe tests junto a cada archivo (`x.ts` → `x.test.ts`) cubriendo cada criterio de aceptación, más:
   - schemas: casos válidos e inválidos con el mensaje exacto;
   - services: éxito, `!res.ok` → ApiError, respuesta inválida;
   - hooks: `renderHook` (con `renderWithClient` si usan React Query);
   - organisms: comportamiento visible (`getByRole`/`getByLabelText` + `userEvent`), sin snapshots;
   - route handlers: `// @vitest-environment node`, 400 / 200 / 500.
4. Ejecuta `pnpm test` y `pnpm lint`.

## Prohibido
- Modificar código de producción (solo archivos `*.test.ts(x)`). Si un test revela un bug, déjalo fallando y repórtalo.
- Instalar dependencias, `git commit`, `any`, `eslint-disable`, `test.skip`/`it.only`.

## Reporte final (siempre este formato)
### Tests creados
- ruta — qué cubre
### Resultado
- pnpm test: N pasan / M fallan (pega la salida de los que fallan)
- pnpm lint: ✅/❌
### Bugs encontrados
- archivo · test · esperado vs obtenido (o "ninguno")
```

- [ ] **Step 4: Create `CLAUDE.md`**

```markdown
# SwordVoice Academy

Landing de SwordVoice en evolución a app de mentorías (roadmap: `docs/roadmap/`). Next.js 15 App Router + React 19 + TypeScript + Tailwind, desplegado en Cloudflare con OpenNext.

## Comandos
- `pnpm dev` — servidor local
- `pnpm lint` — ESLint (incluye reglas de arquitectura)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest
- `pnpm build` — build de Next
- `pnpm deploy` — build + deploy a Cloudflare

## Reglas
Toda implementación sigue `docs/architecture/conventions.md`. Ejemplo canónico: `src/features/home` (formulario de contacto).

## Flujo con agentes
La sesión principal orquesta; los subagentes `developer` y `tester` (modelo Haiku, en `.claude/agents/`) ejecutan.
1. Dividir el trabajo en tareas pequeñas (una feature o capa), cada una con archivos objetivo y criterios de aceptación.
2. Invocar `developer`; revisar su diff contra conventions.md.
3. Invocar `tester` con el reporte del developer.
4. Si hay fallos, devolver al developer con el error exacto. Máximo 2 iteraciones; después lo resuelve la sesión principal o se consulta al usuario.
5. Commit al cerrar cada tarea (lint, typecheck, test y build en verde).
```

- [ ] **Step 5: Verify**

Run: `git grep -nE "TODO|TBD" -- docs/architecture CLAUDE.md .claude/agents` → no output.
Check every file path cited in `conventions.md` and `tester.md` exists: `ls src/common/components/atoms/Input.tsx src/common/components/molecules/NavLink.tsx src/features/home/components/organisms/ContactForm.tsx src/features/home/HomePage.tsx src/features/home/hooks/useIsPastSection.ts src/features/home/hooks/useContactForm.ts src/features/home/schemas/contact.schema.test.ts src/common/api/httpClient.test.ts src/features/home/components/organisms/ContactForm.test.tsx src/app/api/sendEmail/route.test.ts test/renderWithClient.tsx src/common/config/env.ts`.
Run `/agents` in Claude Code → `developer` and `tester` listed with model haiku.

- [ ] **Step 6: Commit**

```bash
git add docs/architecture CLAUDE.md .claude/agents
git commit -m "docs: :memo: add architecture conventions, haiku agents and CLAUDE.md" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Final verification

- [ ] **Step 1:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — all green.
- [ ] **Step 2:** `git grep -nE "@/(components|constants|assets)/|from \"yup\"|process\.env" -- src` → only `src/common/config/env.ts` (process.env).
- [ ] **Step 3:** `pnpm dev` manual pass: every section matches production visually; navbar anchors; logo swap + house button after services; carousel; contact: empty submit → Spanish errors; valid submit → success toast + reset; SMTP failure → error toast + values kept.
- [ ] **Step 4:** Dogfood the agents: dispatch `developer` with a tiny scoped task (e.g. "add `aria-label='Abrir menú'` to the hamburger trigger in `Navbar.tsx`"), then `tester`; confirm both return their fixed report format and keep lint/test green. Revert or commit depending on the result.
