import { z } from "zod";
import { ApiError } from "@/common/api/ApiError";
import {
  GENERIC_ERROR_MESSAGE,
  INVALID_RESPONSE_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TSchema extends z.ZodType> = {
  method?: HttpMethod;
  body?: unknown;
  schema: TSchema;
};

export async function request<TSchema extends z.ZodType>(
  path: string,
  { method = "GET", body, schema }: RequestOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const hasBody = body !== undefined;
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      readMessage(data) ?? GENERIC_ERROR_MESSAGE,
    );
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(response.status, INVALID_RESPONSE_MESSAGE);
  }
  return parsed.data;
}

function readMessage(data: unknown): string | undefined {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }
  return undefined;
}
