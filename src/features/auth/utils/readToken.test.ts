import { describe, expect, it } from "vitest";
import { readToken } from "@/features/auth/utils/readToken";

describe("readToken", () => {
  it("returns a single token", () => {
    expect(readToken("abc")).toBe("abc");
  });

  it("accepts a token of exactly 200 characters", () => {
    const token = "x".repeat(200);
    expect(readToken(token)).toBe(token);
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["repeated", ["a", "b"]],
    ["longer than 200 characters", "x".repeat(201)],
  ])("returns null when the token is %s", (_label, value) => {
    expect(readToken(value)).toBeNull();
  });
});
