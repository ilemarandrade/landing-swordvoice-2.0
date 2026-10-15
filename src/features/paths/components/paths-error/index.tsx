import { Button } from "@/common/components/button";

type PathsErrorProps = { message?: string; onRetry: () => void };

export function PathsError({
  message = "No pudimos cargar los paths.",
  onRetry,
}: PathsErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-[18px] border border-white/15 bg-[#000E2799] p-8 text-center text-white">
      <p className="text-[17px] text-[#E6E6EE]">{message}</p>
      <Button type="button" label="Reintentar" onClick={onRetry} />
    </div>
  );
}
