import type { Metadata } from "next";
import { readToken, VerifyEmail } from "@/features/auth";

export const metadata: Metadata = {
  title: "Confirmar correo",
  robots: { index: false, follow: false },
  // El token va en la URL: no se envía a otros sitios en la cabecera Referer.
  referrer: "no-referrer",
};

type VerifyEmailRouteProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyEmailRoute({ searchParams }: VerifyEmailRouteProps) {
  const { token } = await searchParams;
  return <VerifyEmail token={readToken(token)} />;
}
