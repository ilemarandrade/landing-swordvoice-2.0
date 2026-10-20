import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { authTokensSchema } from "@/common/api/auth.schema";
import { saveTokens } from "@/common/api/tokenStorage";
import type { OAuthProviderId } from "@/features/auth/constants/oauthProviders";

type OAuthSignInRequest = {
  provider: OAuthProviderId;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
};

async function signInWithProvider({ provider, ...body }: OAuthSignInRequest) {
  const { data } = await apiClient.post(`/auth/oauth/${provider}`, body);
  return authTokensSchema.parse(data);
}

// Sin notifyError: la pantalla del callback muestra cualquier resultado.
export function useOAuthSignInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signInWithProvider,
    onSuccess: (tokens) => {
      queryClient.clear();
      saveTokens(tokens);
    },
  });
}
