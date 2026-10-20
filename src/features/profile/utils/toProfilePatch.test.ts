import { describe, expect, it } from "vitest";
import { toProfileFormValues, toProfilePatch } from "@/features/profile/utils/toProfilePatch";

const values = {
  name: "Ana Pérez",
  bio: "",
  githubUrl: "https://github.com/ana",
  portfolioUrl: "",
  linkedinUrl: "",
  freeCodeCampUsername: "ana-dev",
  professionalTitle: "Frontend Developer",
  shortDescription: "",
};

describe("toProfilePatch", () => {
  it("sends only the modified fields", () => {
    expect(toProfilePatch(values, { githubUrl: true }, { isMentor: false })).toEqual({
      githubUrl: "https://github.com/ana",
    });
  });

  it("sends an emptied field as null", () => {
    expect(toProfilePatch(values, { bio: true }, { isMentor: false })).toEqual({ bio: null });
  });

  it("sends the name as a string", () => {
    expect(toProfilePatch(values, { name: true }, { isMentor: false })).toEqual({ name: "Ana Pérez" });
  });

  it("returns an empty patch without changes", () => {
    expect(toProfilePatch(values, {}, { isMentor: true })).toEqual({});
  });

  it("skips mentor fields for a non-mentor", () => {
    expect(
      toProfilePatch(values, { professionalTitle: true, shortDescription: true }, { isMentor: false }),
    ).toEqual({});
  });

  it("sends mentor fields for a mentor", () => {
    expect(
      toProfilePatch(values, { professionalTitle: true, shortDescription: true }, { isMentor: true }),
    ).toEqual({ professionalTitle: "Frontend Developer", shortDescription: null });
  });
});

describe("toProfileFormValues", () => {
  it("turns null into empty strings and keeps the name", () => {
    expect(
      toProfileFormValues({
        name: "Ana",
        photoUrl: "https://x/p.png",
        bio: null,
        githubUrl: null,
        portfolioUrl: null,
        linkedinUrl: null,
        freeCodeCampUsername: "ana",
        professionalTitle: null,
        shortDescription: null,
      }),
    ).toEqual({
      name: "Ana",
      bio: "",
      githubUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
      freeCodeCampUsername: "ana",
      professionalTitle: "",
      shortDescription: "",
    });
  });
});
