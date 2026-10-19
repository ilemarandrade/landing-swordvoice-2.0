import type { Metadata } from "next";
import { routes } from "@/common/constants/routes";
import { PathDetail, PathTabs } from "@/features/paths";

export const metadata: Metadata = { title: "Paths" };

type PathPageProps = { params: Promise<{ slug: string }> };

export default async function PathPage({ params }: PathPageProps) {
  const { slug } = await params;

  return (
    <main className="flex flex-1 flex-col">
      <PathTabs activeSlug={slug} basePath={routes.PATHS} />
      <PathDetail slug={slug} />
    </main>
  );
}
