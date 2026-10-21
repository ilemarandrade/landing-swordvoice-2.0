"use client";
import { PathsError } from "@/features/paths/components/paths-error";
import { PathsSkeleton } from "@/features/paths/components/paths-skeleton";
import { useFirstPathRedirect } from "@/features/paths/hooks/useFirstPathRedirect";

const messageContainer =
  "mx-auto w-full max-w-[1200px] flex-1 px-4 py-20 text-center md:px-12";

export function FirstPathRedirect() {
  const { isError, refetch, isEmpty } = useFirstPathRedirect();

  if (isError) {
    return (
      <div className={messageContainer}>
        <PathsError onRetry={() => refetch()} />
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className={messageContainer}>
        <p className="text-[17px] text-[#E6E6EE]">Aún no hay paths disponibles.</p>
      </div>
    );
  }
  // Pendiente o redirigiendo al primer path.
  return <PathsSkeleton variant="detail" />;
}
