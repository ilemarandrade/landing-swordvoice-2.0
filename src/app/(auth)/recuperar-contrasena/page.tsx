import type { Metadata } from "next";
import { RecoverPasswordPage } from "@/features/auth";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function Page() {
  return <RecoverPasswordPage />;
}
