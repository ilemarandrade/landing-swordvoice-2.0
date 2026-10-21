import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient, toApiError, unwrapEnvelope } from "@/common/api/apiClient";
import { getTokens, saveTokens } from "@/common/api/tokenStorage";
import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));

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

type Reply = { status: number; data?: unknown };

const originalAdapter = apiClient.defaults.adapter;

function replyWith(handler: (config: InternalAxiosRequestConfig) => Reply) {
  apiClient.defaults.adapter = async (config) => {
    const { status, data } = handler(config);
    const response = {
      status,
      statusText: "",
      headers: {},
      data,
      config,
    } as AxiosResponse;
    if (status >= 400) {
      throw new AxiosError("fail", "ERR_BAD_REQUEST", config, null, response);
    }
    return response;
  };
}

const envelope = (data: unknown) => ({ statusCode: 200, message: "ok", data });
const newPair = { accessToken: "a2", refreshToken: "r2", expiresIn: 900 };
const unauthorized = { status: 401, data: { message: "No autenticado", errorCode: "UNAUTHENTICATED" } };

describe("apiClient auth interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    saveTokens({ accessToken: "a1", refreshToken: "r1", expiresIn: 900 });
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it("sends the stored access token as Bearer", async () => {
    let authorization: unknown;
    replyWith((config) => {
      authorization = config.headers.Authorization;
      return { status: 200, data: envelope({ ok: true }) };
    });
    await apiClient.get("/auth/me");
    expect(authorization).toBe("Bearer a1");
  });

  it("refreshes once and retries parallel requests that got 401", async () => {
    let refreshCalls = 0;
    replyWith((config) => {
      if (config.url === "/auth/refresh") {
        refreshCalls += 1;
        return { status: 200, data: envelope(newPair) };
      }
      return config.headers.Authorization === "Bearer a2"
        ? { status: 200, data: envelope({ url: config.url }) }
        : unauthorized;
    });

    const [first, second] = await Promise.all([
      apiClient.get("/a"),
      apiClient.get("/b"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(first.data).toEqual({ url: "/a" });
    expect(second.data).toEqual({ url: "/b" });
    expect(getTokens()).toMatchObject({ refreshToken: "r2" });
  });

  it("retries only once when the retried request is also 401", async () => {
    let meCalls = 0;
    replyWith((config) => {
      if (config.url === "/auth/refresh") return { status: 200, data: envelope(newPair) };
      meCalls += 1;
      return unauthorized;
    });
    await expect(apiClient.get("/auth/me")).rejects.toMatchObject({ status: 401 });
    expect(meCalls).toBe(2);
  });

  it.each(["/auth/login", "/auth/refresh", "/auth/logout"])(
    "does not try to refresh on a 401 from %s",
    async (url) => {
      const urls: string[] = [];
      replyWith((config) => {
        urls.push(config.url ?? "");
        return unauthorized;
      });
      await expect(apiClient.post(url, {})).rejects.toMatchObject({ status: 401 });
      expect(urls).toEqual([url]);
    },
  );

  it("rejects with status 0 and keeps the tokens when the refresh has no connection", async () => {
    replyWith((config) => {
      if (config.url === "/auth/refresh") throw new AxiosError("Network Error", "ERR_NETWORK");
      return unauthorized;
    });
    await expect(apiClient.get("/auth/me")).rejects.toMatchObject({ status: 0 });
    expect(getTokens()).toMatchObject({ accessToken: "a1" });
  });

  it("clears the session when the refresh token is rejected", async () => {
    replyWith(() => unauthorized);
    await expect(apiClient.get("/auth/me")).rejects.toMatchObject({ status: 401 });
    expect(getTokens()).toBeNull();
  });
});
