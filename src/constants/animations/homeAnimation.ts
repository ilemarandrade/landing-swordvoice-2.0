import { Variants } from "framer-motion";

interface IHomeAnimation {
  [key: string]: Variants;
}

export const homeAnimation: IHomeAnimation = {
  containerTitle: {
    offscreen: {
      transform: "rotate(-90deg)",
      position: "relative",
      left: "-40%",
      top: "-70vh",
      opacity: 0,
    },
    onscreen: {
      transform: "rotate(0deg)",
      position: "relative",
      left: "0px",
      top: "0px",
      opacity: 1,
    },
  },
  titleCenter: {
    offscreen: {
      position: "relative",
      left: "200vh",
    },
    onscreen: {
      left: 0,
    },
  },
  registerButton: {
    offscreen: {
      opacity: 0,
    },
    onscreen: {
      opacity: 1,
      transition: {
        delay: 2.5,
      },
    },
  },
};
