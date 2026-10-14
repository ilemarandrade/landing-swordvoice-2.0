import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { request } from "@/common/api/httpClient";

const okSchema = z.object({ ok: z.literal(true) });

function mockFetch(result: Response | Error) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
}

describe("request", () => {
  it("sends a JSON body and returns the parsed response", async () => {
    const fetchSpy = mockFetch(Response.json({ ok: true }));

    await expect(
      request("/api/x", { method: "POST", body: { a: 1 }, schema: okSchema }),
    ).resolves.toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledWith("/api/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1 }),
    });
  });

  it("defaults to GET without body or headers", async () => {
    const fetchSpy = mockFetch(Response.json({ ok: true }));

    await request("/api/x", { schema: okSchema });
    expect(fetchSpy).toHaveBeenCalledWith("/api/x", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });
  });

  it("throws ApiError with the server message on non-2xx", async () => {
    mockFetch(
      Response.json({ message: "No se pudo enviar el mensaje" }, { status: 500 }),
    );

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      message: "No se pudo enviar el mensaje",
    });
  });

  it("uses the generic message when the error body is not JSON", async () => {
    mockFetch(new Response("boom", { status: 502 }));

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      status: 502,
      message: "Ha ocurrido un error",
    });
  });

  it("throws ApiError when a 2xx response does not match the schema", async () => {
    mockFetch(Response.json({ ok: false }));

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      status: 200,
      message: "Respuesta inválida del servidor",
    });
  });

  it("throws ApiError with status 0 on network failure", async () => {
    mockFetch(new TypeError("Failed to fetch"));

    await expect(request("/api/x", { schema: okSchema })).rejects.toMatchObject({
      status: 0,
      message: "No se pudo conectar con el servidor",
    });
  });
});
