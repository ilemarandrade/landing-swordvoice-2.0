import { z } from "zod";
import { emailField } from "@/features/auth/schemas/authFields.schema";

export const recoverPasswordSchema = z.object({ email: emailField });

export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;
