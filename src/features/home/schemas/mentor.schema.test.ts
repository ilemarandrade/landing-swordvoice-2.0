import { describe, expect, it } from "vitest";
import { mentorSchema, mentorsSchema } from "@/features/home/schemas/mentor.schema";

const valid = {
  id: "5b1f2c3d-0000-4000-8000-000000000001",
  name: "Ana Pérez",
  yearsOfExperience: 7,
  professionalTitle: "Ingeniera de software senior",
  shortDescription: "Backend y arquitectura en Node.js",
  bio: "Trabajo desde hace siete años en sistemas distribuidos.",
  photoUrl: "https://media.swordvoice.com/mentors/ana.png",
  linkedinUrl: "https://linkedin.com/in/ana-perez",
  githubUrl: "https://github.com/ana-perez",
  portfolioUrl: "https://ana.dev",
};

describe("mentorSchema", () => {
  it("accepts a complete mentor", () => {
    expect(mentorSchema.parse(valid)).toEqual(valid);
  });

  it("accepts null for each optional social link", () => {
    expect(
      mentorSchema.safeParse({
        ...valid,
        linkedinUrl: null,
        githubUrl: null,
        portfolioUrl: null,
      }).success,
    ).toBe(true);
  });

  it("accepts zero years of experience", () => {
    expect(mentorSchema.safeParse({ ...valid, yearsOfExperience: 0 }).success).toBe(
      true,
    );
  });

  it("rejects negative years of experience", () => {
    const result = mentorSchema.safeParse({ ...valid, yearsOfExperience: -1 });
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.map((issue) => issue.path[0]),
    ).toEqual(["yearsOfExperience"]);
  });

  it("rejects non-integer years of experience", () => {
    const result = mentorSchema.safeParse({ ...valid, yearsOfExperience: 1.5 });
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.map((issue) => issue.path[0]),
    ).toEqual(["yearsOfExperience"]);
  });

  it("rejects a null photoUrl because the photo is always present", () => {
    const result = mentorSchema.safeParse({ ...valid, photoUrl: null });
    expect(result.success).toBe(false);
    expect(
      !result.success && result.error.issues.map((issue) => issue.path[0]),
    ).toEqual(["photoUrl"]);
  });

  it("rejects a mentor without an id", () => {
    expect(mentorSchema.safeParse({ ...valid, id: undefined }).success).toBe(false);
  });
});

describe("mentorsSchema", () => {
  it("accepts an array of mentors", () => {
    expect(mentorsSchema.parse([valid, { ...valid, id: "other" }])).toHaveLength(2);
  });

  it("accepts an empty array", () => {
    expect(mentorsSchema.parse([])).toEqual([]);
  });

  it("rejects an array that contains an invalid mentor", () => {
    expect(mentorsSchema.safeParse([valid, { id: 1 }]).success).toBe(false);
  });
});
