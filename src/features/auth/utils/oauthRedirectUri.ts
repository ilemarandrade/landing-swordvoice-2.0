import { routes } from "@/common/constants/routes";

// Debe ser idéntica en la ida y en el POST, y estar en OAUTH_REDIRECT_URIS de la API.
export function oauthRedirectUri(): string {
  return `${window.location.origin}${routes.OAUTH_CALLBACK}`;
}
