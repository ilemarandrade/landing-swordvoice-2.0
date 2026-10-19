import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError } from "@/common/api/ApiError";
import { request } from "@/common/api/httpClient";
import { publicEnv } from "@/common/config/publicEnv";

const base = publicEnv.NEXT_PUBLIC_API_URL;
const okSchema = z.object({ ok: z.literal(true) });

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), { status });
}

describe("request", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends method, JSON body, params and headers to fetch", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200, { ok: true }));

    await request("/x", { method: "POST", body: { a: 1 }, params: { page: 2 }, schema: okSchema });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${base}/x?page=2`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ a: 1 }),
        headers: expect.objectContaining({
          "Accept-Language": "es",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("sends no Content-Type and no body for a GET without body", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200, { ok: true }));

    await request("/x", { schema: okSchema });

    expect(fetchSpy).toHaveBeenCalledWith(`${base}/x`, expect.objectContaining({ method: "GET" }));
    const init = fetchSpy.mock.calls[0]?.[1];
    expect(init?.headers).toMatchObject({ "Accept-Language": "es" });
    expect(init?.headers).not.toHaveProperty("Content-Type");
    expect(init?.body).toBeUndefined();
  });

  it("unwraps the API envelope and validates data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(200, { statusCode: 200, message: "ok", data: { ok: true } }),
    );

    await expect(request("/x", { schema: okSchema })).resolves.toEqual({ ok: true });
  });

  it("validates bodies without envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, { ok: true }));

    await expect(request("/x", { schema: okSchema })).resolves.toEqual({ ok: true });
  });

  it("throws ApiError with message and errorCode on HTTP errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(404, {
        message: "El path no existe",
        errorCode: "PATH_NOT_FOUND",
      }),
    );

    const promise = request("/x", { schema: okSchema });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "El path no existe",
      errorCode: "PATH_NOT_FOUND",
    });
  });

  it("uses the generic message when the error body is not JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("boom", { status: 502 }));

    await expect(request("/x", { schema: okSchema })).rejects.toMatchObject({
      status: 502,
      message: "Ha ocurrido un error",
    });
  });

  it("throws ApiError when the data does not match the schema", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(200, { statusCode: 200, message: "ok", data: { ok: false } }),
    );

    await expect(request("/x", { schema: okSchema })).rejects.toMatchObject({
      status: 200,
      message: "Respuesta inválida del servidor",
    });
  });

  it("throws ApiError with status 0 on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(request("/x", { schema: okSchema })).rejects.toMatchObject({
      status: 0,
      message: "No se pudo conectar con el servidor",
    });
  });
});
