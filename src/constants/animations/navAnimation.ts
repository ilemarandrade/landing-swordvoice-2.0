import { Variants } from "framer-motion";

interface INavAnimation {
  [key: string]: Variants;
}

export const navAnimation: INavAnimation = {
  nav: {
    offscreen: {
      position: "relative",
      top: "-100px",
    },
    onscreen: {
      top: "0px",
    },
  },
  logo: {
    offscreen: {
      position: "relative",
      left: "-200vh",
    },
    onscreen: {
      left: 0,
    },
  },
};
