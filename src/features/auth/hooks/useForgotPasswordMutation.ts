import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";

async function forgotPassword(email: string) {
  await apiClient.post("/auth/password/forgot", { email });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPassword, onError: notifyError });
}
