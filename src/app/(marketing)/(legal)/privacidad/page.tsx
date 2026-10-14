import type { Metadata } from "next";
import { PrivacyPage } from "@/features/legal";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Page() {
  return <PrivacyPage />;
}
