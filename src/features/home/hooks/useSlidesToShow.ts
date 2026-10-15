import { useSyncExternalStore } from "react";

// Mismos cortes que tenía el carrusel; el primero que coincide gana.
const BREAKPOINTS = [
  { query: "(max-width: 680px)", slides: 1 },
  { query: "(max-width: 830px)", slides: 2 },
  { query: "(max-width: 1200px)", slides: 3 },
];
const DESKTOP_SLIDES = 4;

function subscribe(onChange: () => void) {
  const lists = BREAKPOINTS.map(({ query }) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

function getSlidesToShow() {
  return (
    BREAKPOINTS.find(({ query }) => window.matchMedia(query).matches)?.slides ??
    DESKTOP_SLIDES
  );
}

export function useSlidesToShow() {
  const slidesToShow = useSyncExternalStore(
    subscribe,
    getSlidesToShow,
    () => DESKTOP_SLIDES,
  );
  return { slidesToShow };
}
