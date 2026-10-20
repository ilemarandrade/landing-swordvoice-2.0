import { ApiError } from "@/common/api/ApiError";
import { GENERIC_ERROR_MESSAGE } from "@/common/constants/messages";
import { oauthMessages } from "@/features/auth/constants/oauthMessages";
import { isApiErrorCode } from "@/features/auth/utils/isApiErrorCode";

export function toOAuthErrorMessage(
  error: unknown,
  providerLabel: string,
): string {
  if (isApiErrorCode(error, "INVALID_OAUTH_CODE"))
    return oauthMessages.INVALID_CODE;
  if (isApiErrorCode(error, "OAUTH_EMAIL_NOT_VERIFIED")) {
    return oauthMessages.emailNotVerified(providerLabel);
  }
  if (isApiErrorCode(error, "OAUTH_PROVIDER_UNAVAILABLE")) {
    return oauthMessages.unavailable(providerLabel);
  }
  return error instanceof ApiError ? error.message : GENERIC_ERROR_MESSAGE;
}
