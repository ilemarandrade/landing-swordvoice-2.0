import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { profileSchema } from "@/common/api/profile.schema";
import {
  SIGNED_UPLOAD_FAILED,
  uploadToSignedUrl,
} from "@/common/api/uploadToSignedUrl";
import { notifyError } from "@/common/errors/notifyError";
import { profileMessages } from "@/features/profile/constants/profileMessages";
import { photoUploadUrlSchema } from "@/features/profile/schemas/photoUploadUrl.schema";
import {
  InvalidImageError,
  resizeImage,
} from "@/features/profile/utils/resizeImage";

async function changePhoto(file: File) {
  const blob = await resizeImage(file);
  const { data } = await apiClient.post("/profiles/me/photo/upload-url", {
    contentType: blob.type,
    size: blob.size,
  });
  const { uploadUrl, key } = photoUploadUrlSchema.parse(data);
  await uploadToSignedUrl(uploadUrl, blob);
  const { data: profile } = await apiClient.put("/profiles/me/photo", { key });
  return profileSchema.parse(profile);
}

const UPLOAD_FAILURE_CODES = [
  SIGNED_UPLOAD_FAILED,
  "PHOTO_NOT_UPLOADED",
  "INVALID_PHOTO_KEY",
];

// Traduce los fallos propios de la foto a un mensaje claro; el resto conserva el de la API.
function toPhotoError(error: unknown): unknown {
  if (error instanceof InvalidImageError) {
    return new ApiError(400, profileMessages.INVALID_IMAGE);
  }
  if (UPLOAD_FAILURE_CODES.some((code) => isApiErrorCode(error, code))) {
    return new ApiError(400, profileMessages.PHOTO_UPLOAD_FAILED);
  }
  return error;
}

export function useChangePhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changePhoto,
    onSuccess: (profile) => {
      queryClient.setQueryData(["profiles", "me"], profile);
      toast.success(profileMessages.PHOTO_UPDATED);
    },
    onError: (error) => notifyError(toPhotoError(error)),
  });
}
