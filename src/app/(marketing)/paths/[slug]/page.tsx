import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/common/api/ApiError";
import { getQueryClient } from "@/common/api/getQueryClient";
import { routes } from "@/common/constants/routes";
import {
  PathDetail,
  PathTabs,
  pathDetailQueryOptions,
  pathsQueryOptions,
} from "@/features/paths";

type PathPageProps = { params: Promise<{ slug: string }> };

async function loadPath(slug: string) {
  try {
    return await getQueryClient().fetchQuery(pathDetailQueryOptions(slug));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PathPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = await loadPath(slug);
  return { title: path.name, description: path.description ?? undefined };
}

export default async function PathPage({ params }: PathPageProps) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  await loadPath(slug);
  await queryClient.prefetchQuery(pathsQueryOptions());

  return (
    <main className="flex flex-1 flex-col">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PathTabs activeSlug={slug} basePath={routes.PATHS} />
        <PathDetail slug={slug} />
      </HydrationBoundary>
    </main>
  );
}
