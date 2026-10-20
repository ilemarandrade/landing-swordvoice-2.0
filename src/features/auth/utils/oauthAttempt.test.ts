import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  saveOAuthAttempt,
  takeOAuthAttempt,
} from "@/features/auth/utils/oauthAttempt";

describe("oauthAttempt", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns the saved attempt once and then null", () => {
    saveOAuthAttempt({ provider: "google", state: "s1", codeVerifier: "v1" });
    expect(takeOAuthAttempt()).toMatchObject({
      provider: "google",
      state: "s1",
      codeVerifier: "v1",
    });
    expect(takeOAuthAttempt()).toBeNull();
  });

  it("discards an attempt older than 10 minutes", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(0);
    saveOAuthAttempt({ provider: "github", state: "s1" });
    now.mockReturnValue(10 * 60 * 1000 + 1);
    expect(takeOAuthAttempt()).toBeNull();
  });

  it("keeps an attempt that is exactly 10 minutes old", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(0);
    saveOAuthAttempt({ provider: "github", state: "s1" });
    now.mockReturnValue(10 * 60 * 1000);
    expect(takeOAuthAttempt()).toMatchObject({ provider: "github", state: "s1" });
  });

  it("removes an expired attempt from storage when it is read", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(0);
    saveOAuthAttempt({ provider: "github", state: "s1" });
    now.mockReturnValue(10 * 60 * 1000 + 1);
    takeOAuthAttempt();
    expect(sessionStorage.getItem("sv-oauth")).toBeNull();
  });

  it("returns null for corrupted content", () => {
    sessionStorage.setItem("sv-oauth", "{not json");
    expect(takeOAuthAttempt()).toBeNull();
    sessionStorage.setItem(
      "sv-oauth",
      JSON.stringify({ provider: "twitter", state: "s" }),
    );
    expect(takeOAuthAttempt()).toBeNull();
  });

  it("does not throw when sessionStorage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() =>
      saveOAuthAttempt({ provider: "google", state: "s1" }),
    ).not.toThrow();
    expect(takeOAuthAttempt()).toBeNull();
  });

  it("returns null without throwing when reading sessionStorage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(takeOAuthAttempt()).toBeNull();
  });
});
