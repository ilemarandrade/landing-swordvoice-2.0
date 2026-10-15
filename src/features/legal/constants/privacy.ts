import { routes } from "@/common/constants/routes";
import { CONTACT_EMAIL, SITE_NAME } from "@/common/constants/site";
import { company } from "@/features/legal/constants/company";
import type { LegalDocumentContent } from "@/features/legal/constants/legalDocument";

export const privacy: LegalDocumentContent = {
  title: "Política de privacidad",
  updatedAt: company.updatedAt,
  intro: `En ${SITE_NAME} solo usamos tus datos para darte la mentoría que elegiste. Aquí te explicamos qué recogemos, por qué y cómo controlarlo.`,
  sections: [
    {
      id: "responsable",
      title: "Responsable",
      paragraphs: [
        `${company.legalName}, ${company.taxId}, con domicilio en ${company.address}, es responsable del tratamiento de tus datos.`,
      ],
    },
    {
      id: "datos",
      title: "Datos que recogemos",
      paragraphs: [],
      items: [
        { label: "Cuenta", text: "nombre, correo electrónico y contraseña cifrada." },
        { label: "Aprendizaje", text: "path elegido, progreso, tareas y notas de sesiones." },
        { label: "Perfil profesional", text: "enlaces a LinkedIn, GitHub o portafolio que decidas compartir." },
        { label: "Uso", text: "datos técnicos del navegador y del dispositivo." },
      ],
    },
    {
      id: "finalidad",
      title: "Para qué los usamos",
      paragraphs: [
        "Para crear y mantener tu cuenta, asignarte un mentor, seguir tu progreso, prepararte para entrevistas, enviarte avisos del servicio y mejorar la plataforma.",
      ],
    },
    {
      id: "destinatarios",
      title: "Con quién los compartimos",
      paragraphs: [
        "Con tu mentor asignado y con proveedores necesarios para operar el servicio ([HOSTING], [CORREO], [PAGOS]). Solo compartimos tu perfil con reclutadores si lo autorizas expresamente. Nunca vendemos tus datos.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: ["[Detallar cookies técnicas, de analítica y cómo gestionarlas.]"],
    },
    {
      id: "conservacion",
      title: "Conservación y seguridad",
      paragraphs: [
        `Conservamos tus datos mientras tu cuenta esté activa y durante ${company.retentionPeriod} después. Aplicamos cifrado y controles de acceso para protegerlos.`,
      ],
    },
    {
      id: "derechos",
      title: "Tus derechos",
      paragraphs: [
        `Puedes acceder, rectificar, eliminar o exportar tus datos, y oponerte a ciertos usos, desde Ajustes o escribiéndonos. [Añadir la autoridad de control aplicable en ${company.country}.]`,
      ],
    },
    {
      id: "contacto",
      title: "Contacto",
      paragraphs: [
        `Escríbenos a ${CONTACT_EMAIL}. Consulta también nuestros Términos y condiciones.`,
      ],
      links: [
        { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
        { label: "Términos y condiciones", href: routes.TERMS },
      ],
    },
  ],
};
