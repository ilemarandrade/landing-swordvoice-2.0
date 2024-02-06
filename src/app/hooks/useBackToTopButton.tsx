import { useEffect, useRef, useState } from "react";

export const useBackToTopButton = () => {
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);
  const elementWhereButtonAppears = useRef<HTMLDivElement>(null);

  const handleBackToTop = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const checkScrollTop = () => {
    const positionWhereButtonAppears =
      elementWhereButtonAppears.current?.offsetTop;

    if (!positionWhereButtonAppears) {
      return;
    }
    if (window.scrollY > positionWhereButtonAppears) {
      setShowBackToTopButton(true);
    } else {
      setShowBackToTopButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, []);

  return { showBackToTopButton, handleBackToTop, elementWhereButtonAppears };
};
