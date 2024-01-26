"use client";

import { useEffect, useState } from "react";

export const useBackToTopButton = () => {
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);

  const handleBackToTop = () => {
    window.scroll({
    top: 0, 
    left: 0, 
    behavior: 'smooth' 
  });
  };

  const checkScrollTop = () => {
    if (!showBackToTopButton && window.scrollY > 680) {
      setShowBackToTopButton(true);
    } else if (showBackToTopButton && window.scrollY <= 680) {
      setShowBackToTopButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showBackToTopButton]);

  return {showBackToTopButton, handleBackToTop};
};
