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
