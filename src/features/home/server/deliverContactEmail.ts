import "server-only";
import nodemailer from "nodemailer";
import { getServerEnv } from "@/common/config/env";
import { escapeHtml } from "@/common/utils/escapeHtml";
import type { ContactFormValues } from "@/features/home/schemas/contact.schema";

export const CONTACT_EMAIL_SUBJECT = "NUEVO MENTORIADO";

export function buildContactEmailHtml({
  name,
  email,
  message,
}: ContactFormValues): string {
  return `
    <p>Name and Email: ${escapeHtml(name)} ${escapeHtml(email)}</p>
    <p>Message: ${escapeHtml(message)}</p>
  `;
}

export async function deliverContactEmail(
  values: ContactFormValues,
): Promise<void> {
  const env = getServerEnv();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: env.EMAIL_TO_SEND_EMAIL, pass: env.PASSWORD_TO_SEND_EMAIL },
  });

  await transporter.sendMail({
    from: { name: values.name, address: values.email },
    to: env.EMAILS_MENTORS,
    subject: CONTACT_EMAIL_SUBJECT,
    html: buildContactEmailHtml(values),
  });
}
