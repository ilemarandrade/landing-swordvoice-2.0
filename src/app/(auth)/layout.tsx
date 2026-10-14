import type { ReactNode } from "react";
import { SessionGuard } from "@/common/components/session-guard";
import { AuthLayout } from "@/features/auth";

export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard access="guest">
      <AuthLayout>{children}</AuthLayout>
    </SessionGuard>
  );
}
