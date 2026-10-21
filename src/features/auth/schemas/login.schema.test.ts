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
