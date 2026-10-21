import { describe, expect, it } from "vitest";
import { newPasswordField } from "@/features/auth/schemas/authFields.schema";

describe("newPasswordField", () => {
  it("keeps leading and trailing spaces", () => {
    expect(newPasswordField.parse("  abcdefgh  ")).toBe("  abcdefgh  ");
  });

  it("counts spaces toward the minimum instead of trimming them", () => {
    expect(newPasswordField.safeParse("        ").success).toBe(true);
  });
});
