import axios, { isAxiosError } from "axios";
import { ApiError } from "@/common/api/ApiError";
import { publicEnv } from "@/common/config/publicEnv";
import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

export const apiClient = axios.create({
  baseURL: publicEnv.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { "Accept-Language": "es" },
});

apiClient.interceptors.response.use(
  (response) => {
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  (error: unknown) => Promise.reject(toApiError(error)),
);

// La API responde { statusCode, message, data }: se devuelve solo `data`.
export function unwrapEnvelope(payload: unknown): unknown {
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

export function toApiError(error: unknown): ApiError {
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    return new ApiError(
      status,
      readString(data, "message") ?? GENERIC_ERROR_MESSAGE,
      readString(data, "errorCode"),
    );
  }
  return new ApiError(0, NETWORK_ERROR_MESSAGE);
}

function readString(data: unknown, key: string): string | undefined {
  if (typeof data === "object" && data !== null && key in data) {
    const value: unknown = (data as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}
