import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";

// Login, registro y recuperar contraseña: con sesión abierta, al dashboard.
// /verify-email y /reset-password quedan fuera para que sus enlaces sirvan siempre.
export default function GuestLayout({ children }: { children: ReactNode }) {
  return <SessionGuard access="guest">{children}</SessionGuard>;
}
