import { describe, expect, it } from "vitest";
import { getInitials } from "@/common/utils/getInitials";

describe("getInitials", () => {
  it.each([
    ["Ana Pérez", "AP"],
    ["ana maría pérez", "AM"],
    ["  Ana  ", "A"],
    ["", "SV"],
  ])("%j → %s", (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });
});
