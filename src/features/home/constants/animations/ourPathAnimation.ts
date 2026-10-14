import { Variants } from "framer-motion";

interface ourPathAnimation {
  [key: string]: Variants;
}

export const ourPathAnimation: ourPathAnimation = {
  path: {
    offscreen: {
      transform: "scale(0.3)",
      opacity: 0.1,
    },
    onscreen: {
      transform: "scale(1)",
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.5,
        ease: [0, 0.6, 0.2, 1.8],
      },
    },
  },
  title: {
    offscreen: {
      position: "relative",
      top: -100,
    },
    onscreen: {
      top: 5,
    },
  },
};
