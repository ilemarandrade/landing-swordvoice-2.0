import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { clearTokens, getTokens } from "@/common/api/tokenStorage";

// Cerrar sesión siempre funciona en el dispositivo: primero se borra lo local y
// luego se avisa a la API, aunque falle o no haya conexión.
async function logout(clearCache: () => void) {
  const tokens = getTokens();
  clearTokens();
  clearCache();
  if (tokens) {
    await apiClient.post("/auth/logout", { refreshToken: tokens.refreshToken });
  }
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => logout(() => queryClient.clear()) });
}
