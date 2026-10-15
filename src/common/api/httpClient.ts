import { isAxiosError, type AxiosResponse } from "axios";
import { z } from "zod";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/axiosInstances";
import {
  GENERIC_ERROR_MESSAGE,
  INVALID_RESPONSE_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

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
  let response: AxiosResponse<unknown>;
  try {
    response = await apiClient.request<unknown>({
      url: path,
      method,
      data: body,
      params,
    });
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      throw new ApiError(
        status,
        readString(data, "message") ?? GENERIC_ERROR_MESSAGE,
        readString(data, "errorCode"),
      );
    }
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const parsed = schema.safeParse(unwrapEnvelope(response.data));
  if (!parsed.success) {
    throw new ApiError(response.status, INVALID_RESPONSE_MESSAGE);
  }
  return parsed.data;
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
