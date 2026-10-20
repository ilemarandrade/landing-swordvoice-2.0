import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { saveTokens } from "@/common/api/tokenStorage";
import { useProfileQuery } from "@/common/hooks/useProfileQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function createTestClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function wrapper({ children }: { children: ReactNode }) {
  const client = createTestClient();
  return createElement(QueryClientProvider, { client }, children);
}

const profile = {
  name: "Ana Pérez",
  photoUrl: null,
  bio: null,
  githubUrl: "https://github.com/ana",
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: "ana-dev",
  professionalTitle: null,
  shortDescription: null,
};

describe("useProfileQuery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.get).mockReset();
  });

  it("does not request the profile without a session", () => {
    renderHook(() => useProfileQuery(), { wrapper });
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("returns the parsed profile", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.get>>);
    const { result } = renderHook(() => useProfileQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/profiles/me");
    expect(result.current.data).toEqual(profile);
  });

  it("exposes the ApiError and rejects an invalid response", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockRejectedValueOnce(new ApiError(500, "x"));
    const failing = renderHook(() => useProfileQuery(), { wrapper });
    await waitFor(() => expect(failing.result.current.error).toBeInstanceOf(ApiError));

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { name: 1 } } as Awaited<ReturnType<typeof apiClient.get>>);
    const invalid = renderHook(() => useProfileQuery(), { wrapper });
    await waitFor(() => expect(invalid.result.current.isError).toBe(true));
  });

  it("stores the profile under the ['profiles', 'me'] key", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.get>>);
    const client = createTestClient();
    const keyWrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(() => useProfileQuery(), { wrapper: keyWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(["profiles", "me"])).toEqual(profile);
  });
});
