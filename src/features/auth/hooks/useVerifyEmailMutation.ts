import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { authTokensSchema } from "@/common/api/auth.schema";
import { saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

type VerifyEmailRequest = { token: string; password: string };

async function verifyEmail(body: VerifyEmailRequest) {
  const { data } = await apiClient.post("/auth/email/verify", body);
  return authTokensSchema.parse(data);
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyEmail,
    // Confirmar el correo inicia sesión, igual que el login.
    onSuccess: (tokens) => {
      queryClient.clear();
      saveTokens(tokens);
    },
    // Contraseña incorrecta y enlace vencido se muestran en la pantalla.
    onError: (error) => {
      if (
        !isApiErrorCode(error, "INVALID_CREDENTIALS") &&
        !isApiErrorCode(error, "INVALID_EMAIL_TOKEN")
      ) {
        notifyError(error);
      }
    },
  });
}
