import type { ReactNode } from "react";
import { HomeNavbar } from "@/features/home";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HomeNavbar />
      {children}
    </>
  );
}
