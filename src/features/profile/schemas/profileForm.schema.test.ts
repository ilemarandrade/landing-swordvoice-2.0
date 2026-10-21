import { describe, expect, it } from "vitest";
import { profileFormSchema } from "@/features/profile/schemas/profileForm.schema";

const empty = {
  name: "Ana Pérez",
  bio: "",
  githubUrl: "",
  portfolioUrl: "",
  linkedinUrl: "",
  freeCodeCampUsername: "",
  professionalTitle: "",
  shortDescription: "",
  experienceStartedAt: "",
};

function firstMessage(values: unknown) {
  const result = profileFormSchema.safeParse(values);
  return result.success ? null : result.error.issues[0]?.message;
}

// Fecha AAAA-MM-DD en UTC, desplazada `days` días desde hoy.
function utcDay(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

describe("profileFormSchema", () => {
  it("accepts empty optional fields (they mean delete)", () => {
    expect(profileFormSchema.safeParse(empty).success).toBe(true);
  });

  it("accepts valid values", () => {
    expect(
      profileFormSchema.safeParse({
        ...empty,
        githubUrl: "https://github.com/ana-dev",
        linkedinUrl: "https://linkedin.com/in/ana-perez/",
        portfolioUrl: "https://ana.dev",
        freeCodeCampUsername: "Ana_Dev",
      }).success,
    ).toBe(true);
  });

  it("accepts bio of 1500 characters and shortDescription of 150", () => {
    expect(
      profileFormSchema.safeParse({
        ...empty,
        bio: "x".repeat(1500),
        shortDescription: "x".repeat(150),
      }).success,
    ).toBe(true);
  });

  it.each([
    [{ ...empty, name: "  " }, "Ingresa tu nombre"],
    [{ ...empty, name: "x".repeat(81) }, "El nombre no puede superar 80 caracteres"],
    [{ ...empty, bio: "x".repeat(1501) }, "La bio no puede superar 1500 caracteres"],
    [{ ...empty, githubUrl: "https://gitlab.com/ana" }, "Usa el formato https://github.com/tu-usuario"],
    [{ ...empty, githubUrl: "https://github.com/ana/repo" }, "Usa el formato https://github.com/tu-usuario"],
    [{ ...empty, linkedinUrl: "https://www.linkedin.com/company/x" }, "Usa el formato https://www.linkedin.com/in/tu-perfil"],
    [{ ...empty, portfolioUrl: "http://ana.dev" }, "Usa una URL que empiece por https://"],
    [{ ...empty, portfolioUrl: `https://${"a".repeat(300)}.dev` }, "La URL no puede superar 300 caracteres"],
    [{ ...empty, freeCodeCampUsername: "ab" }, "Entre 3 y 30 caracteres: letras, números, - o _"],
    [{ ...empty, freeCodeCampUsername: "ana dev" }, "Entre 3 y 30 caracteres: letras, números, - o _"],
    [{ ...empty, professionalTitle: "x".repeat(81) }, "El título no puede superar 80 caracteres"],
    [{ ...empty, shortDescription: "x".repeat(151) }, "La descripción no puede superar 150 caracteres"],
  ])("rejects %j with its message", (values, message) => {
    expect(firstMessage(values)).toBe(message);
  });

  it.each([
    ["", "vacío"],
    ["2019-03-15", "fecha pasada"],
  ])("accepts experienceStartedAt %j (%s)", (value) => {
    expect(
      profileFormSchema.safeParse({ ...empty, experienceStartedAt: value }).success,
    ).toBe(true);
  });

  it("accepts experienceStartedAt for today (UTC)", () => {
    expect(
      profileFormSchema.safeParse({ ...empty, experienceStartedAt: utcDay(0) }).success,
    ).toBe(true);
  });

  it.each([
    ["2019-13-40", "mes y día fuera de rango"],
    ["2019-02-30", "día que no existe en ese mes"],
    ["15/03/2019", "formato no ISO"],
  ])("rejects experienceStartedAt %j (%s) as invalid date", (value) => {
    expect(firstMessage({ ...empty, experienceStartedAt: value })).toBe(
      "Usa una fecha válida",
    );
  });

  it("rejects experienceStartedAt for tomorrow (UTC) as future", () => {
    expect(
      firstMessage({ ...empty, experienceStartedAt: utcDay(1) }),
    ).toBe("La fecha no puede ser futura");
  });
});
