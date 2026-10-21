import { ApiError } from "@/common/api/ApiError";
import {
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
} from "@/common/constants/messages";

export const SIGNED_UPLOAD_FAILED = "SIGNED_UPLOAD_FAILED";

// PUT directo al almacenamiento con una URL prefirmada. No usa apiClient: su baseURL y
// el header Authorization invalidarían la firma. El navegador fija Content-Length.
export async function uploadToSignedUrl(
  url: string,
  blob: Blob,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": blob.type },
      body: blob,
    });
  } catch {
    // CORS sin configurar o sin conexión.
    throw new ApiError(0, NETWORK_ERROR_MESSAGE, SIGNED_UPLOAD_FAILED);
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      GENERIC_ERROR_MESSAGE,
      SIGNED_UPLOAD_FAILED,
    );
  }
}
