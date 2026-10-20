import { describe, expect, it } from "vitest";
import { verifyEmailSchema } from "@/features/auth/schemas/verifyEmail.schema";

describe("verifyEmailSchema", () => {
  it("accepts any non-empty password up to 128 characters", () => {
    expect(verifyEmailSchema.safeParse({ password: "x" }).success).toBe(true);
    expect(verifyEmailSchema.safeParse({ password: "x".repeat(128) }).success).toBe(true);
  });

  it.each([
    ["", "Ingresa tu contraseña"],
    ["x".repeat(129), "La contraseña no puede superar 128 caracteres"],
  ])("rejects %j with its message", (password, message) => {
    const result = verifyEmailSchema.safeParse({ password });
    expect(result.success ? null : result.error.issues[0]?.message).toBe(message);
  });
});
