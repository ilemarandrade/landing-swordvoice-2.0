"use client";
import HouseIcon from "@/common/assets/icons/HouseIcon";
import { SERVICES_SECTION_ID } from "@/features/home/constants/sections";
import { useIsPastSection } from "@/features/home/hooks/useIsPastSection";
import { scrollToTop } from "@/features/home/utils/scrollToTop";

export function BackToTopButton() {
  const isVisible = useIsPastSection(SERVICES_SECTION_ID);

  return (
    <div className="fixed bottom-0 right-5 mb-10 mr-4 z-30">
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver al inicio"
        >
          <HouseIcon />
        </button>
      )}
    </div>
  );
}
