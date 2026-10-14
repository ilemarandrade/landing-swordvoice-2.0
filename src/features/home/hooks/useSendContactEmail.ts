import { useMutation } from "@tanstack/react-query";
import { sendContactEmail } from "@/features/home/services/contactService";

export function useSendContactEmail() {
  return useMutation({ mutationFn: sendContactEmail });
}
