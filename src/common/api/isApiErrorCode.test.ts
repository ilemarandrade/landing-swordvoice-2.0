import { describe, expect, it } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";

describe("isApiErrorCode", () => {
  it("matches an ApiError with that code", () => {
    expect(isApiErrorCode(new ApiError(409, "x", "EMAIL_TAKEN"), "EMAIL_TAKEN")).toBe(true);
  });

  it("does not match another code, a missing code or a plain error", () => {
    expect(isApiErrorCode(new ApiError(409, "x", "OTHER"), "EMAIL_TAKEN")).toBe(false);
    expect(isApiErrorCode(new ApiError(409, "x"), "EMAIL_TAKEN")).toBe(false);
    expect(isApiErrorCode(new Error("x"), "EMAIL_TAKEN")).toBe(false);
    expect(isApiErrorCode(null, "EMAIL_TAKEN")).toBe(false);
  });
});
