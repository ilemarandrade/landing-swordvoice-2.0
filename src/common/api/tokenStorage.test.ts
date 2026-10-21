import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTokens,
  getTokens,
  saveTokens,
  subscribe,
} from "@/common/api/tokenStorage";

const tokens = { accessToken: "a1", refreshToken: "r1", expiresIn: 900 };

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(getTokens()).toBeNull();
  });

  it("saves the pair with expiresAt computed from expiresIn", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    saveTokens(tokens);
    expect(getTokens()).toEqual({
      accessToken: "a1",
      refreshToken: "r1",
      expiresAt: 1_000 + 900_000,
    });
  });

  it("clears the stored pair", () => {
    saveTokens(tokens);
    clearTokens();
    expect(getTokens()).toBeNull();
  });

  it.each([
    ["invalid JSON", "{not json"],
    ["a value that does not match the schema", JSON.stringify({ accessToken: "" })],
  ])("treats %s as no session", (_label, raw) => {
    localStorage.setItem("sv-auth", raw);
    expect(getTokens()).toBeNull();
  });

  it("returns null when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getTokens()).toBeNull();
  });

  it("notifies listeners on save and clear in this tab", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    saveTokens(tokens);
    clearTokens();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    saveTokens(tokens);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("notifies listeners when another tab changes sv-auth", () => {
    const listener = vi.fn();
    subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: "sv-auth" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "other-key" }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  // Extras: cobertura de los casos de borde del módulo.

  it("treats a sv-auth with a wrong field type as no session", () => {
    localStorage.setItem(
      "sv-auth",
      JSON.stringify({ accessToken: "a", refreshToken: "r", expiresAt: "tarde" }),
    );
    expect(getTokens()).toBeNull();
  });

  it("notifies listeners when another tab clears all storage (key null)", () => {
    const listener = vi.fn();
    subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("does not throw when localStorage rejects writes, and still notifies", () => {
    const listener = vi.fn();
    subscribe(listener);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => saveTokens(tokens)).not.toThrow();
    expect(() => clearTokens()).not.toThrow();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
