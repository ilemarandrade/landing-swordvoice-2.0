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
    return navigator.locks.request<void>(REFRESH_LOCK_NAME, task);
  }
  return task();
}
