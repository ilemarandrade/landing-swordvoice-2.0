import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/common/api/ApiError";

// Un 4xx no se reintenta: no se arregla repitiendo la misma petición.
export function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status <= 499) {
    return false;
  }
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: shouldRetry },
      mutations: { retry: 0 },
    },
  });
}
