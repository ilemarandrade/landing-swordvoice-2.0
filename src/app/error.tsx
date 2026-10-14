"use client";
import { Button } from "@/common/components/atoms/Button";
import { Typography } from "@/common/components/atoms/Typography";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <Typography variant="h3">Algo salió mal</Typography>
      <Button type="button" label="Reintentar" onClick={reset} />
    </main>
  );
}
