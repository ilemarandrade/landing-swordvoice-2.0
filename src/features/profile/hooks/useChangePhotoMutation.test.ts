import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { uploadToSignedUrl } from "@/common/api/uploadToSignedUrl";
import { notifyError } from "@/common/errors/notifyError";
import { useChangePhotoMutation } from "@/features/profile/hooks/useChangePhotoMutation";
import {
  InvalidImageError,
  resizeImage,
} from "@/features/profile/utils/resizeImage";

vi.mock("@/common/api/apiClient", () => ({
  apiClient: { post: vi.fn(), put: vi.fn() },
}));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));
vi.mock("@/common/api/uploadToSignedUrl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/common/api/uploadToSignedUrl")>()),
  uploadToSignedUrl: vi.fn(),
}));
vi.mock("@/features/profile/utils/resizeImage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/profile/utils/resizeImage")>()),
  resizeImage: vi.fn(),
}));

const blob = new Blob(["w"], { type: "image/webp" });
const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
const key =
  "profiles/0192f6e2-8a7b-7c3d-9e4f-1a2b3c4d5e6f/0192f6e3-1b2c-7d3e-8f4a-5b6c7d8e9f00.webp";
const profile = {
  name: "Ana",
  photoUrl: `https://media.swordvoice.com/${key}`,
  bio: null,
  githubUrl: null,
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: null,
  professionalTitle: null,
  shortDescription: null,
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return {
    client,
    ...renderHook(() => useChangePhotoMutation(), { wrapper }),
  };
}

function lastNotifiedMessage() {
  const error = vi.mocked(notifyError).mock.calls.at(-1)?.[0];
  return error instanceof ApiError ? error.message : undefined;
}

describe("useChangePhotoMutation", () => {
  beforeEach(() => {
    vi.mocked(resizeImage).mockResolvedValue(blob);
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        uploadUrl: "https://r2.example.com/x?X-Amz-Signature=s",
        key,
        expiresIn: 300,
      },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    vi.mocked(uploadToSignedUrl).mockResolvedValue(undefined);
    vi.mocked(apiClient.put).mockResolvedValue({
      data: profile,
    } as Awaited<ReturnType<typeof apiClient.put>>);
  });

  it("requests the URL with the resized blob, uploads it and confirms the key", async () => {
    const { client, result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith(
      "/profiles/me/photo/upload-url",
      {
        contentType: "image/webp",
        size: blob.size,
      },
    );
    expect(uploadToSignedUrl).toHaveBeenCalledWith(
      "https://r2.example.com/x?X-Amz-Signature=s",
      blob,
    );
    expect(apiClient.put).toHaveBeenCalledWith("/profiles/me/photo", { key });
    expect(client.getQueryData(["profiles", "me"])).toEqual(profile);
  });

  it("shows the success toast once the key is confirmed", async () => {
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith("Foto actualizada");
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("does not confirm when the upload to storage fails (CORS)", async () => {
    vi.mocked(uploadToSignedUrl).mockRejectedValue(
      new ApiError(0, "x", "SIGNED_UPLOAD_FAILED"),
    );
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiClient.put).not.toHaveBeenCalled();
    expect(lastNotifiedMessage()).toBe(
      "No pudimos subir la foto. Inténtalo de nuevo.",
    );
  });

  it("shows the photo upload message when the browser blocks the PUT to R2 (real uploadToSignedUrl)", async () => {
    const actual = await vi.importActual<
      typeof import("@/common/api/uploadToSignedUrl")
    >("@/common/api/uploadToSignedUrl");
    vi.mocked(uploadToSignedUrl).mockImplementation(actual.uploadToSignedUrl);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiClient.put).not.toHaveBeenCalled();
    expect(lastNotifiedMessage()).toBe(
      "No pudimos subir la foto. Inténtalo de nuevo.",
    );
    vi.unstubAllGlobals();
  });

  it("shows the photo upload message when R2 answers with an error status (real uploadToSignedUrl)", async () => {
    const actual = await vi.importActual<
      typeof import("@/common/api/uploadToSignedUrl")
    >("@/common/api/uploadToSignedUrl");
    vi.mocked(uploadToSignedUrl).mockImplementation(actual.uploadToSignedUrl);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 403 })),
    );
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiClient.put).not.toHaveBeenCalled();
    expect(lastNotifiedMessage()).toBe(
      "No pudimos subir la foto. Inténtalo de nuevo.",
    );
    vi.unstubAllGlobals();
  });

  it("explains an invalid image without calling the API", async () => {
    vi.mocked(resizeImage).mockRejectedValue(new InvalidImageError());
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(lastNotifiedMessage()).toBe("Elige una imagen JPG, PNG o WebP");
  });

  it("does not upload or confirm when the upload-url response does not match the schema", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { uploadUrl: "no es una url", key, expiresIn: 300 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(uploadToSignedUrl).not.toHaveBeenCalled();
    expect(apiClient.put).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(lastNotifiedMessage()).toBeUndefined();
  });

  it("maps PHOTO_NOT_UPLOADED and keeps the API message for STORAGE_UNAVAILABLE", async () => {
    vi.mocked(apiClient.put).mockRejectedValueOnce(
      new ApiError(400, "x", "PHOTO_NOT_UPLOADED"),
    );
    const first = setup();
    act(() => first.result.current.mutate(file));
    await waitFor(() => expect(first.result.current.isError).toBe(true));
    expect(lastNotifiedMessage()).toBe(
      "No pudimos subir la foto. Inténtalo de nuevo.",
    );

    vi.mocked(apiClient.post).mockRejectedValueOnce(
      new ApiError(503, "El almacenamiento no está disponible", "STORAGE_UNAVAILABLE"),
    );
    const second = setup();
    act(() => second.result.current.mutate(file));
    await waitFor(() => expect(second.result.current.isError).toBe(true));
    expect(lastNotifiedMessage()).toBe("El almacenamiento no está disponible");
  });
});
