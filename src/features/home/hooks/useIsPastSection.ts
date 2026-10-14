import { useEffect, useState } from "react";

const NAVBAR_HEIGHT = 85;

export function useIsPastSection(sectionId: string): boolean {
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const check = () => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      setIsPast(window.scrollY + NAVBAR_HEIGHT > section.offsetTop);
    };
    window.addEventListener("scroll", check);
    return () => window.removeEventListener("scroll", check);
  }, [sectionId]);

  return isPast;
}
