import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { authTokensSchema, type AuthTokens } from "@/common/api/auth.schema";
import { saveTokens } from "@/common/api/tokenStorage";
import { notifyError } from "@/common/errors/notifyError";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

async function login(credentials: LoginFormValues) {
  const { data } = await apiClient.post("/auth/login", credentials);
  return authTokensSchema.parse(data);
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (tokens: AuthTokens) => {
      // Sin datos en caché de una sesión anterior en esta pestaña.
      queryClient.clear();
      saveTokens(tokens);
    },
    // EMAIL_NOT_VERIFIED se muestra como aviso dentro del formulario.
    onError: (error) => {
      if (!isApiErrorCode(error, "EMAIL_NOT_VERIFIED")) notifyError(error);
    },
  });
}
