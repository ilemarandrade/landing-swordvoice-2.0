import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { authMessages } from "@/features/auth/constants/authMessages";

async function resendVerification(email: string) {
  await apiClient.post("/auth/email/verify/resend", { email });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: resendVerification,
    onSuccess: () => toast.success(authMessages.VERIFICATION_RESENT),
    onError: notifyError,
  });
}
