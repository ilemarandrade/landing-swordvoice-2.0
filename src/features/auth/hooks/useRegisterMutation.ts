import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

type RegisterRequest = { name: string; email: string; password: string };

async function register(body: RegisterRequest) {
  await apiClient.post("/auth/register", body);
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    // EMAIL_TAKEN se muestra bajo el campo de correo.
    onError: (error) => {
      if (!isApiErrorCode(error, "EMAIL_TAKEN")) notifyError(error);
    },
  });
}
