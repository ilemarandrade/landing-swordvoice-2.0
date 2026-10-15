import type { CertificationProvider } from "@/features/paths/schemas/path.schema";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export const toRoman = (index: number) => ROMAN[index] ?? String(index + 1);

export const padPosition = (index: number) =>
  String(index + 1).padStart(2, "0");

const PROVIDER_LABELS: Record<CertificationProvider, string> = {
  FREECODECAMP: "freeCodeCamp",
};

export const providerLabel = (provider: CertificationProvider) =>
  PROVIDER_LABELS[provider];
