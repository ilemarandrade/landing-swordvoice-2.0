import { Variants } from "framer-motion";

interface IServicesAnimation {
  [key: string]: Variants;
}

export const servicesAnimation: IServicesAnimation = {
  elementInLeft: {
    offscreen: {
      left: "-100vh",
    },
    onscreen: {
      left: 0,
    },
  },
  elementInRight: {
    offscreen: {
      right: "-100vh",
    },
    onscreen: {
      right: 0,
    },
  },
  title: {
    offscreen: {
      left: "-200vh",
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
        delay: 1.5,
      },
    },
  },
};
