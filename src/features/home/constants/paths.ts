import type { ComponentType } from "react";
import IniciatedPath from "@/common/assets/icons/IniciatedPathIcon";
import WandererPathIcon from "@/common/assets/icons/WandererPathIcon";

type Path = {
  name: string;
  description: string;
  Icon?: ComponentType<{ width?: number }>;
  isAvailable: boolean;
};

export const paths: Path[] = [
  {
    name: "Iniciated",
    description:
      "Serás un jr Frontend Developer. Podrás crear interfaces de usuario interactivas e integrarlas con servicios propios o de terceros.",
    Icon: IniciatedPath,
    isAvailable: true,
  },
  {
    name: "Wanderer",
    description:
      " Serás jr backend developer. Podrás implementar lógica de negocio y crear los servicios que soportan a todas las aplicaciones web modernas.",
    Icon: WandererPathIcon,
    isAvailable: true,
  },
  {
    name: "Warrior",
    description: "",
    isAvailable: false,
  },
  {
    name: "Master",
    description: "",
    isAvailable: false,
  },
  {
    name: "Anciant",
    description: "",
    isAvailable: false,
  },
];


export const availablePaths = paths.filter(({ isAvailable }) => isAvailable);
export const upcomingPaths = paths.filter(({ isAvailable }) => !isAvailable);
