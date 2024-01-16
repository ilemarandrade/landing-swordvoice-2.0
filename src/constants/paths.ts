import IniciatedPath from "@/assets/icons/IniciatedPathIcon";
import WandererPathIcon from "@/assets/icons/WandererPathIcon";

const paths = [
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
    Icon: "",
    isAvailable: false,
  },
  {
    name: "Master",
    description: "",
    Icon: "",
    isAvailable: false,
  },
  {
    name: "Anciant",
    description: "",
    Icon: "",
    isAvailable: false,
  },
];

export default paths;
