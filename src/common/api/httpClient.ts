import { z } from "zod";
import { ApiError } from "@/common/api/ApiError";
import { publicEnv } from "@/common/config/publicEnv";
import {
  GENERIC_ERROR_MESSAGE,
  INVALID_RESPONSE_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

const REQUEST_TIMEOUT_MS = 10_000;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TSchema extends z.ZodType> = {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number>;
  schema: TSchema;
};

export async function request<TSchema extends z.ZodType>(
  path: string,
  { method = "GET", body, params, schema }: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const search = params
    ? new URLSearchParams(
        Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
      ).toString()
    : "";
  const url = `${publicEnv.NEXT_PUBLIC_API_URL}${path}${search ? `?${search}` : ""}`;

  const headers: Record<string, string> = { "Accept-Language": "es" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const data = await readJson(response);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      readString(data, "message") ?? GENERIC_ERROR_MESSAGE,
      readString(data, "errorCode"),
    );
  }

  const parsed = schema.safeParse(unwrapEnvelope(data));
  if (!parsed.success) {
    throw new ApiError(response.status, INVALID_RESPONSE_MESSAGE);
  }
  return parsed.data;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

// La API responde { statusCode, message, data }: se valida solo `data`.
function unwrapEnvelope(payload: unknown): unknown {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "statusCode" in payload &&
    "data" in payload
  ) {
    return payload.data;
  }
  return payload;
}

function readString(data: unknown, key: string): string | undefined {
  if (typeof data === "object" && data !== null && key in data) {
    const value: unknown = (data as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}
