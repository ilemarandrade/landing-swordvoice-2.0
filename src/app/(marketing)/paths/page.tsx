import type { Metadata } from "next";
import { FirstPathRedirect } from "@/features/paths";

export const metadata: Metadata = { title: "Paths" };

export default function PathsIndexPage() {
  return (
    <main className="flex flex-1 flex-col">
      <FirstPathRedirect />
    </main>
  );
}
