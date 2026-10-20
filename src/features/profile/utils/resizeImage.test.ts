import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  InvalidImageError,
  resizeImage,
} from "@/features/profile/utils/resizeImage";

type Canvas = {
  width: number;
  height: number;
  getContext: () => { drawImage: () => void };
  toBlob: ReturnType<typeof vi.fn>;
};

let canvas: Canvas;

function stubBitmap(width: number, height: number) {
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width, height, close: vi.fn() }),
  );
}

function blobsFor(map: Record<string, Blob | null>) {
  canvas.toBlob.mockImplementation(
    (resolve: (blob: Blob | null) => void, type: string) =>
      resolve(map[type] ?? null),
  );
}

// Blob de tamaño exacto, para probar el límite de 2 MB (2 097 152 bytes).
function blobOfSize(size: number, type: string) {
  return new Blob([new Uint8Array(size)], { type });
}

const MAX_BYTES = 2 * 1024 * 1024;
const photo = new File(["x"], "foto.jpg", { type: "image/jpeg" });

describe("resizeImage", () => {
  beforeEach(() => {
    canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: vi.fn() }),
      toBlob: vi.fn(),
    };
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) =>
      tag === "canvas"
        ? (canvas as unknown as HTMLCanvasElement)
        : createElement(tag),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("scales the longest side to 512 keeping the ratio and returns WebP", async () => {
    stubBitmap(4000, 3000);
    const webp = new Blob(["w"], { type: "image/webp" });
    blobsFor({ "image/webp": webp });
    await expect(resizeImage(photo)).resolves.toBe(webp);
    expect(canvas.width).toBe(512);
    expect(canvas.height).toBe(384);
  });

  it("does not upscale a small image", async () => {
    stubBitmap(300, 200);
    blobsFor({ "image/webp": new Blob(["w"], { type: "image/webp" }) });
    await resizeImage(photo);
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(200);
  });

  it("accepts the PNG that Safari returns instead of WebP", async () => {
    stubBitmap(4000, 3000);
    const png = new Blob(["p"], { type: "image/png" });
    blobsFor({ "image/webp": png });
    await expect(resizeImage(photo)).resolves.toBe(png);
  });

  it("falls back to JPEG when the first encoding is not usable", async () => {
    stubBitmap(4000, 3000);
    const jpeg = new Blob(["j"], { type: "image/jpeg" });
    blobsFor({ "image/webp": null, "image/jpeg": jpeg });
    await expect(resizeImage(photo)).resolves.toBe(jpeg);
  });

  it("falls back to JPEG when Safari's PNG output is over 2 MB", async () => {
    // Foto de móvil de 6 MB: el PNG de Safari no cabe, el JPEG sí.
    stubBitmap(4000, 3000);
    const bigPng = blobOfSize(MAX_BYTES + 1, "image/png");
    const jpeg = blobOfSize(MAX_BYTES - 1, "image/jpeg");
    blobsFor({ "image/webp": bigPng, "image/jpeg": jpeg });
    await expect(resizeImage(photo)).resolves.toBe(jpeg);
  });

  it("accepts an output of exactly 2 MB", async () => {
    stubBitmap(4000, 3000);
    const exact = blobOfSize(MAX_BYTES, "image/webp");
    blobsFor({ "image/webp": exact });
    await expect(resizeImage(photo)).resolves.toBe(exact);
  });

  it("rejects when no encoding fits in 2 MB", async () => {
    stubBitmap(4000, 3000);
    blobsFor({
      "image/webp": blobOfSize(MAX_BYTES + 1, "image/webp"),
      "image/jpeg": blobOfSize(MAX_BYTES + 1, "image/jpeg"),
    });
    await expect(resizeImage(photo)).rejects.toBeInstanceOf(InvalidImageError);
  });

  it("rejects a file that is not JPG, PNG or WebP", async () => {
    await expect(
      resizeImage(new File(["x"], "a.gif", { type: "image/gif" })),
    ).rejects.toBeInstanceOf(InvalidImageError);
  });

  it("rejects an image that cannot be decoded", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("decode")),
    );
    await expect(resizeImage(photo)).rejects.toBeInstanceOf(InvalidImageError);
  });
});
