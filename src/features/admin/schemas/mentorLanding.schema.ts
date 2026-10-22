import { z } from "zod";

const MAX_LANDING_ORDER = 2147483647;

export const mentorLandingSchema = z.object({
  userId: z.string(),
  showOnLanding: z.boolean(),
  landingOrder: z.number().int().min(0).max(MAX_LANDING_ORDER).nullable(),
});

export const mentorLandingFormSchema = z.object({
  showOnLanding: z.boolean(),
  landingOrder: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) && Number(value) <= MAX_LANDING_ORDER),
      "Usa un número entero entre 0 y 2147483647",
    ),
});

export type MentorLanding = z.infer<typeof mentorLandingSchema>;
export type MentorLandingFormValues = z.infer<typeof mentorLandingFormSchema>;

export function toMentorLandingPatch(values: MentorLandingFormValues): {
  showOnLanding: boolean;
  landingOrder: number | null;
} {
  const landingOrder = values.landingOrder.trim();
  return {
    showOnLanding: values.showOnLanding,
    landingOrder: landingOrder === "" ? null : Number(landingOrder),
  };
}
