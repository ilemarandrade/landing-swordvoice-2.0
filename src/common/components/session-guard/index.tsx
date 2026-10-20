"use client";
import type { ReactNode } from "react";
import { Button } from "@/common/components/button";
import {
  useSessionGuard,
  type SessionAccess,
} from "@/common/hooks/useSessionGuard";

type SessionGuardProps = {
  access: SessionAccess;
  children: ReactNode;
};

export function SessionGuard({ access, children }: SessionGuardProps) {
  const { status, retry } = useSessionGuard(access);

  if (status === "ready") return <>{children}</>;
  if (status === "error") {
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white"
      >
        <p>No pudimos cargar tu sesión.</p>
        <Button type="button" label="Reintentar" onClick={retry} />
      </div>
    );
  }
  return (
    <p role="status" className="sr-only">
      Cargando…
    </p>
  );
}
