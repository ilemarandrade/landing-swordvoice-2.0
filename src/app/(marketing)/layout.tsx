import type { ReactNode } from "react";
import { Footer } from "@/common/components/footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
