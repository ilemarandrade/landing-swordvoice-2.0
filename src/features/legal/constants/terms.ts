import { routes } from "@/common/constants/routes";
import { CONTACT_EMAIL, SITE_NAME } from "@/common/constants/site";
import { company } from "@/features/legal/constants/company";
import type { LegalDocumentContent } from "@/features/legal/constants/legalDocument";

export const terms: LegalDocumentContent = {
  title: "Términos y condiciones",
  updatedAt: company.updatedAt,
  intro: `Estos términos regulan el uso de swordvoice.com y de los servicios de mentoría de ${SITE_NAME}, operada por ${company.legalName}, con domicilio en ${company.location}.`,
  sections: [
    {
      id: "aceptacion",
      title: "Aceptación",
      paragraphs: [
        "Al crear una cuenta o usar la plataforma aceptas estos términos y nuestra Política de privacidad. Si no estás de acuerdo, no uses el servicio.",
      ],
      links: [{ label: "Política de privacidad", href: routes.PRIVACY }],
    },
    {
      id: "servicio",
      title: "El servicio",
      paragraphs: [
        `${SITE_NAME} ofrece un modelo de mentorías: asignación de un mentor, plan de aprendizaje por path, entrenamiento para entrevistas, orientación de portafolio y LinkedIn, y acceso a la comunidad. No es un programa de cursos tradicionales ni un título oficial.`,
      ],
    },
    {
      id: "cuenta",
      title: "Cuenta de usuario",
      paragraphs: [
        `Debes tener al menos ${company.minimumAge} años, dar datos veraces y mantener segura tu contraseña. Eres responsable de la actividad realizada desde tu cuenta.`,
      ],
    },
    {
      id: "mentorias",
      title: "Mentorías y paths",
      paragraphs: [
        "El mentor guía y propone recursos; el avance depende de tu dedicación. Te ayudamos a buscar tu primer empleo en el path elegido, pero no garantizamos una contratación.",
      ],
    },
    {
      id: "pagos",
      title: "Pagos y cancelación",
      paragraphs: [
        "[Describir precios, ciclo de facturación, medios de pago, política de reembolso y cómo cancelar.]",
      ],
    },
    {
      id: "conducta",
      title: "Conducta en la comunidad",
      paragraphs: [
        "Trata a mentores y miembros con respeto. No se permite acoso, spam, plagio ni compartir contenido ilegal. Podemos suspender cuentas que incumplan estas normas.",
      ],
    },
    {
      id: "propiedad-intelectual",
      title: "Propiedad intelectual",
      paragraphs: [
        "La marca, el diseño y los materiales de Swordvoice nos pertenecen. Los proyectos y el código que crees durante tu path son tuyos.",
      ],
    },
    {
      id: "responsabilidad",
      title: "Responsabilidad",
      paragraphs: [
        `[Limitación de responsabilidad y ley aplicable según la jurisdicción de ${company.country}.]`,
      ],
    },
    {
      id: "cambios-contacto",
      title: "Cambios y contacto",
      paragraphs: [
        `Podemos actualizar estos términos y te avisaremos por correo o en la plataforma. Para dudas escribe a ${CONTACT_EMAIL}.`,
      ],
      links: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
    },
  ],
};
