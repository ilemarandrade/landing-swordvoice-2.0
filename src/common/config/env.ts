import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  EMAIL_TO_SEND_EMAIL: z.email(),
  PASSWORD_TO_SEND_EMAIL: z.string().min(1),
  EMAILS_MENTORS: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

// Read per call (not at module load) so `next build` does not require the variables.
export function getServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    const keys = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`Variables de entorno inválidas: ${keys}`);
  }
  return parsed.data;
}
