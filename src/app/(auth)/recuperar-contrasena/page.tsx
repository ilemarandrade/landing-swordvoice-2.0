import type { Metadata } from "next";
import { RecoverPassword } from "@/features/auth";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecoverPasswordPage() {
  return <RecoverPassword />;
}
