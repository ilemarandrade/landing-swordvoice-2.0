import type { Metadata } from "next";
import { RegisterPage } from "@/features/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function Page() {
  return <RegisterPage />;
}
