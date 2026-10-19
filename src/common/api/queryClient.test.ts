import { describe, expect, it } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { shouldRetry } from "@/common/api/queryClient";

describe("shouldRetry", () => {
  it.each([400, 404, 499])("does not retry a 4xx ApiError (%i)", (status) => {
    expect(shouldRetry(0, new ApiError(status, "x"))).toBe(false);
  });

  it.each([0, 1])("retries a 500 ApiError when failureCount is %i", (count) => {
    expect(shouldRetry(count, new ApiError(500, "x"))).toBe(true);
  });

  it.each([0, 1])("retries an ApiError with status 0 when failureCount is %i", (count) => {
    expect(shouldRetry(count, new ApiError(0, "x"))).toBe(true);
  });

  it.each([0, 1])("retries a plain Error when failureCount is %i", (count) => {
    expect(shouldRetry(count, new Error("boom"))).toBe(true);
  });

  it("stops retrying once failureCount reaches 2", () => {
    expect(shouldRetry(2, new ApiError(500, "x"))).toBe(false);
    expect(shouldRetry(2, new Error("boom"))).toBe(false);
  });
});
