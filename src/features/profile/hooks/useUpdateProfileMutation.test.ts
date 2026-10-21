import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useUpdateProfileMutation } from "@/features/profile/hooks/useUpdateProfileMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { patch: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const profile = {
  name: "Ana",
  photoUrl: null,
  bio: "Hola",
  githubUrl: null,
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: null,
  academyRole: "NEWCOMER",
  professionalTitle: null,
  shortDescription: null,
};

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, ...renderHook(() => useUpdateProfileMutation(), { wrapper }) };
}

describe("useUpdateProfileMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
  });

  it("patches, caches the profile and does not refetch /auth/me without a name change", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { client, invalidate, result } = setup();
    act(() => result.current.mutate({ bio: "Hola" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.patch).toHaveBeenCalledWith("/profiles/me", { bio: "Hola" });
    expect(client.getQueryData(["profiles", "me"])).toEqual(profile);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("refetches /auth/me when the name changes", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ name: "Ana" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
  });

  it("does not notify FREECODECAMP_USERNAME_TAKEN but notifies other errors", async () => {
    vi.mocked(apiClient.patch).mockRejectedValueOnce(new ApiError(409, "x", "FREECODECAMP_USERNAME_TAKEN"));
    const taken = setup();
    act(() => taken.result.current.mutate({ freeCodeCampUsername: "ana" }));
    await waitFor(() => expect(taken.result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();

    vi.mocked(apiClient.patch).mockRejectedValueOnce(new ApiError(500, "x"));
    const failing = setup();
    act(() => failing.result.current.mutate({ bio: "x" }));
    await waitFor(() => expect(failing.result.current.isError).toBe(true));
    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it("fails when the response does not match the schema", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { name: 1 } } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { result } = setup();
    act(() => result.current.mutate({ bio: "x" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
