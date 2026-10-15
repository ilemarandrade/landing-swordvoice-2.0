import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/common/api/getQueryClient";
import { routes } from "@/common/constants/routes";
import { pathsQueryOptions } from "@/features/paths";

// Los datos vienen de la API en cada petición (axios no lo detecta Next).
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Paths" };

export default async function PathsIndexPage() {
  const { items } = await getQueryClient().fetchQuery(pathsQueryOptions());
  const first = items[0];
  if (first) redirect(`${routes.PATHS}/${first.slug}`);

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-20 text-center md:px-12">
      <p className="text-[17px] text-[#E6E6EE]">Aún no hay paths disponibles.</p>
    </main>
  );
}
