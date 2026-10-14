import { LegalDocument } from "@/features/legal/components/legal-document";
import { terms } from "@/features/legal/constants/terms";

export function TermsPage() {
  return <LegalDocument content={terms} />;
}
