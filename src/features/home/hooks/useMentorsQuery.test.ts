import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { useMentorsQuery } from "@/features/home/hooks/useMentorsQuery";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

function ok(data: unknown): Awaited<ReturnType<typeof apiClient.get>> {
  return { data } as Awaited<ReturnType<typeof apiClient.get>>;
}

const validMentors = [
  {
    id: "mentor-1",
    name: "Ana Pérez",
    yearsOfExperience: 7,
    professionalTitle: "Ingeniera de software senior",
    shortDescription: "Backend y arquitectura",
    bio: "Trabajo desde hace siete años en sistemas distribuidos.",
    photoUrl: "https://media.swordvoice.com/mentors/ana.png",
    linkedinUrl: null,
    githubUrl: "https://github.com/ana-perez",
    portfolioUrl: null,
  },
];

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe("useMentorsQuery", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("returns the parsed mentors on success", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok(validMentors));

    const { result } = renderHook(() => useMentorsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(validMentors);
    expect(apiClient.get).toHaveBeenCalledWith("/mentors");
  });

  it("sets isError with the ApiError when the request fails with 503", async () => {
    const apiError = new ApiError(503, "x", "STORAGE_UNAVAILABLE");
    vi.mocked(apiClient.get).mockRejectedValue(apiError);

    const { result } = renderHook(() => useMentorsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(apiError);
    expect(result.current.error).toBeInstanceOf(ApiError);
  });

  it("sets isError with a ZodError when the payload does not match mentorsSchema", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(ok([{ id: 1 }]));

    const { result } = renderHook(() => useMentorsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.name).toBe("ZodError");
    expect(result.current.data).toBeUndefined();
  });
});
