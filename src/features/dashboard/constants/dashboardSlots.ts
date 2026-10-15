export type DashboardSlotContent = {
  id: string;
  title: string;
  highlight?: string;
  emptyMessage: string;
  isWide?: boolean;
};

export const dashboardSlots: DashboardSlotContent[] = [
  {
    id: "progreso",
    title: "Progreso del path",
    emptyMessage: "Aquí verás tus módulos completados y tu avance.",
    isWide: true,
  },
  {
    id: "proxima-sesion",
    title: "Próxima sesión con tu",
    highlight: "mentor",
    emptyMessage: "Aquí verás la fecha, la hora y el enlace de tu próxima sesión.",
  },
  {
    id: "tareas",
    title: "Tareas de la semana",
    emptyMessage: "Aquí verás las tareas que te asigne tu mentor.",
  },
  {
    id: "recursos",
    title: "Recursos recomendados",
    emptyMessage: "Aquí verás los recursos que te recomiende tu mentor.",
  },
  {
    id: "comunidad",
    title: "Comunidad",
    emptyMessage: "Aquí verás la actividad reciente de la comunidad.",
  },
];
