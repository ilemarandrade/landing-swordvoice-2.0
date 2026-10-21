import type { Profile } from "@/common/api/profile.schema";
import type { ProfileFormValues } from "@/features/profile/schemas/profileForm.schema";

const NULLABLE_FIELDS = [
  "bio",
  "githubUrl",
  "portfolioUrl",
  "linkedinUrl",
  "freeCodeCampUsername",
  "professionalTitle",
  "shortDescription",
  "experienceStartedAt",
] as const;

type NullableField = (typeof NULLABLE_FIELDS)[number];

const MENTOR_FIELDS: ReadonlySet<NullableField> = new Set<NullableField>([
  "professionalTitle",
  "shortDescription",
  "experienceStartedAt",
]);

export type ProfilePatch = { name?: string } & Partial<
  Record<NullableField, string | null>
>;

export function toProfileFormValues(profile: Profile): ProfileFormValues {
  return {
    name: profile.name,
    bio: profile.bio ?? "",
    githubUrl: profile.githubUrl ?? "",
    portfolioUrl: profile.portfolioUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    freeCodeCampUsername: profile.freeCodeCampUsername ?? "",
    professionalTitle: profile.professionalTitle ?? "",
    shortDescription: profile.shortDescription ?? "",
    experienceStartedAt: profile.experienceStartedAt ?? "",
  };
}

// Solo los campos modificados; un campo vaciado se envía como null para borrarlo.
export function toProfilePatch(
  values: ProfileFormValues,
  dirtyFields: Partial<Record<keyof ProfileFormValues, boolean>>,
  { isMentor }: { isMentor: boolean },
): ProfilePatch {
  const patch: ProfilePatch = {};
  if (dirtyFields.name) patch.name = values.name;
  for (const field of NULLABLE_FIELDS) {
    if (!dirtyFields[field]) continue;
    if (!isMentor && MENTOR_FIELDS.has(field)) continue;
    patch[field] = values[field] === "" ? null : values[field];
  }
  return patch;
}
