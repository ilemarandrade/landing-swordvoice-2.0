import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { refreshSession } from "@/common/api/refreshSession";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";

vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

const rotated = { accessToken: "a2", refreshToken: "r2", expiresIn: 900 };

describe("refreshSession", () => {
  beforeEach(() => {
    localStorage.clear();
    saveTokens({ accessToken: "a1", refreshToken: "r1", expiresIn: 900 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rotates the pair with the stored refresh token", async () => {
    const requestTokens = vi.fn().mockResolvedValue(rotated);
    await refreshSession("a1", requestTokens);
    expect(requestTokens).toHaveBeenCalledWith("r1");
    expect(getTokens()).toMatchObject({ accessToken: "a2", refreshToken: "r2" });
  });

  it("shares one request between concurrent calls", async () => {
    const requestTokens = vi.fn().mockResolvedValue(rotated);
    await Promise.all([
      refreshSession("a1", requestTokens),
      refreshSession("a1", requestTokens),
      refreshSession("a1", requestTokens),
    ]);
    expect(requestTokens).toHaveBeenCalledTimes(1);
  });

  it("does not call the API when another tab already rotated the token", async () => {
    // Adaptado: el almacenamiento ya contiene el par rotado por otra pestaña.
    saveTokens(rotated);
    const requestTokens = vi.fn().mockResolvedValue(rotated);
    await refreshSession("a1", requestTokens);
    expect(requestTokens).not.toHaveBeenCalled();
    expect(getTokens()).toMatchObject({ accessToken: "a2", refreshToken: "r2" });
  });

  it("runs inside the sv-auth-refresh lock when navigator.locks exists", async () => {
    const request = vi.fn((_name: string, task: () => Promise<void>) => task());
    vi.stubGlobal("navigator", { ...navigator, locks: { request } });
    await refreshSession("a1", vi.fn().mockResolvedValue(rotated));
    expect(request).toHaveBeenCalledWith("sv-auth-refresh", expect.any(Function));
  });

  it("clears the session and notifies when the refresh token is rejected", async () => {
    const rejected = new ApiError(401, "x", "INVALID_REFRESH_TOKEN");
    await expect(
      refreshSession("a1", vi.fn().mockRejectedValue(rejected)),
    ).rejects.toBe(rejected);
    expect(getTokens()).toBeNull();
    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tu sesión expiró, inicia sesión de nuevo" }),
    );
  });

  it("keeps the tokens when the refresh fails without connection", async () => {
    const offline = new ApiError(0, "No se pudo conectar con el servidor");
    await expect(
      refreshSession("a1", vi.fn().mockRejectedValue(offline)),
    ).rejects.toBe(offline);
    expect(getTokens()).toMatchObject({ accessToken: "a1" });
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("keeps the tokens when the refresh fails with a 5xx", async () => {
    // Añadido: la spec pide conservar la sesión ante 5xx, no solo ante red.
    const serverError = new ApiError(503, "Ha ocurrido un error");
    await expect(
      refreshSession("a1", vi.fn().mockRejectedValue(serverError)),
    ).rejects.toBe(serverError);
    expect(getTokens()).toMatchObject({ accessToken: "a1" });
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("rejects with 401 and calls nothing when there is no session", async () => {
    localStorage.clear();
    const requestTokens = vi.fn();
    await expect(refreshSession("a1", requestTokens)).rejects.toMatchObject({ status: 401 });
    expect(requestTokens).not.toHaveBeenCalled();
  });
});
