import { describe, expect, it } from "vitest";
import { profileSchema } from "@/common/api/profile.schema";

const valid = {
  name: "Ana Pérez",
  academyRole: "MENTOR",
  photoUrl: null,
  bio: null,
  githubUrl: "https://github.com/ana",
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: "ana-dev",
  professionalTitle: null,
  shortDescription: null,
};

describe("profileSchema", () => {
  it("accepts a profile where every optional field is null", () => {
    expect(profileSchema.parse(valid)).toEqual(valid);
  });

  it("accepts a profile where the optional fields are filled", () => {
    const filled = {
      ...valid,
      photoUrl: "https://media.swordvoice.com/p.webp",
      bio: "Mentora de voz",
      professionalTitle: "Coach vocal",
      shortDescription: "Trabajo con actores",
    };
    expect(profileSchema.parse(filled)).toEqual(filled);
  });

  it("rejects a profile without name", () => {
    const withoutName: Partial<typeof valid> = { ...valid };
    delete withoutName.name;
    expect(profileSchema.safeParse(withoutName).success).toBe(false);
  });

  it("rejects a profile without academyRole", () => {
    const withoutRole: Partial<typeof valid> = { ...valid };
    delete withoutRole.academyRole;
    expect(profileSchema.safeParse(withoutRole).success).toBe(false);
  });

  it("rejects an unknown academyRole", () => {
    expect(profileSchema.safeParse({ ...valid, academyRole: "USER" }).success).toBe(false);
  });

  it("rejects a null name", () => {
    expect(profileSchema.safeParse({ ...valid, name: null }).success).toBe(false);
  });

  it("rejects an optional field that is neither string nor null", () => {
    expect(profileSchema.safeParse({ ...valid, bio: 42 }).success).toBe(false);
  });

  it("rejects a profile missing an optional key", () => {
    const withoutBio: Partial<typeof valid> = { ...valid };
    delete withoutBio.bio;
    expect(profileSchema.safeParse(withoutBio).success).toBe(false);
  });
});
