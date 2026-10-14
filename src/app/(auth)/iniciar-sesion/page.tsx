import type { Metadata } from "next";
import { LoginPage } from "@/features/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function Page() {
  return <LoginPage />;
}
