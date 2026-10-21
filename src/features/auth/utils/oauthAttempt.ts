import { z } from "zod";
import { OAUTH_PROVIDER_IDS } from "@/features/auth/constants/oauthProviders";

const STORAGE_KEY = "sv-oauth";
const MAX_AGE_MS = 10 * 60 * 1000;

const attemptSchema = z.object({
  provider: z.enum(OAUTH_PROVIDER_IDS),
  state: z.string().min(1),
  codeVerifier: z.string().optional(),
  createdAt: z.number(),
});

export type OAuthAttempt = z.infer<typeof attemptSchema>;

export function saveOAuthAttempt(
  attempt: Omit<OAuthAttempt, "createdAt">,
): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...attempt, createdAt: Date.now() }),
    );
  } catch {
    // Sin sessionStorage el callback dirá que el intento no es válido.
  }
}

// Se consume al leerlo: un `state` solo sirve para una vuelta del proveedor.
export function takeOAuthAttempt(): OAuthAttempt | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = attemptSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    return Date.now() - parsed.data.createdAt > MAX_AGE_MS ? null : parsed.data;
  } catch {
    return null;
  }
}
