import { describe, expect, it } from "vitest";
import { contactSchema } from "@/features/home/schemas/contact.schema";

const valid = { name: "Ana Pérez", email: "ana@mail.com", message: "Hola" };

function firstMessage(input: unknown) {
  const result = contactSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0].message;
}

describe("contactSchema", () => {
  it("accepts and trims valid data", () => {
    expect(
      contactSchema.parse({
        name: "  Ana Pérez ",
        email: " ana@mail.com ",
        message: " Hola ",
      }),
    ).toEqual(valid);
  });

  it("rejects a whitespace-only name", () => {
    expect(firstMessage({ ...valid, name: "   " })).toBe(
      "Ingresa tu nombre y apellido",
    );
  });

  it("rejects an invalid email", () => {
    expect(firstMessage({ ...valid, email: "ana@" })).toBe(
      "Ingresa un correo electrónico válido",
    );
  });

  it("rejects an empty message", () => {
    expect(firstMessage({ ...valid, message: "" })).toBe("Escribe un mensaje");
  });

  it("rejects messages over 2000 characters", () => {
    expect(firstMessage({ ...valid, message: "a".repeat(2001) })).toBe(
      "El mensaje no puede superar 2000 caracteres",
    );
  });

  it("rejects names over 120 characters", () => {
    expect(firstMessage({ ...valid, name: "a".repeat(121) })).toBe(
      "El nombre no puede superar 120 caracteres",
    );
  });
});
