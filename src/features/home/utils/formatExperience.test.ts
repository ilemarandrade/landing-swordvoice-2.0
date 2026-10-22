import { describe, expect, it } from "vitest";
import { formatExperience } from "@/features/home/utils/formatExperience";

describe("formatExperience", () => {
  it("devuelve 'Menos de un año de experiencia' para 0 años", () => {
    expect(formatExperience(0)).toBe("Menos de un año de experiencia");
  });

  it("usa el singular para 1 año", () => {
    expect(formatExperience(1)).toBe("1 año de experiencia");
  });

  it("usa el plural para más de un año", () => {
    expect(formatExperience(7)).toBe("7 años de experiencia");
  });
});
