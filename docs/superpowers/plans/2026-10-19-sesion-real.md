# Sesión real — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Flujo del repo (CLAUDE.md):** en cada tarea el subagente `developer` hace los pasos de implementación y el `tester` los de tests; la sesión principal revisa contra `docs/architecture/conventions.md` y commitea con lint, typecheck, test y build en verde. Máximo 2 iteraciones developer↔tester por tarea.

**Goal:** Reemplazar la sesión falsa (`useSessionStore`) por una sesión real contra `swordvoice-api`: login, tokens en `localStorage`, refresh automático coordinado, logout y usuario actual desde `/auth/me`.

**Architecture:** `src/common/api` guarda los tokens (`tokenStorage`), coordina la renovación (`refreshSession`, deduplicada en la pestaña y con `navigator.locks` entre pestañas) y los interceptores de `apiClient` añaden el Bearer y reintentan una vez tras un 401. `src/common/hooks` expone `useSession` (estado de tokens con `useSyncExternalStore`), `useMeQuery` y el guard. Las features `auth` y `dashboard` consumen esos hooks.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, axios (`apiClient`), TanStack Query 5, zod 4, react-hook-form, react-hot-toast, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-19-sesion-real-design.md`

## Global Constraints

- Todo el par de tokens en `localStorage`, clave `sv-auth`, valor `{ accessToken, refreshToken, expiresAt }` con `expiresAt = Date.now() + expiresIn * 1000`.
- Lock entre pestañas: `navigator.locks.request("sv-auth-refresh", …)`; sin `navigator.locks`, solo deduplicación en la pestaña.
- Nunca más de un reintento por petición; nunca renovar sobre `/auth/login`, `/auth/refresh` ni `/auth/logout`.
- Refresh 401 → borrar storage + toast "Tu sesión expiró, inicia sesión de nuevo". Refresh por red o 5xx → conservar tokens.
- Login: `password` hasta 128 caracteres; sin checkbox `remember`.
- Query key del usuario: `["auth", "me"]`.
- Textos de UI en español; imports con `@/`; sin `any`, `@ts-ignore` ni `eslint-disable`; errores de mutation con `notifyError`.
- `axios` y `fetch` solo dentro de `src/common/api` (los tests pueden importar `axios`).
- No se instalan ni quitan dependencias (`zustand` se queda aunque `useSessionStore` desaparezca).

## Review Focus

1. **Hidratación de una ruta privada:** en el primer render (servidor/hidratación) `status` es `"unknown"` y el guard no debe redirigir al login aunque haya tokens — test en Task 3 (`useSessionGuard`, caso `unknown`).
2. **Varios 401 a la vez en la misma pestaña:** dos peticiones paralelas con el access vencido deben producir un solo `POST /auth/refresh` y ambas terminar bien — test en Task 2 (interceptor, peticiones paralelas).
3. **Sin conexión durante el refresh:** los tokens se conservan y el error que llega a la query tiene `status 0` (para que React Query reintente) — tests en Task 2.
4. **Cambio de usuario en la misma pestaña:** tras un logout o un refresh fallido, el siguiente login no debe mostrar el `me` del usuario anterior — test en Task 4 (`useLoginMutation` limpia la caché).
5. **`sv-auth` corrupto o manipulado:** se trata como sin sesión y la app no se rompe — test en Task 1 (`tokenStorage`).

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/common/api/auth.schema.ts` | crear | `authTokensSchema`, `userSchema` y tipos |
| `src/common/api/tokenStorage.ts` | crear | Leer/guardar/borrar `sv-auth`, avisar cambios (incl. otras pestañas) |
| `src/common/hooks/useSession.ts` | crear | `status` de la sesión con `useSyncExternalStore` |
| `src/common/api/refreshSession.ts` | crear | Renovación deduplicada + lock entre pestañas |
| `src/common/api/apiClient.ts` | modificar | Interceptores Bearer y reintento tras 401 |
| `src/common/constants/messages.ts` | modificar | `SESSION_EXPIRED_MESSAGE` |
| `src/common/hooks/useMeQuery.ts` | crear | `GET /auth/me` |
| `src/common/hooks/useSessionGuard.ts` | modificar | Redirects y estado `loading/error/ready/redirecting` |
| `src/common/components/session-guard/index.tsx` | modificar | UI del guard (incl. "Reintentar") |
| `src/features/auth/schemas/login.schema.ts` | modificar | Sin `remember`, password ≤128 |
| `src/features/auth/hooks/useLoginMutation.ts` | crear | `POST /auth/login` |
| `src/features/auth/hooks/useLoginForm.ts` | modificar | Usa la mutation |
| `src/features/auth/components/login-form/index.tsx` | modificar | Sin checkbox |
| `src/features/auth/hooks/useRegisterForm.ts` | modificar | Sin sesión falsa |
| `src/features/dashboard/hooks/useLogoutMutation.ts` | crear | Logout local-first |
| `src/features/dashboard/hooks/useCurrentUser.ts` | crear | Nombre y path principal desde `me` |
| `src/features/dashboard/hooks/useAccountMenu.ts` | modificar | Nombre real + logout |
| `src/features/dashboard/hooks/useMyPathHref.ts` | modificar | Slug desde `pathRoles` |
| `src/features/dashboard/components/dashboard-sidebar/rank-card/index.tsx` | modificar | Lee `useCurrentUser` |
| `src/features/dashboard/components/welcome-banner/index.tsx` | modificar | Lee `useCurrentUser` |
| `src/common/store/useSessionStore.ts` | borrar | Sesión falsa |

---

### Task 1: Schemas, almacenamiento de tokens y `useSession`

**Files:**
- Create: `src/common/api/auth.schema.ts`
- Create: `src/common/api/tokenStorage.ts`
- Create: `src/common/hooks/useSession.ts`
- Test: `src/common/api/tokenStorage.test.ts`, `src/common/hooks/useSession.test.ts`

**Interfaces:**
- Produces:
  - `authTokensSchema`, `type AuthTokens = { accessToken: string; refreshToken: string; expiresIn: number }`
  - `userSchema`, `type User`, `type PathRole = User["pathRoles"][number]`
  - `getTokens(): StoredTokens | null`, `saveTokens(tokens: AuthTokens): void`, `clearTokens(): void`, `subscribe(listener: () => void): () => void`, `type StoredTokens = { accessToken: string; refreshToken: string; expiresAt: number }`
  - `useSession(): { status: SessionStatus }`, `type SessionStatus = "unknown" | "authenticated" | "anonymous"`

- [ ] **Step 1 (developer): Crear `src/common/api/auth.schema.ts`**

```ts
import { z } from "zod";

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  emailVerified: z.boolean(),
  pathRoles: z.array(
    z.object({
      path: z.object({ id: z.string(), slug: z.string(), name: z.string() }),
      role: z.enum(["MENTOR", "APPRENTICE"]),
    }),
  ),
});

export type User = z.infer<typeof userSchema>;
export type PathRole = User["pathRoles"][number];
```

- [ ] **Step 2 (developer): Crear `src/common/api/tokenStorage.ts`**

```ts
import { z } from "zod";
import type { AuthTokens } from "@/common/api/auth.schema";

const STORAGE_KEY = "sv-auth";

const storedTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.number(),
});

export type StoredTokens = z.infer<typeof storedTokensSchema>;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

// Contenido corrupto, manipulado o un localStorage bloqueado cuentan como "sin sesión".
export function getTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = storedTokensSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveTokens({ accessToken, refreshToken, expiresIn }: AuthTokens): void {
  const stored: StoredTokens = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Sin localStorage no hay sesión persistente; la app sigue funcionando.
  }
  notify();
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Igual que en saveTokens.
  }
  notify();
}

// Avisa de los cambios de esta pestaña y, con el evento `storage`, de los de las demás.
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
```

- [ ] **Step 3 (developer): Crear `src/common/hooks/useSession.ts`**

```ts
import { useSyncExternalStore } from "react";
import { getTokens, subscribe } from "@/common/api/tokenStorage";

export type SessionStatus = "unknown" | "authenticated" | "anonymous";

const getSnapshot = (): SessionStatus =>
  getTokens() ? "authenticated" : "anonymous";
// En el servidor y durante la hidratación no se conoce el storage.
const getServerSnapshot = (): SessionStatus => "unknown";

export function useSession() {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { status };
}
```

- [ ] **Step 4 (developer):** `pnpm lint && pnpm typecheck` → ambos pasan.

- [ ] **Step 5 (tester): Escribir `src/common/api/tokenStorage.test.ts`**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTokens,
  getTokens,
  saveTokens,
  subscribe,
} from "@/common/api/tokenStorage";

const tokens = { accessToken: "a1", refreshToken: "r1", expiresIn: 900 };

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(getTokens()).toBeNull();
  });

  it("saves the pair with expiresAt computed from expiresIn", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    saveTokens(tokens);
    expect(getTokens()).toEqual({
      accessToken: "a1",
      refreshToken: "r1",
      expiresAt: 1_000 + 900_000,
    });
  });

  it("clears the stored pair", () => {
    saveTokens(tokens);
    clearTokens();
    expect(getTokens()).toBeNull();
  });

  it.each([
    ["invalid JSON", "{not json"],
    ["a value that does not match the schema", JSON.stringify({ accessToken: "" })],
  ])("treats %s as no session", (_label, raw) => {
    localStorage.setItem("sv-auth", raw);
    expect(getTokens()).toBeNull();
  });

  it("returns null when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getTokens()).toBeNull();
  });

  it("notifies listeners on save and clear in this tab", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    saveTokens(tokens);
    clearTokens();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    saveTokens(tokens);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("notifies listeners when another tab changes sv-auth", () => {
    const listener = vi.fn();
    subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: "sv-auth" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "other-key" }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 6 (tester): Escribir `src/common/hooks/useSession.test.ts`**

```ts
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTokens, saveTokens } from "@/common/api/tokenStorage";
import { useSession } from "@/common/hooks/useSession";

describe("useSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is anonymous without tokens", () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.status).toBe("anonymous");
  });

  it("follows the storage when tokens are saved and cleared", () => {
    const { result } = renderHook(() => useSession());
    act(() => saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 }));
    expect(result.current.status).toBe("authenticated");
    act(() => clearTokens());
    expect(result.current.status).toBe("anonymous");
  });
});
```

- [ ] **Step 7:** `pnpm test src/common/api/tokenStorage.test.ts src/common/hooks/useSession.test.ts` → PASS.

- [ ] **Step 8: Commit**

```bash
git add src/common/api/auth.schema.ts src/common/api/tokenStorage.ts src/common/api/tokenStorage.test.ts src/common/hooks/useSession.ts src/common/hooks/useSession.test.ts
git commit -m "feat: :sparkles: add auth schemas, token storage and useSession

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Renovación de sesión e interceptores de `apiClient`

**Files:**
- Create: `src/common/api/refreshSession.ts`
- Modify: `src/common/api/apiClient.ts`
- Modify: `src/common/constants/messages.ts`
- Test: `src/common/api/refreshSession.test.ts`, `src/common/api/apiClient.test.ts` (añadir un `describe`)

**Interfaces:**
- Consumes: `getTokens`, `saveTokens`, `clearTokens` (Task 1), `authTokensSchema`, `AuthTokens` (Task 1), `ApiError`, `notifyError`.
- Produces:
  - `refreshSession(usedAccessToken: string | undefined, requestTokens: RequestTokens): Promise<void>`
  - `type RequestTokens = (refreshToken: string) => Promise<AuthTokens>`
  - `REFRESH_LOCK_NAME = "sv-auth-refresh"`
  - `SESSION_EXPIRED_MESSAGE = "Tu sesión expiró, inicia sesión de nuevo"`
  - `apiClient` envía `Authorization: Bearer` y reintenta una vez tras un 401.

- [ ] **Step 1 (developer): Añadir a `src/common/constants/messages.ts`**

```ts
export const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró, inicia sesión de nuevo";
```

- [ ] **Step 2 (developer): Crear `src/common/api/refreshSession.ts`**

```ts
import { ApiError } from "@/common/api/ApiError";
import type { AuthTokens } from "@/common/api/auth.schema";
import { clearTokens, getTokens, saveTokens } from "@/common/api/tokenStorage";
import { SESSION_EXPIRED_MESSAGE } from "@/common/constants/messages";
import { notifyError } from "@/common/errors/notifyError";

export const REFRESH_LOCK_NAME = "sv-auth-refresh";

export type RequestTokens = (refreshToken: string) => Promise<AuthTokens>;

let inFlight: Promise<void> | null = null;

// El refresh token es de un solo uso y reutilizarlo cierra la sesión: se renueva
// una sola vez por pestaña y, con el lock, una sola vez entre pestañas.
export function refreshSession(
  usedAccessToken: string | undefined,
  requestTokens: RequestTokens,
): Promise<void> {
  inFlight ??= withLock(() => rotate(usedAccessToken, requestTokens)).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function rotate(
  usedAccessToken: string | undefined,
  requestTokens: RequestTokens,
): Promise<void> {
  const current = getTokens();
  if (!current) throw new ApiError(401, SESSION_EXPIRED_MESSAGE);
  // Otra pestaña o petición ya renovó: basta con reintentar con el token guardado.
  if (current.accessToken !== usedAccessToken) return;
  try {
    saveTokens(await requestTokens(current.refreshToken));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearTokens();
      notifyError(new ApiError(401, SESSION_EXPIRED_MESSAGE));
    }
    throw error;
  }
}

function withLock(task: () => Promise<void>): Promise<void> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return navigator.locks.request(REFRESH_LOCK_NAME, task);
  }
  return task();
}
```

- [ ] **Step 3 (developer): Reemplazar el bloque de interceptores de `src/common/api/apiClient.ts`**

Imports nuevos (junto a los existentes):

```ts
import axios, { isAxiosError } from "axios";
import { authTokensSchema, type AuthTokens } from "@/common/api/auth.schema";
import { refreshSession } from "@/common/api/refreshSession";
import { getTokens } from "@/common/api/tokenStorage";
```

Después de `export const apiClient = axios.create({...});`, sustituir el `apiClient.interceptors.response.use(...)` actual por:

```ts
declare module "axios" {
  interface InternalAxiosRequestConfig {
    authRetried?: boolean;
  }
}

// Sobre estas rutas un 401 es la respuesta final: no se intenta renovar.
const NO_REFRESH_URLS = ["/auth/login", "/auth/refresh", "/auth/logout"];

apiClient.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens) config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return config;
});

apiClient.interceptors.response.use((response) => {
  response.data = unwrapEnvelope(response.data);
  return response;
}, retryAfterRefresh);

async function retryAfterRefresh(error: unknown) {
  const config = isAxiosError(error) ? error.config : undefined;
  if (
    !isAxiosError(error) ||
    error.response?.status !== 401 ||
    !config ||
    config.authRetried ||
    NO_REFRESH_URLS.includes(config.url ?? "")
  ) {
    throw toApiError(error);
  }
  try {
    await refreshSession(readBearer(config.headers.Authorization), requestTokens);
  } catch (refreshError) {
    // Un fallo de red al renovar llega como status 0 para que la query reintente.
    throw refreshError instanceof ApiError ? refreshError : toApiError(error);
  }
  // El interceptor de request pone el token nuevo.
  return apiClient.request({ ...config, authRetried: true });
}

async function requestTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await apiClient.post("/auth/refresh", { refreshToken });
  return authTokensSchema.parse(data);
}

function readBearer(header: unknown): string | undefined {
  return typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : undefined;
}
```

`unwrapEnvelope`, `toApiError` y `readString` quedan igual. El `declare module "axios"` amplía `InternalAxiosRequestConfig` sin necesidad de importarlo.

- [ ] **Step 4 (developer):** `pnpm lint && pnpm typecheck` → ambos pasan.

- [ ] **Step 5 (tester): Escribir `src/common/api/refreshSession.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { refreshSession } from "@/common/api/refreshSession";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";

vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

const rotated = { accessToken: "a2", refreshToken: "r2", expiresIn: 900 };

describe("refreshSession", () => {
  beforeEach(() => {
    localStorage.clear();
    saveTokens({ accessToken: "a1", refreshToken: "r1", expiresIn: 900 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rotates the pair with the stored refresh token", async () => {
    const requestTokens = vi.fn().mockResolvedValue(rotated);
    await refreshSession("a1", requestTokens);
    expect(requestTokens).toHaveBeenCalledWith("r1");
    expect(getTokens()).toMatchObject({ accessToken: "a2", refreshToken: "r2" });
  });

  it("shares one request between concurrent calls", async () => {
    const requestTokens = vi.fn().mockResolvedValue(rotated);
    await Promise.all([
      refreshSession("a1", requestTokens),
      refreshSession("a1", requestTokens),
      refreshSession("a1", requestTokens),
    ]);
    expect(requestTokens).toHaveBeenCalledTimes(1);
  });

  it("does not call the API when another tab already rotated the token", async () => {
    const requestTokens = vi.fn().mockResolvedValue(rotated);
    await refreshSession("stale-access", requestTokens);
    expect(requestTokens).not.toHaveBeenCalled();
    expect(getTokens()).toMatchObject({ accessToken: "a1" });
  });

  it("runs inside the sv-auth-refresh lock when navigator.locks exists", async () => {
    const request = vi.fn((_name: string, task: () => Promise<void>) => task());
    vi.stubGlobal("navigator", { ...navigator, locks: { request } });
    await refreshSession("a1", vi.fn().mockResolvedValue(rotated));
    expect(request).toHaveBeenCalledWith("sv-auth-refresh", expect.any(Function));
  });

  it("clears the session and notifies when the refresh token is rejected", async () => {
    const rejected = new ApiError(401, "x", "INVALID_REFRESH_TOKEN");
    await expect(
      refreshSession("a1", vi.fn().mockRejectedValue(rejected)),
    ).rejects.toBe(rejected);
    expect(getTokens()).toBeNull();
    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tu sesión expiró, inicia sesión de nuevo" }),
    );
  });

  it("keeps the tokens when the refresh fails without connection", async () => {
    const offline = new ApiError(0, "No se pudo conectar con el servidor");
    await expect(
      refreshSession("a1", vi.fn().mockRejectedValue(offline)),
    ).rejects.toBe(offline);
    expect(getTokens()).toMatchObject({ accessToken: "a1" });
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("rejects with 401 and calls nothing when there is no session", async () => {
    localStorage.clear();
    const requestTokens = vi.fn();
    await expect(refreshSession("a1", requestTokens)).rejects.toMatchObject({ status: 401 });
    expect(requestTokens).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 6 (tester): Añadir al final de `src/common/api/apiClient.test.ts`**

Imports nuevos arriba del archivo: `afterEach, beforeEach, vi` de vitest; `type InternalAxiosRequestConfig` de axios; `apiClient` de `@/common/api/apiClient`; `getTokens, saveTokens` de `@/common/api/tokenStorage`; y `vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));`.

```ts
type Reply = { status: number; data?: unknown };

const originalAdapter = apiClient.defaults.adapter;

function replyWith(handler: (config: InternalAxiosRequestConfig) => Reply) {
  apiClient.defaults.adapter = async (config) => {
    const { status, data } = handler(config);
    const response = {
      status,
      statusText: "",
      headers: {},
      data,
      config,
    } as AxiosResponse;
    if (status >= 400) {
      throw new AxiosError("fail", "ERR_BAD_REQUEST", config, null, response);
    }
    return response;
  };
}

const envelope = (data: unknown) => ({ statusCode: 200, message: "ok", data });
const newPair = { accessToken: "a2", refreshToken: "r2", expiresIn: 900 };
const unauthorized = { status: 401, data: { message: "No autenticado", errorCode: "UNAUTHENTICATED" } };

describe("apiClient auth interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    saveTokens({ accessToken: "a1", refreshToken: "r1", expiresIn: 900 });
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it("sends the stored access token as Bearer", async () => {
    let authorization: unknown;
    replyWith((config) => {
      authorization = config.headers.Authorization;
      return { status: 200, data: envelope({ ok: true }) };
    });
    await apiClient.get("/auth/me");
    expect(authorization).toBe("Bearer a1");
  });

  it("refreshes once and retries parallel requests that got 401", async () => {
    let refreshCalls = 0;
    replyWith((config) => {
      if (config.url === "/auth/refresh") {
        refreshCalls += 1;
        return { status: 200, data: envelope(newPair) };
      }
      return config.headers.Authorization === "Bearer a2"
        ? { status: 200, data: envelope({ url: config.url }) }
        : unauthorized;
    });

    const [first, second] = await Promise.all([
      apiClient.get("/a"),
      apiClient.get("/b"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(first.data).toEqual({ url: "/a" });
    expect(second.data).toEqual({ url: "/b" });
    expect(getTokens()).toMatchObject({ refreshToken: "r2" });
  });

  it("retries only once when the retried request is also 401", async () => {
    let meCalls = 0;
    replyWith((config) => {
      if (config.url === "/auth/refresh") return { status: 200, data: envelope(newPair) };
      meCalls += 1;
      return unauthorized;
    });
    await expect(apiClient.get("/auth/me")).rejects.toMatchObject({ status: 401 });
    expect(meCalls).toBe(2);
  });

  it.each(["/auth/login", "/auth/refresh", "/auth/logout"])(
    "does not try to refresh on a 401 from %s",
    async (url) => {
      const urls: string[] = [];
      replyWith((config) => {
        urls.push(config.url ?? "");
        return unauthorized;
      });
      await expect(apiClient.post(url, {})).rejects.toMatchObject({ status: 401 });
      expect(urls).toEqual([url]);
    },
  );

  it("rejects with status 0 and keeps the tokens when the refresh has no connection", async () => {
    replyWith((config) => {
      if (config.url === "/auth/refresh") throw new AxiosError("Network Error", "ERR_NETWORK");
      return unauthorized;
    });
    await expect(apiClient.get("/auth/me")).rejects.toMatchObject({ status: 0 });
    expect(getTokens()).toMatchObject({ accessToken: "a1" });
  });

  it("clears the session when the refresh token is rejected", async () => {
    replyWith(() => unauthorized);
    await expect(apiClient.get("/auth/me")).rejects.toMatchObject({ status: 401 });
    expect(getTokens()).toBeNull();
  });
});
```

- [ ] **Step 7:** `pnpm test src/common/api` → PASS (incluidos los tests previos de `unwrapEnvelope`, `toApiError` y `shouldRetry`).

- [ ] **Step 8: Commit**

```bash
git add src/common/api/refreshSession.ts src/common/api/refreshSession.test.ts src/common/api/apiClient.ts src/common/api/apiClient.test.ts src/common/constants/messages.ts
git commit -m "feat: :sparkles: refresh the session on 401 with a cross-tab lock

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `useMeQuery` y guard de sesión

**Files:**
- Create: `src/common/hooks/useMeQuery.ts`
- Modify: `src/common/hooks/useSessionGuard.ts` (reescritura completa)
- Modify: `src/common/components/session-guard/index.tsx` (reescritura completa)
- Test: `src/common/hooks/useMeQuery.test.ts`, `src/common/hooks/useSessionGuard.test.ts`, `src/common/components/session-guard/index.test.tsx`

**Interfaces:**
- Consumes: `useSession` (Task 1), `userSchema`/`User` (Task 1), `apiClient`.
- Produces:
  - `useMeQuery(): UseQueryResult<User, Error>` con key `["auth", "me"]`
  - `useSessionGuard(access: SessionAccess): { status: GuardStatus; retry: () => void }`, `type SessionAccess = "private" | "guest"`, `type GuardStatus = "loading" | "error" | "ready" | "redirecting"`
  - `<SessionGuard access children />` (misma API pública que hoy)

- [ ] **Step 1 (developer): Crear `src/common/hooks/useMeQuery.ts`**

```ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { userSchema } from "@/common/api/auth.schema";
import { useSession } from "@/common/hooks/useSession";

async function getMe() {
  const { data } = await apiClient.get("/auth/me");
  return userSchema.parse(data);
}

export function useMeQuery() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: status === "authenticated",
  });
}
```

- [ ] **Step 2 (developer): Reescribir `src/common/hooks/useSessionGuard.ts`**

```ts
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/common/constants/routes";
import { useMeQuery } from "@/common/hooks/useMeQuery";
import { useSession } from "@/common/hooks/useSession";

export type SessionAccess = "private" | "guest";
export type GuardStatus = "loading" | "error" | "ready" | "redirecting";

export function useSessionGuard(access: SessionAccess) {
  const router = useRouter();
  const { status: session } = useSession();
  const me = useMeQuery();
  // Con "unknown" (servidor/hidratación) nunca se redirige.
  const mustRedirect =
    access === "private" ? session === "anonymous" : session === "authenticated";

  useEffect(() => {
    if (mustRedirect) {
      router.replace(access === "private" ? routes.LOGIN : routes.DASHBOARD);
    }
  }, [mustRedirect, access, router]);

  let status: GuardStatus;
  if (mustRedirect) status = "redirecting";
  // Las vistas de invitado se renderizan desde el servidor (SEO).
  else if (access === "guest") status = "ready";
  else if (me.isError) status = "error";
  else if (me.isSuccess) status = "ready";
  else status = "loading";

  return { status, retry: () => void me.refetch() };
}
```

- [ ] **Step 3 (developer): Reescribir `src/common/components/session-guard/index.tsx`**

```tsx
"use client";
import type { ReactNode } from "react";
import { Button } from "@/common/components/button";
import {
  useSessionGuard,
  type SessionAccess,
} from "@/common/hooks/useSessionGuard";

type SessionGuardProps = {
  access: SessionAccess;
  children: ReactNode;
};

export function SessionGuard({ access, children }: SessionGuardProps) {
  const { status, retry } = useSessionGuard(access);

  if (status === "ready") return <>{children}</>;
  if (status === "error") {
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white"
      >
        <p>No pudimos cargar tu sesión.</p>
        <Button type="button" label="Reintentar" onClick={retry} />
      </div>
    );
  }
  return (
    <p role="status" className="sr-only">
      Cargando…
    </p>
  );
}
```

- [ ] **Step 4 (developer):** `pnpm lint && pnpm typecheck` → pasan (el resto del repo aún usa `useSessionStore`; no se toca en esta tarea).

- [ ] **Step 5 (tester): Escribir `src/common/hooks/useMeQuery.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { saveTokens } from "@/common/api/tokenStorage";
import { useMeQuery } from "@/common/hooks/useMeQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function ok(data: unknown): Awaited<ReturnType<typeof apiClient.get>> {
  return { data } as Awaited<ReturnType<typeof apiClient.get>>;
}

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Pérez",
  role: "USER",
  emailVerified: true,
  pathRoles: [{ path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" }],
};

describe("useMeQuery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.get).mockReset();
  });

  it("does not request /auth/me without a session", () => {
    renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("returns the parsed user when there is a session", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockResolvedValue(ok(user));
    const { result } = renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/auth/me");
    expect(result.current.data).toEqual(user);
  });

  it("exposes the ApiError", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockRejectedValue(new ApiError(500, "x"));
    const { result } = renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });

  it("fails when the response does not match the schema", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockResolvedValue(ok({ ...user, role: "OWNER" }));
    const { result } = renderHook(() => useMeQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

- [ ] **Step 6 (tester): Escribir `src/common/hooks/useSessionGuard.test.ts`**

```ts
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionStatus } from "@/common/hooks/useSession";
import { useSessionGuard } from "@/common/hooks/useSessionGuard";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
const state = vi.hoisted(() => ({
  session: "unknown" as SessionStatus,
  me: { isSuccess: false, isError: false, refetch: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/common/hooks/useSession", () => ({
  useSession: () => ({ status: state.session }),
}));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => state.me }));

describe("useSessionGuard", () => {
  beforeEach(() => {
    router.replace.mockReset();
    state.session = "unknown";
    state.me = { isSuccess: false, isError: false, refetch: vi.fn() };
  });

  it("does not redirect a private route while the session is unknown (hydration)", () => {
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).toBe("loading");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("sends an anonymous visitor of a private route to the login", () => {
    state.session = "anonymous";
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).toBe("redirecting");
    expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion");
  });

  it("waits for /auth/me on a private route", () => {
    state.session = "authenticated";
    expect(renderHook(() => useSessionGuard("private")).result.current.status).toBe("loading");
  });

  it("renders a private route once /auth/me arrives", () => {
    state.session = "authenticated";
    state.me.isSuccess = true;
    expect(renderHook(() => useSessionGuard("private")).result.current.status).toBe("ready");
  });

  it("reports an error and retries /auth/me", () => {
    state.session = "authenticated";
    state.me.isError = true;
    const { result } = renderHook(() => useSessionGuard("private"));
    expect(result.current.status).toBe("error");
    result.current.retry();
    expect(state.me.refetch).toHaveBeenCalled();
  });

  it.each(["unknown", "anonymous"] as const)(
    "renders a guest route when the session is %s",
    (session) => {
      state.session = session;
      expect(renderHook(() => useSessionGuard("guest")).result.current.status).toBe("ready");
      expect(router.replace).not.toHaveBeenCalled();
    },
  );

  it("sends an authenticated visitor of a guest route to the dashboard", () => {
    state.session = "authenticated";
    renderHook(() => useSessionGuard("guest"));
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });
});
```

- [ ] **Step 7 (tester): Escribir `src/common/components/session-guard/index.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SessionGuard } from "@/common/components/session-guard";
import type { GuardStatus } from "@/common/hooks/useSessionGuard";

const guard = vi.hoisted(() => ({ status: "ready" as GuardStatus, retry: vi.fn() }));
vi.mock("@/common/hooks/useSessionGuard", () => ({ useSessionGuard: () => guard }));

describe("SessionGuard", () => {
  it("renders the children when ready", () => {
    guard.status = "ready";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  it("hides the children while loading", () => {
    guard.status = "loading";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    expect(screen.queryByText("contenido")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Cargando…");
  });

  it("shows a retry button on error", async () => {
    guard.status = "error";
    render(<SessionGuard access="private">contenido</SessionGuard>);
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(guard.retry).toHaveBeenCalled();
  });
});
```

- [ ] **Step 8:** `pnpm test src/common` → PASS.

- [ ] **Step 9: Commit**

```bash
git add src/common/hooks/useMeQuery.ts src/common/hooks/useMeQuery.test.ts src/common/hooks/useSessionGuard.ts src/common/hooks/useSessionGuard.test.ts src/common/components/session-guard
git commit -m "feat: :sparkles: guard routes with the real session and /auth/me

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Login real

**Files:**
- Modify: `src/features/auth/schemas/login.schema.ts`
- Create: `src/features/auth/hooks/useLoginMutation.ts`
- Modify: `src/features/auth/hooks/useLoginForm.ts`
- Modify: `src/features/auth/components/login-form/index.tsx`
- Modify: `src/features/auth/hooks/useRegisterForm.ts`
- Test: `src/features/auth/schemas/login.schema.test.ts`, `src/features/auth/hooks/useLoginMutation.test.ts`, `src/features/auth/components/login-form/index.test.tsx`

**Interfaces:**
- Consumes: `apiClient`, `authTokensSchema` (Task 1), `saveTokens` (Task 1), `notifyError`; el guard de `(auth)` (Task 3) redirige al dashboard cuando hay tokens.
- Produces: `useLoginMutation(): UseMutationResult<AuthTokens, Error, LoginFormValues>`; `type LoginFormValues = { email: string; password: string }`.

- [ ] **Step 1 (developer): Reescribir `src/features/auth/schemas/login.schema.ts`**

```ts
import { z } from "zod";
import { emailField } from "@/features/auth/schemas/authFields.schema";

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .max(128, "La contraseña no puede superar 128 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

- [ ] **Step 2 (developer): Crear `src/features/auth/hooks/useLoginMutation.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { authTokensSchema, type AuthTokens } from "@/common/api/auth.schema";
import { saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";

async function login(credentials: LoginFormValues) {
  const { data } = await apiClient.post("/auth/login", credentials);
  return authTokensSchema.parse(data);
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (tokens: AuthTokens) => {
      // Sin datos en caché de una sesión anterior en esta pestaña.
      queryClient.clear();
      saveTokens(tokens);
    },
    onError: notifyError,
  });
}
```

- [ ] **Step 3 (developer): Reescribir `src/features/auth/hooks/useLoginForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

const defaultValues: LoginFormValues = { email: "", password: "" };

export function useLoginForm() {
  const { mutate, isPending } = useLoginMutation();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  // Al guardar los tokens, el SessionGuard del grupo (auth) redirige al dashboard.
  const onSubmit = handleSubmit((values) => mutate(values));

  return { control, onSubmit, isSubmitting: isPending };
}
```

- [ ] **Step 4 (developer): En `src/features/auth/components/login-form/index.tsx`** borrar el bloque del checkbox:

```tsx
      <InputController
        control={control}
        name="remember"
        label="Mantener sesión iniciada"
        type="checkbox"
      />
```

y, como el link "¿Olvidaste tu contraseña?" ya no va seguido del checkbox, cambiar su clase `-mt-2 mb-2` por `-mt-2 mb-4`.

- [ ] **Step 5 (developer): En `src/features/auth/hooks/useRegisterForm.ts`** quitar el import y el uso de `useSessionStore`, y sustituir el `onSubmit` por:

```ts
  // El registro contra la API llega en el sub-proyecto 2 (ver
  // docs/superpowers/specs/2026-10-19-sesion-real-design.md): hasta entonces
  // el formulario solo valida.
  const onSubmit = handleSubmit(() => undefined);
```

- [ ] **Step 6 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 7 (tester): Escribir `src/features/auth/schemas/login.schema.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/auth/schemas/login.schema";

function firstMessage(values: unknown) {
  const result = loginSchema.safeParse(values);
  return result.success ? null : result.error.issues[0]?.message;
}

describe("loginSchema", () => {
  it("accepts an email and a password", () => {
    expect(
      loginSchema.parse({ email: " ana@example.com ", password: "secreta" }),
    ).toEqual({ email: "ana@example.com", password: "secreta" });
  });

  it("accepts a 128-character password", () => {
    expect(
      loginSchema.safeParse({ email: "ana@example.com", password: "x".repeat(128) }).success,
    ).toBe(true);
  });

  it.each([
    [{ email: "ana", password: "x" }, "Ingresa un correo electrónico válido"],
    [{ email: "ana@example.com", password: "" }, "Ingresa tu contraseña"],
    [
      { email: "ana@example.com", password: "x".repeat(129) },
      "La contraseña no puede superar 128 caracteres",
    ],
  ])("rejects %j with its message", (values, message) => {
    expect(firstMessage(values)).toBe(message);
  });
});
```

- [ ] **Step 8 (tester): Escribir `src/features/auth/hooks/useLoginMutation.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

function ok(data: unknown): Awaited<ReturnType<typeof apiClient.post>> {
  return { data } as Awaited<ReturnType<typeof apiClient.post>>;
}

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useLoginMutation(), { wrapper }) };
}

const credentials = { email: "ana@example.com", password: "secreta" };

describe("useLoginMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts the credentials and saves the tokens", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(
      ok({ accessToken: "a", refreshToken: "r", expiresIn: 900 }),
    );
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", credentials);
    expect(getTokens()).toMatchObject({ accessToken: "a", refreshToken: "r" });
  });

  it("drops the cached user of a previous session", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(
      ok({ accessToken: "a", refreshToken: "r", expiresIn: 900 }),
    );
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Usuario anterior" });
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
  });

  it("notifies the API error and saves nothing", async () => {
    const error = new ApiError(403, "Confirma tu correo", "EMAIL_NOT_VERIFIED");
    vi.mocked(apiClient.post).mockRejectedValue(error);
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(vi.mocked(notifyError).mock.calls[0]?.[0]).toBe(error);
    expect(getTokens()).toBeNull();
  });

  it("fails and saves nothing when the response does not match the schema", async () => {
    vi.mocked(apiClient.post).mockResolvedValue(ok({ accessToken: "a" }));
    const { result } = setup();
    act(() => result.current.mutate(credentials));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getTokens()).toBeNull();
  });
});
```
- [ ] **Step 9 (tester): Escribir `src/features/auth/components/login-form/index.test.tsx`**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { LoginForm } from "@/features/auth/components/login-form";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
  await userEvent.type(screen.getByLabelText("Contraseña"), "secreta");
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not show the remember-me checkbox", () => {
    renderWithClient(<LoginForm />);
    expect(screen.queryByLabelText("Mantener sesión iniciada")).not.toBeInTheDocument();
  });

  it("saves the session after a successful login", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "a", refreshToken: "r", expiresIn: 900 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await waitFor(() => expect(getTokens()).not.toBeNull());
  });

  it("notifies when the credentials are rejected", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new ApiError(401, "Credenciales inválidas", "INVALID_CREDENTIALS"),
    );
    renderWithClient(<LoginForm />);
    await fillAndSubmit();
    await waitFor(() => expect(notifyError).toHaveBeenCalled());
    expect(getTokens()).toBeNull();
  });
});
```

- [ ] **Step 10:** `pnpm test src/features/auth` → PASS.

- [ ] **Step 11: Commit**

```bash
git add src/features/auth
git commit -m "feat: :sparkles: log in against the API and drop remember-me

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Logout, dashboard con el usuario real y eliminar la sesión falsa

**Files:**
- Create: `src/features/dashboard/hooks/useLogoutMutation.ts`
- Create: `src/features/dashboard/hooks/useCurrentUser.ts`
- Modify: `src/features/dashboard/hooks/useAccountMenu.ts`
- Modify: `src/features/dashboard/hooks/useMyPathHref.ts`
- Modify: `src/features/dashboard/components/dashboard-sidebar/rank-card/index.tsx`
- Modify: `src/features/dashboard/components/welcome-banner/index.tsx`
- Delete: `src/common/store/useSessionStore.ts`
- Test: `src/features/dashboard/hooks/useLogoutMutation.test.ts`, `src/features/dashboard/hooks/useCurrentUser.test.ts`

**Interfaces:**
- Consumes: `useMeQuery` (Task 3), `getTokens`, `clearTokens` (Task 1), `apiClient`.
- Produces:
  - `useLogoutMutation(): UseMutationResult<void, Error, void>`
  - `useCurrentUser(): { name: string; primaryPath: { slug: string; name: string } | null }`

- [ ] **Step 1 (developer): Crear `src/features/dashboard/hooks/useLogoutMutation.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { clearTokens, getTokens } from "@/common/api/tokenStorage";

// Cerrar sesión siempre funciona en el dispositivo: primero se borra lo local y
// luego se avisa a la API, aunque falle o no haya conexión.
async function logout(clearCache: () => void) {
  const tokens = getTokens();
  clearTokens();
  clearCache();
  if (tokens) {
    await apiClient.post("/auth/logout", { refreshToken: tokens.refreshToken });
  }
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => logout(() => queryClient.clear()) });
}
```

- [ ] **Step 2 (developer): Crear `src/features/dashboard/hooks/useCurrentUser.ts`**

```ts
import { useMeQuery } from "@/common/hooks/useMeQuery";

export function useCurrentUser() {
  const { data } = useMeQuery();
  // pathRoles viene ordenado por nombre; el estado sin roles llega en el sub-proyecto 5.
  const primaryPath = data?.pathRoles[0]?.path ?? null;
  return {
    name: data?.name ?? "",
    primaryPath: primaryPath && { slug: primaryPath.slug, name: primaryPath.name },
  };
}
```

- [ ] **Step 3 (developer): Reescribir `src/features/dashboard/hooks/useAccountMenu.ts`**

```ts
import { useState } from "react";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";
import { useLogoutMutation } from "@/features/dashboard/hooks/useLogoutMutation";
import { getInitials } from "@/features/dashboard/utils/getInitials";

export function useAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { name } = useCurrentUser();
  const { mutate: logout } = useLogoutMutation();

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    initials: getInitials(name),
    // Al borrar los tokens, el SessionGuard del grupo (app) redirige al login.
    signOut: () => logout(),
  };
}
```

- [ ] **Step 4 (developer): Reescribir `src/features/dashboard/hooks/useMyPathHref.ts`**

```ts
import { LEARNING_PATH_IDS } from "@/common/constants/learningPaths";
import { routes } from "@/common/constants/routes";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

export function useMyPathHref() {
  const { primaryPath } = useCurrentUser();
  const slug = primaryPath?.slug ?? LEARNING_PATH_IDS[0];
  return { myPathHref: `${routes.DASHBOARD_PATHS}/${slug}` };
}
```

- [ ] **Step 5 (developer): En `rank-card/index.tsx`** cambiar los imports y la lectura del path (el JSX restante queda igual):

```tsx
"use client";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

export function RankCard() {
  const { primaryPath } = useCurrentUser();
```

y el texto del rango: `{primaryPath?.name ?? "Por definir"}`.

- [ ] **Step 6 (developer): En `welcome-banner/index.tsx`** cambiar imports y lecturas:

```tsx
"use client";
import { ButtonLink } from "@/common/components/button-link";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

export function WelcomeBanner() {
  const { name, primaryPath } = useCurrentUser();
  const pathName = primaryPath?.name ?? null;
```

y en el `<h2>`: `<span className="text-primary">{name}</span>`. El resto del JSX queda igual.

- [ ] **Step 7 (developer): Borrar `src/common/store/useSessionStore.ts`** y comprobar que nada lo importa:

Run: `git rm src/common/store/useSessionStore.ts` y luego buscar `useSessionStore` en `src/` → sin resultados.

- [ ] **Step 8 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 9 (tester): Escribir `src/features/dashboard/hooks/useLogoutMutation.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import { useLogoutMutation } from "@/features/dashboard/hooks/useLogoutMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn() } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useLogoutMutation(), { wrapper }) };
}

describe("useLogoutMutation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.post).mockReset();
  });

  it("clears the tokens and the cache, then revokes the refresh token", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockResolvedValue({ data: null } as Awaited<
      ReturnType<typeof apiClient.post>
    >);
    const { client, result } = setup();
    client.setQueryData(["auth", "me"], { name: "Ana" });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTokens()).toBeNull();
    expect(client.getQueryData(["auth", "me"])).toBeUndefined();
    expect(apiClient.post).toHaveBeenCalledWith("/auth/logout", { refreshToken: "r" });
  });

  it("clears the tokens even when the API call fails", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.post).mockRejectedValue(new ApiError(0, "sin conexión"));
    const { result } = setup();
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getTokens()).toBeNull();
  });

  it("does not call the API when there is no session", async () => {
    const { result } = setup();
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 10 (tester): Escribir `src/features/dashboard/hooks/useCurrentUser.test.ts`**

```ts
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";

const me = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => me }));

describe("useCurrentUser", () => {
  it("returns empty values while /auth/me loads", () => {
    me.data = undefined;
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "",
      primaryPath: null,
    });
  });

  it("uses the first path role as the primary path", () => {
    me.data = {
      name: "Ana Pérez",
      pathRoles: [
        { path: { id: "p1", slug: "initiated", name: "Initiated" }, role: "MENTOR" },
        { path: { id: "p2", slug: "wanderer", name: "Wanderer" }, role: "APPRENTICE" },
      ],
    };
    expect(renderHook(() => useCurrentUser()).result.current).toEqual({
      name: "Ana Pérez",
      primaryPath: { slug: "initiated", name: "Initiated" },
    });
  });

  it("has no primary path for an account without roles", () => {
    me.data = { name: "Ana Pérez", pathRoles: [] };
    expect(renderHook(() => useCurrentUser()).result.current.primaryPath).toBeNull();
  });
});
```

- [ ] **Step 11:** `pnpm test` → todo PASS.

- [ ] **Step 12: Commit**

```bash
git add src/features/dashboard src/common/store
git commit -m "feat: :sparkles: show the real user in the dashboard and log out against the API

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verificación final contra la API

**Files:** ninguno nuevo (solo correcciones si algo falla).

- [ ] **Step 1:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` → los cuatro en verde.

- [ ] **Step 2: Prueba manual** con `swordvoice-api` corriendo en `http://localhost:4000` (`pnpm dev` en la web), con una cuenta de prueba confirmada del seed de la API:
  1. `/iniciar-sesion` con credenciales correctas → redirige a `/dashboard` y el saludo muestra el nombre real.
  2. Credenciales incorrectas → toast con el mensaje de la API; sigue en el login.
  3. Recargar `/dashboard` → sigue con sesión y no pasa por el login.
  4. En DevTools, cambiar `accessToken` dentro de `sv-auth` por un valor inválido y recargar → la red muestra un `POST /auth/refresh` y el dashboard carga.
  5. Dos pestañas en `/dashboard`; "Cerrar sesión" en una → la otra redirige al login.
  6. Con DevTools → Network "Offline", recargar `/dashboard` → mensaje "No pudimos cargar tu sesión." con "Reintentar", y `sv-auth` sigue en el storage.

- [ ] **Step 3:** Si hubo correcciones, commit con `fix: :bug: …` y la línea `Co-Authored-By`.
