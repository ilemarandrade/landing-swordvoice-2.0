import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTokens, saveTokens } from "@/common/api/tokenStorage";
import { useSession } from "@/common/hooks/useSession";

describe("useSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is anonymous without tokens", () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.status).toBe("anonymous");
  });

  it("follows the storage when tokens are saved and cleared", () => {
    const { result } = renderHook(() => useSession());
    act(() => saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 }));
    expect(result.current.status).toBe("authenticated");
    act(() => clearTokens());
    expect(result.current.status).toBe("anonymous");
  });

  // Extra: sv-auth corrupto no rompe el hook (review focus 5).
  it("is anonymous when sv-auth is corrupt", () => {
    localStorage.setItem("sv-auth", "{not json");
    const { result } = renderHook(() => useSession());
    expect(result.current.status).toBe("anonymous");
  });

  // Extra: otra pestaña guarda la sesión.
  it("becomes authenticated when another tab saves the session", () => {
    const { result } = renderHook(() => useSession());
    act(() => {
      localStorage.setItem(
        "sv-auth",
        JSON.stringify({ accessToken: "a", refreshToken: "r", expiresAt: Date.now() + 900_000 }),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: "sv-auth" }));
    });
    expect(result.current.status).toBe("authenticated");
  });
});
