import { request } from "@/common/api/httpClient";
import {
  contactResponseSchema,
  type ContactFormValues,
} from "@/features/home/schemas/contact.schema";

export const CONTACT_ENDPOINT = "/api/sendEmail";

export function sendContactEmail(values: ContactFormValues) {
  return request(CONTACT_ENDPOINT, {
    method: "POST",
    body: values,
    schema: contactResponseSchema,
  });
}
