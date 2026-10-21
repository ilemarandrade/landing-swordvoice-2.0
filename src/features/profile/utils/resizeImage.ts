const MAX_SIDE = 512;
const MAX_BYTES = 2 * 1024 * 1024;
const QUALITY = 0.85;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class InvalidImageError extends Error {
  constructor() {
    super("Invalid image");
    this.name = "InvalidImageError";
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

function isUploadable(blob: Blob | null): blob is Blob {
  return (
    blob !== null &&
    ACCEPTED_TYPES.includes(blob.type) &&
    blob.size <= MAX_BYTES
  );
}

// Reduce el lado mayor a 512 px y recodifica. Redibujar en el canvas descarta el EXIF (GPS).
export async function resizeImage(file: File): Promise<Blob> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new InvalidImageError();
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new InvalidImageError();
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Safari no codifica WebP y devuelve PNG: sirve si cumple tipo y tamaño.
  const webp = await toBlob(canvas, "image/webp");
  if (isUploadable(webp)) return webp;
  const jpeg = await toBlob(canvas, "image/jpeg");
  if (isUploadable(jpeg)) return jpeg;
  throw new InvalidImageError();
}
