import { describe, expect, it } from "vitest";
import { resetPasswordSchema } from "@/features/auth/schemas/resetPassword.schema";

describe("resetPasswordSchema", () => {
  it("accepts matching passwords of 8 characters", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "nuevaclave", confirmPassword: "nuevaclave" }).success,
    ).toBe(true);
  });

  it.each([
    [{ password: "corta", confirmPassword: "corta" }, "La contraseña debe tener al menos 8 caracteres"],
    [{ password: "nuevaclave", confirmPassword: "" }, "Confirma tu contraseña"],
    [{ password: "nuevaclave", confirmPassword: "distinta1" }, "Las contraseñas no coinciden"],
  ])("rejects %j with its message", (values, message) => {
    const result = resetPasswordSchema.safeParse(values);
    expect(result.success ? null : result.error.issues[0]?.message).toBe(message);
  });
});
