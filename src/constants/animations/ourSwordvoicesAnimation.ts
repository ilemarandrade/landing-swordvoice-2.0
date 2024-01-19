import { Variants } from "framer-motion";

interface IOurSwordvoicesAnimation {
  [key: string]: Variants;
}

export const ourSwordvoicesAnimation: IOurSwordvoicesAnimation = {
  show: {
    offscreen: {
      opacity: 0,
    },
    onscreen: {
      opacity: 1,
    },
  },
  title: {
    offscreen: {
      position: "relative",
      top: -400,
    },
    onscreen: {
      top: 0,
    },
  },
};
