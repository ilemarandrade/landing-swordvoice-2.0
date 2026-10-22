import { describe, expect, it } from "vitest";
import {
  mentorLandingFormSchema,
  mentorLandingSchema,
  toMentorLandingPatch,
} from "@/features/admin/schemas/mentorLanding.schema";

const ORDER_MESSAGE = "Usa un número entero entre 0 y 2147483647";

function formError(landingOrder: string) {
  const result = mentorLandingFormSchema.safeParse({
    showOnLanding: true,
    landingOrder,
  });
  return result.success ? undefined : result.error.issues[0].message;
}

describe("mentorLandingFormSchema", () => {
  it.each(["", "0", "3", "2147483647"])("accepts landingOrder %j", (value) => {
    expect(formError(value)).toBeUndefined();
  });

  it.each(["-1", "1.5", "2147483648", "abc"])(
    "rejects landingOrder %j with the exact message",
    (value) => {
      expect(formError(value)).toBe(ORDER_MESSAGE);
    },
  );

  it("trims surrounding whitespace before validating", () => {
    const result = mentorLandingFormSchema.safeParse({
      showOnLanding: false,
      landingOrder: "  4  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.landingOrder).toBe("4");
  });
});

describe("mentorLandingSchema", () => {
  it("accepts a null landingOrder", () => {
    expect(
      mentorLandingSchema.parse({ userId: "u1", showOnLanding: true, landingOrder: null }),
    ).toEqual({ userId: "u1", showOnLanding: true, landingOrder: null });
  });

  it("rejects a landingOrder above 2147483647", () => {
    const result = mentorLandingSchema.safeParse({
      userId: "u1",
      showOnLanding: true,
      landingOrder: 2147483648,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative or non-integer landingOrder", () => {
    expect(
      mentorLandingSchema.safeParse({ userId: "u1", showOnLanding: true, landingOrder: -1 }).success,
    ).toBe(false);
    expect(
      mentorLandingSchema.safeParse({ userId: "u1", showOnLanding: true, landingOrder: 1.5 }).success,
    ).toBe(false);
  });
});

describe("toMentorLandingPatch", () => {
  it("maps an empty landingOrder to null", () => {
    expect(toMentorLandingPatch({ showOnLanding: true, landingOrder: "" })).toEqual({
      showOnLanding: true,
      landingOrder: null,
    });
  });

  it("maps a padded number to a number", () => {
    expect(toMentorLandingPatch({ showOnLanding: false, landingOrder: " 3 " })).toEqual({
      showOnLanding: false,
      landingOrder: 3,
    });
  });
});
