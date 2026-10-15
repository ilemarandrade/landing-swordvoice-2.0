import type { Metadata } from "next";
import { LegalDocument, terms } from "@/features/legal";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return <LegalDocument content={terms} />;
}
