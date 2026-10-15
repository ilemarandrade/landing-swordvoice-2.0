import type { Metadata } from "next";
import { routes } from "@/common/constants/routes";
import { PathDetail, PathTabs } from "@/features/paths";

export const metadata: Metadata = { title: "Mi path" };

type DashboardPathPageProps = { params: Promise<{ slug: string }> };

export default async function DashboardPathPage({ params }: DashboardPathPageProps) {
  const { slug } = await params;
  return (
    <div className="-m-4 flex flex-col md:-m-10">
      <PathTabs activeSlug={slug} basePath={routes.DASHBOARD_PATHS} />
      <PathDetail slug={slug} withProgress />
    </div>
  );
}
