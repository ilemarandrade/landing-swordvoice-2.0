import type { Metadata } from "next";
import { TermsPage } from "@/features/legal";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Page() {
  return <TermsPage />;
}
