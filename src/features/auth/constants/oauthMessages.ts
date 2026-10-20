export const UNKNOWN_PROVIDER_LABEL = "el proveedor";

export const oauthMessages = {
  cancelled: (provider: string) =>
    `Cancelaste el inicio de sesión con ${provider}.`,
  providerError: (provider: string) =>
    `${provider} no pudo completar el inicio de sesión. Inténtalo de nuevo.`,
  INVALID_ATTEMPT:
    "El inicio de sesión no es válido o expiró. Vuelve a intentarlo.",
  INVALID_CODE: "No pudimos completar el inicio de sesión. Inténtalo de nuevo.",
  emailNotVerified: (provider: string) =>
    `Tu cuenta de ${provider} no tiene el correo confirmado. Confírmalo allí o entra con otro método.`,
  unavailable: (provider: string) =>
    `${provider} no está disponible ahora. Prueba con otro método.`,
};
