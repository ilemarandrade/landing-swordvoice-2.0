import { useEffect } from "react";
import { scrollToTop } from "@/features/home/utils/scrollToTop";

export function useScrollToTopOnMount(): void {
  useEffect(() => {
    scrollToTop();
  }, []);
}
