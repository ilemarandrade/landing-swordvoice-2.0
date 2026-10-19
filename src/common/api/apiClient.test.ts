import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { toApiError, unwrapEnvelope } from "@/common/api/apiClient";
import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

function axiosErrorWithResponse(status: number, data: unknown): AxiosError {
  const response = {
    status,
    statusText: "",
    headers: {},
    data,
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse;
  return new AxiosError(
    "fail",
    "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    response,
  );
}

describe("unwrapEnvelope", () => {
  it("returns data from the { statusCode, message, data } envelope", () => {
    expect(
      unwrapEnvelope({ statusCode: 200, message: "ok", data: { id: "1" } }),
    ).toEqual({ id: "1" });
  });

  it("returns an object payload unchanged when there is no envelope", () => {
    const payload = { id: "1" };
    expect(unwrapEnvelope(payload)).toBe(payload);
  });

  it("returns a string payload unchanged when there is no envelope", () => {
    expect(unwrapEnvelope("hola")).toBe("hola");
  });

  it("returns null unchanged when there is no envelope", () => {
    expect(unwrapEnvelope(null)).toBeNull();
  });
});

describe("toApiError", () => {
  it("maps an HTTP error response to ApiError with message and errorCode", () => {
    const error = toApiError(
      axiosErrorWithResponse(404, {
        message: "El path no existe",
        errorCode: "PATH_NOT_FOUND",
      }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      message: "El path no existe",
      errorCode: "PATH_NOT_FOUND",
    });
  });

  it("uses the generic message when the error response data is not an object", () => {
    const error = toApiError(axiosErrorWithResponse(502, "<html>Bad Gateway</html>"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 502,
      message: GENERIC_ERROR_MESSAGE,
    });
  });

  it("maps an AxiosError without response (network or timeout) to status 0", () => {
    const axiosError = new AxiosError("Network Error", "ERR_NETWORK");

    const error = toApiError(axiosError);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      message: NETWORK_ERROR_MESSAGE,
    });
  });

  it("maps a plain Error to status 0 with the network message", () => {
    const error = toApiError(new Error("boom"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      message: NETWORK_ERROR_MESSAGE,
    });
  });
});
