import { describe, expect, it } from "vitest";
import { oauthRedirectUri } from "@/features/auth/utils/oauthRedirectUri";

describe("oauthRedirectUri", () => {
  it("is the current origin plus /auth/callback", () => {
    expect(oauthRedirectUri()).toBe(`${window.location.origin}/auth/callback`);
  });
});
