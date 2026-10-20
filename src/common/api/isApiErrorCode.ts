import { ApiError } from "@/common/api/ApiError";

export function isApiErrorCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.errorCode === code;
}
