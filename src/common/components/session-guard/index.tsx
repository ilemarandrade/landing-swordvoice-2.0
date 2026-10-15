"use client";
import type { ReactNode } from "react";
import {
  useSessionGuard,
  type SessionAccess,
} from "@/common/hooks/useSessionGuard";

type SessionGuardProps = {
  access: SessionAccess;
  children: ReactNode;
};

export function SessionGuard({ access, children }: SessionGuardProps) {
  const { canRender } = useSessionGuard(access);
  return canRender ? <>{children}</> : null;
}
