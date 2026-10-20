import { describe, expect, it } from "vitest";
import { readSearchParam } from "@/features/auth/utils/readSearchParam";

describe("readSearchParam", () => {
  it("returns a single value", () => {
    expect(readSearchParam("4/0AVMBsJh")).toBe("4/0AVMBsJh");
  });

  it.each([undefined, "", ["a", "b"]])("returns null for %j", (value) => {
    expect(readSearchParam(value)).toBeNull();
  });
});
