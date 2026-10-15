"use client";
import { Button } from "@/common/components/button";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Reemplaza al layout raíz cuando este falla: necesita su propio <html> y <body>.
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Algo salió mal</h1>
        <Button type="button" label="Reintentar" onClick={reset} />
      </body>
    </html>
  );
}
