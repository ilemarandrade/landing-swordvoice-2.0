"use client";
import Link from "next/link";
import { usePathsQuery } from "@/common/hooks/usePathsQuery";

type PathTabsProps = { activeSlug: string; basePath: string };

export function PathTabs({ activeSlug, basePath }: PathTabsProps) {
  const { data } = usePathsQuery();
  if (!data || data.items.length < 2) return null;

  return (
    <nav aria-label="Paths" className="mx-auto w-full max-w-[1200px] px-4 pt-6 md:px-12">
      <ul className="flex gap-2 overflow-x-auto">
        {data.items.map((path) => {
          const isActive = path.slug === activeSlug;
          return (
            <li key={path.id} className="flex-none">
              <Link
                href={`${basePath}/${path.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border-2 px-5 font-sedgwick text-lg no-underline ${
                  isActive
                    ? "border-primary bg-primary/[0.12] text-primary"
                    : "border-white/25 text-white hover:border-primary"
                }`}
              >
                {path.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
