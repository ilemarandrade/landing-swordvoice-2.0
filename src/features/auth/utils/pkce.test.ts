// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  createCodeChallenge,
  createCodeVerifier,
  createState,
} from "@/features/auth/utils/pkce";

describe("pkce", () => {
  it("creates a 43-character verifier from the allowed alphabet", () => {
    expect(createCodeVerifier()).toMatch(/^[A-Za-z0-9._~-]{43}$/);
  });

  it("creates a different state each time", () => {
    expect(createState()).not.toBe(createState());
  });

  it("derives the S256 challenge of the RFC 7636 example", async () => {
    await expect(
      createCodeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
    ).resolves.toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
});
