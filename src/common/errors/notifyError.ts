import toast from "react-hot-toast";
import { ApiError } from "@/common/api/ApiError";
import { GENERIC_ERROR_MESSAGE } from "@/common/constants/messages";

export function notifyError(error: unknown): void {
  toast.error(
    error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE,
  );
}
