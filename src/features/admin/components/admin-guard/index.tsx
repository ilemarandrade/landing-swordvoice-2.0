"use client";
import type { ReactNode } from "react";
import { useAdminAccess } from "@/features/admin/hooks/useAdminAccess";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { canRender } = useAdminAccess();
  return canRender ? <>{children}</> : null;
}
