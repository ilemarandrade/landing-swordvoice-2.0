import axios, { isAxiosError } from "axios";
import { ApiError } from "@/common/api/ApiError";
import { authTokensSchema, type AuthTokens } from "@/common/api/auth.schema";
import { refreshSession } from "@/common/api/refreshSession";
import { getTokens } from "@/common/api/tokenStorage";
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

declare module "axios" {
  // InternalAxiosRequestConfig extiende AxiosRequestConfig: con la base basta para
  // tipar tanto la config interna del interceptor como la que pasa a request().
  interface AxiosRequestConfig {
    authRetried?: boolean;
  }
}

// Sobre estas rutas un 401 es la respuesta final: no se intenta renovar.
const NO_REFRESH_URLS = ["/auth/login", "/auth/refresh", "/auth/logout"];

apiClient.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens) config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return config;
});

apiClient.interceptors.response.use((response) => {
  response.data = unwrapEnvelope(response.data);
  return response;
}, retryAfterRefresh);

async function retryAfterRefresh(error: unknown) {
  const config = isAxiosError(error) ? error.config : undefined;
  if (
    !isAxiosError(error) ||
    error.response?.status !== 401 ||
    !config ||
    config.authRetried ||
    NO_REFRESH_URLS.includes(config.url ?? "")
  ) {
    throw toApiError(error);
  }
  try {
    await refreshSession(readBearer(config.headers.Authorization), requestTokens);
  } catch (refreshError) {
    // Un fallo de red al renovar llega como status 0 para que la query reintente.
    throw refreshError instanceof ApiError ? refreshError : toApiError(error);
  }
  // El interceptor de request pone el token nuevo.
  return apiClient.request({ ...config, authRetried: true });
}

async function requestTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await apiClient.post("/auth/refresh", { refreshToken });
  return authTokensSchema.parse(data);
}

function readBearer(header: unknown): string | undefined {
  return typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : undefined;
}

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
