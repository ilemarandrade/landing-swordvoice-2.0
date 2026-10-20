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
};

function firstMessage(values: unknown) {
  const result = profileFormSchema.safeParse(values);
  return result.success ? null : result.error.issues[0]?.message;
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

  it.each([
    [{ ...empty, name: "  " }, "Ingresa tu nombre"],
    [{ ...empty, name: "x".repeat(81) }, "El nombre no puede superar 80 caracteres"],
    [{ ...empty, bio: "x".repeat(501) }, "La bio no puede superar 500 caracteres"],
    [{ ...empty, githubUrl: "https://gitlab.com/ana" }, "Usa el formato https://github.com/tu-usuario"],
    [{ ...empty, githubUrl: "https://github.com/ana/repo" }, "Usa el formato https://github.com/tu-usuario"],
    [{ ...empty, linkedinUrl: "https://www.linkedin.com/company/x" }, "Usa el formato https://www.linkedin.com/in/tu-perfil"],
    [{ ...empty, portfolioUrl: "http://ana.dev" }, "Usa una URL que empiece por https://"],
    [{ ...empty, portfolioUrl: `https://${"a".repeat(300)}.dev` }, "La URL no puede superar 300 caracteres"],
    [{ ...empty, freeCodeCampUsername: "ab" }, "Entre 3 y 30 caracteres: letras, números, - o _"],
    [{ ...empty, freeCodeCampUsername: "ana dev" }, "Entre 3 y 30 caracteres: letras, números, - o _"],
    [{ ...empty, professionalTitle: "x".repeat(81) }, "El título no puede superar 80 caracteres"],
    [{ ...empty, shortDescription: "x".repeat(281) }, "La descripción no puede superar 280 caracteres"],
  ])("rejects %j with its message", (values, message) => {
    expect(firstMessage(values)).toBe(message);
  });
});
