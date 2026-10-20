import type { Metadata } from "next";
import { OAuthCallback, readSearchParam } from "@/features/auth";

export const metadata: Metadata = {
  title: "Iniciando sesión",
  robots: { index: false, follow: false },
  // El code va en la URL: no se envía a otros sitios en la cabecera Referer.
  referrer: "no-referrer",
};

type OAuthCallbackRouteProps = {
  searchParams: Promise<{
    code?: string | string[];
    state?: string | string[];
    error?: string | string[];
  }>;
};

export default async function OAuthCallbackRoute({
  searchParams,
}: OAuthCallbackRouteProps) {
  const { code, state, error } = await searchParams;
  return (
    <OAuthCallback
      code={readSearchParam(code)}
      state={readSearchParam(state)}
      error={readSearchParam(error)}
    />
  );
}
