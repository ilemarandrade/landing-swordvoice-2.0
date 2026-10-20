import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { clearTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { authMessages } from "@/features/auth/constants/authMessages";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

type ResetPasswordRequest = { token: string; password: string };

async function resetPassword(body: ResetPasswordRequest) {
  await apiClient.post("/auth/password/reset", body);
}

export function useResetPasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetPassword,
    // La API cierra todas las sesiones de la cuenta: también la de este navegador.
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      toast.success(authMessages.PASSWORD_RESET);
    },
    onError: (error) => {
      if (!isApiErrorCode(error, "INVALID_EMAIL_TOKEN")) notifyError(error);
    },
  });
}
