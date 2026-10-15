import type { Metadata } from "next";
import { LegalDocument, privacy } from "@/features/legal";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return <LegalDocument content={privacy} />;
}
