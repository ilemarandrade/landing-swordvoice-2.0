import { describe, expect, it, vi } from "vitest";
import { publicEnvSchema } from "@/common/config/publicEnv";

describe("publicEnvSchema", () => {
  it("keeps a configured client ID", () => {
    expect(
      publicEnvSchema.parse({ NEXT_PUBLIC_GOOGLE_CLIENT_ID: "abc.apps.googleusercontent.com" })
        .NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    ).toBe("abc.apps.googleusercontent.com");
  });

  it.each([undefined, "", "   "])("treats %j as not configured", (value) => {
    expect(
      publicEnvSchema.parse({ NEXT_PUBLIC_GITHUB_CLIENT_ID: value }).NEXT_PUBLIC_GITHUB_CLIENT_ID,
    ).toBeUndefined();
  });
});

describe("publicEnv (build-time values)", () => {
  it("does not throw when client IDs are defined as empty strings", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_GITHUB_CLIENT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_LINKEDIN_CLIENT_ID", "");
    vi.resetModules();

    const { publicEnv } = await import("@/common/config/publicEnv");

    expect(publicEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID).toBeUndefined();
    expect(publicEnv.NEXT_PUBLIC_GITHUB_CLIENT_ID).toBeUndefined();
    expect(publicEnv.NEXT_PUBLIC_LINKEDIN_CLIENT_ID).toBeUndefined();
  });
});
