import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiClient } from "@/common/api/axiosInstances";
import { request } from "@/common/api/httpClient";

vi.mock("@/common/api/axiosInstances", () => ({
  apiClient: { request: vi.fn() },
}));

const requestMock = vi.mocked(apiClient.request);
const okSchema = z.object({ ok: z.literal(true) });

function response(status: number, data: unknown): AxiosResponse {
  return { status, statusText: "", headers: {}, config: { headers: new AxiosHeaders() }, data };
}

function httpError(status: number, data: unknown) {
  return new AxiosError("fail", "ERR_BAD_RESPONSE", undefined, undefined, response(status, data));
}

describe("request", () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it("sends method, body and params to the axios instance", async () => {
    requestMock.mockResolvedValue(response(200, { ok: true }));

    await request("/x", { method: "POST", body: { a: 1 }, params: { page: 2 }, schema: okSchema });
    expect(requestMock).toHaveBeenCalledWith({ url: "/x", method: "POST", data: { a: 1 }, params: { page: 2 } });
  });

  it("unwraps the API envelope and validates data", async () => {
    requestMock.mockResolvedValue(response(200, { statusCode: 200, message: "ok", data: { ok: true } }));

    await expect(request("/x", { schema: okSchema })).resolves.toEqual({ ok: true });
  });

  it("validates bodies without envelope", async () => {
    requestMock.mockResolvedValue(response(200, { ok: true }));

    await expect(request("/x", { schema: okSchema })).resolves.toEqual({ ok: true });
  });

  it("throws ApiError with message and errorCode on HTTP errors", async () => {
    requestMock.mockRejectedValue(
      httpError(404, { statusCode: 404, message: "El path no existe", errorCode: "PATH_NOT_FOUND", errors: null }),
    );

    await expect(request("/x", { schema: okSchema })).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "El path no existe",
      errorCode: "PATH_NOT_FOUND",
    });
  });

  it("uses the generic message when the error body has no message", async () => {
    requestMock.mockRejectedValue(httpError(502, "boom"));

    await expect(request("/x", { schema: okSchema })).rejects.toMatchObject({ status: 502, message: "Ha ocurrido un error" });
  });

  it("throws ApiError when the data does not match the schema", async () => {
    requestMock.mockResolvedValue(response(200, { statusCode: 200, message: "ok", data: { ok: false } }));

    await expect(request("/x", { schema: okSchema })).rejects.toMatchObject({ status: 200, message: "Respuesta inválida del servidor" });
  });

  it("throws ApiError with status 0 on network failure", async () => {
    requestMock.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

    await expect(request("/x", { schema: okSchema })).rejects.toMatchObject({ status: 0, message: "No se pudo conectar con el servidor" });
  });
});
