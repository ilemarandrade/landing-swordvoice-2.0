import { Variants } from "framer-motion";

interface IWhatIsSwordvoiceAnimation {
  [key: string]: Variants;
}

export const whatIsSwordvoiceAnimation: IWhatIsSwordvoiceAnimation = {
  elementInRight: {
    offscreen: {
      position: "relative",
      opacity: 0,
      right: "-100vh",
    },
    onscreen: {
      right: 0,
      opacity: 1,
    },
  },
  text: {
    offscreen: {
      opacity: 0,
    },
    onscreen: {
      opacity: 1,
    },
  },
};
