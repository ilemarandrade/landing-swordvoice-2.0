export type SwordvoiceLinks = {
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

export type Swordvoice = {
  name: string;
  role: string;
  photo?: string;
  experience?: string;
  bio: string;
  tags: string[];
  links: SwordvoiceLinks;
};

export const swordvoices: Swordvoice[] = [
  {
    name: "Jainer Munoz",
    role: "Full Stack Engineer",
    photo: "/swordvoices/jainer.jpeg",
    experience: "10+",
    bio: "CEO, Consultor IT y negocios con 10+ años de experiencia, 8 años de desarrollo web moderno y gestión de equipos en entornos multiculturales.",
    tags: ["Full Stack", "Liderazgo", "Consultoría"],
    links: {
      linkedin: "https://www.linkedin.com/in/jainer-munoz/",
      github: "https://github.com/Yireh2016",
    },
  },
  {
    name: "Ilemar Andrade",
    role: "Frontend Developer",
    photo: "/swordvoices/ilemar.jpg",
    experience: "5+",
    bio: "Amplia experiencia contribuyendo al desarrollo de software. Desarrollador web y móvil, soñador, líder de equipo y mentor.",
    tags: ["React", "React Native", "Mentoría"],
    links: {
      linkedin: "https://www.linkedin.com/in/ilemar-andrade-0b261818b/",
      github: "https://github.com/ilemarandrade",
      portfolio: "https://ilemarandrade.vercel.app/",
    },
  },
  {
    name: "Juan Contreras",
    role: "Fullstack Developer",
    photo: "/swordvoices/juan.jpeg",
    experience: "20+",
    bio: "Profesional IT con más de 20 años en gestión de equipos y proyectos y 4 años en desarrollo web y móvil. Le apasiona potenciar las habilidades de otros.",
    tags: ["Gestión de proyectos", "Mobile", "Web"],
    links: {
      linkedin: "https://www.linkedin.com/in/contrerasjuanc/",
      github: "https://github.com/contrerju",
    },
  },
  {
    name: "Chellys Castillo",
    role: "Frontend Developer",
    photo: "/swordvoices/chellys.jpg",
    bio: "Construye interfaces eficientes con un enfoque detallista y creativo en diseño pixel perfect y responsive.",
    tags: ["UI", "Pixel perfect", "Responsive"],
    links: {
      linkedin: "https://www.linkedin.com/in/chellys-castillo/",
      github: "https://github.com/chellysA",
      portfolio: "https://chellys-castillo-portfolio.vercel.app/",
    },
  },
];
