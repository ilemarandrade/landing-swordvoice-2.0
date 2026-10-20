import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { uploadToSignedUrl } from "@/common/api/uploadToSignedUrl";
import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

const blob = new Blob(["x"], { type: "image/webp" });
const url = "https://r2.example.com/profiles/u/p.webp?X-Amz-Signature=abc";

describe("uploadToSignedUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("PUTs the blob with its Content-Type and no Authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await uploadToSignedUrl(url, blob);
    expect(fetchMock).toHaveBeenCalledWith(url, {
      method: "PUT",
      headers: { "Content-Type": "image/webp" },
      body: blob,
    });
  });

  it("fails with the storage status when the response is not OK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    await expect(uploadToSignedUrl(url, blob)).rejects.toMatchObject({
      status: 403,
      errorCode: "SIGNED_UPLOAD_FAILED",
    });
  });

  it("fails with status 0 when the request is blocked (CORS or offline)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(uploadToSignedUrl(url, blob)).rejects.toMatchObject({
      status: 0,
      errorCode: "SIGNED_UPLOAD_FAILED",
    });
  });

  it("throws an ApiError with the network message when the request is blocked", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await uploadToSignedUrl(url, blob).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ message: NETWORK_ERROR_MESSAGE });
  });

  it("throws an ApiError with the generic message on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    const error = await uploadToSignedUrl(url, blob).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ message: GENERIC_ERROR_MESSAGE, status: 500 });
  });

  it("resolves without a value when the upload succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
    await expect(uploadToSignedUrl(url, blob)).resolves.toBeUndefined();
  });
});
