import { LegalDocument } from "@/features/legal/components/legal-document";
import { privacy } from "@/features/legal/constants/privacy";

export function PrivacyPage() {
  return <LegalDocument content={privacy} />;
}
