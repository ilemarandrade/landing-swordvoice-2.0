import { describe, expect, it } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { toOAuthErrorMessage } from "@/features/auth/utils/toOAuthErrorMessage";

describe("toOAuthErrorMessage", () => {
  it.each([
    ["INVALID_OAUTH_CODE", 400, "No pudimos completar el inicio de sesión. Inténtalo de nuevo."],
    [
      "OAUTH_EMAIL_NOT_VERIFIED",
      400,
      "Tu cuenta de GitHub no tiene el correo confirmado. Confírmalo allí o entra con otro método.",
    ],
    ["OAUTH_PROVIDER_UNAVAILABLE", 503, "GitHub no está disponible ahora. Prueba con otro método."],
  ])("maps %s", (code, status, message) => {
    expect(toOAuthErrorMessage(new ApiError(status, "x", code), "GitHub")).toBe(message);
  });

  it("uses the API message for other API errors", () => {
    expect(
      toOAuthErrorMessage(new ApiError(429, "Demasiadas solicitudes", "TOO_MANY_REQUESTS"), "GitHub"),
    ).toBe("Demasiadas solicitudes");
  });

  it("uses the generic message for non-API errors", () => {
    expect(toOAuthErrorMessage(new Error("zod"), "GitHub")).toBe("Ha ocurrido un error");
  });
});
