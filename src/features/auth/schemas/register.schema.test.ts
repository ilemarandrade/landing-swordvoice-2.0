import { describe, expect, it } from "vitest";
import { registerSchema } from "@/features/auth/schemas/register.schema";

const valid = {
  name: "Ana Pérez",
  email: "ana@example.com",
  password: "abcdefgh",
  confirmPassword: "abcdefgh",
  acceptTerms: true,
};

function firstMessage(values: unknown) {
  const result = registerSchema.safeParse(values);
  return result.success ? null : result.error.issues[0]?.message;
}

describe("registerSchema", () => {
  it("accepts an 8-character password without numbers", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a 128-character password", () => {
    const password = "x".repeat(128);
    expect(
      registerSchema.safeParse({ ...valid, password, confirmPassword: password }).success,
    ).toBe(true);
  });

  it("does not keep a path field", () => {
    expect(registerSchema.parse({ ...valid, path: "initiated" })).not.toHaveProperty("path");
  });

  it.each([
    [{ ...valid, name: " " }, "Ingresa tu nombre y apellido"],
    [{ ...valid, name: "x".repeat(81) }, "El nombre no puede superar 80 caracteres"],
    [{ ...valid, password: "corta", confirmPassword: "corta" }, "La contraseña debe tener al menos 8 caracteres"],
    [
      { ...valid, password: "x".repeat(129), confirmPassword: "x".repeat(129) },
      "La contraseña no puede superar 128 caracteres",
    ],
    [{ ...valid, confirmPassword: "otra-cosa" }, "Las contraseñas no coinciden"],
    [{ ...valid, acceptTerms: false }, "Debes aceptar los Términos y la Política de privacidad"],
  ])("rejects %j with its message", (values, message) => {
    expect(firstMessage(values)).toBe(message);
  });
});
