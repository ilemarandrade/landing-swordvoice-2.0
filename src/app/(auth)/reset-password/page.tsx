import type { Metadata } from "next";
import { readToken, ResetPassword } from "@/features/auth";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
  // El token va en la URL: no se envía a otros sitios en la cabecera Referer.
  referrer: "no-referrer",
};

type ResetPasswordRouteProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordRoute({
  searchParams,
}: ResetPasswordRouteProps) {
  const { token } = await searchParams;
  return <ResetPassword token={readToken(token)} />;
}
