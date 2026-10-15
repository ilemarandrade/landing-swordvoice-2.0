# SwordVoice — Features por implementar

Resumen de los features acordados para llevar SwordVoice de landing a app. Están ordenados por **prelación**: cada feature va después de los que necesita para funcionar.

> Las reglas de negocio del servicio (membresía, sesiones, reembolsos) están en [operacion-del-servicio.md](./operacion-del-servicio.md).

## Orden general

| Fase | Contenido |
|---|---|
| **Fase 0 — Landing** | Correcciones, páginas legales, páginas del modelo de servicio, SEO técnico |
| **MVP — App** | 1 Cuentas (y 1-B Mentores activos en la landing) → 2 Paths → 3 Membresía → 4 Asignación de mentor → 5 freeCodeCamp → 6 Agendamiento → 7 Métricas básicas |
| **Etapa 2** | 8 Notificaciones PWA · 9 Path AI Engineer · 10 Retos y code reviews · 11 Gamificación |
| **Etapa 3** | 12 Vitrina de Talento · 13 Métricas de empleabilidad |
| **En paralelo** | Asistente virtual (landing) · Blog · Comunidad · Asistente dentro de la app (al final) |

**Ruta crítica del MVP:** 1 → 2 → 3 → 4 → 6.

---

## Fase 0 — Landing

Va primero porque el inicio de sesión con Google exige páginas legales publicadas en el dominio, y el asistente virtual necesita las preguntas frecuentes.

### 0-A. Correcciones rápidas

| # | Tarea | Depende de |
|---|---|---|
| 0.1 | Declarar el idioma de la página como español y reescribir en español la descripción para buscadores (hoy está en inglés y desactualizada) | — |
| 0.2 | Agregar al formulario de contacto la casilla "Acepto la Política de Privacidad" | 0.5 |
| 0.3 | Agregar imagen y textos para compartir en redes (Open Graph) | — |
| 0.3.1 | **Reordenar secciones:** "Nuestros Paths" va antes de "Nuestras SwordVoices", en la página y en el menú de navegación | — |

### 0-B. Páginas legales

| # | Tarea | Depende de |
|---|---|---|
| 0.4 | **Aviso legal / Datos de la empresa:** nombre o razón social, país, correo de contacto | País de registro |
| 0.5 | **Política de Privacidad**, versión 1: formulario de contacto, cookies, analítica. Debe aclarar que SwordVoice no procesa ni guarda datos de pago en la plataforma | 0.4 |
| 0.6 | **Términos y Condiciones**, con la sección "Membresía, pagos, asistencia y reembolsos" (ver operacion-del-servicio.md) | 0.4 |
| 0.7 | **Política de Cookies y banner de consentimiento** | 0.5 |

No hace falta una página de Reembolsos independiente mientras no se cobre dentro de la plataforma: esas reglas van en los Términos.

**La Política de Privacidad se actualiza antes de lanzar cada feature:**
- MVP: cuentas e inicio de sesión con Google (y la declaración de "Uso Limitado" de Google si se usa Google Calendar), integración con freeCodeCamp, derecho a ver, corregir y borrar datos, eliminación de cuenta, edad mínima.
- Etapa 2: notificaciones push y asistente virtual (aviso de que es una IA y qué conversaciones se guardan).
- Etapa 3: Vitrina de Talento (el perfil se muestra a reclutadores solo con consentimiento del aprendiz, que puede retirarlo).

### 0-C. Páginas del modelo de servicio

| # | Tarea | Depende de |
|---|---|---|
| 0.8 | **Membresía:** qué incluye (4 sesiones semanales de 1 hora, mentor asignado, seguimiento del path, apoyo con portafolio, LinkedIn y entrevistas). El precio se ajusta según el país, con botón de contacto | — |
| 0.9 | **Cómo funciona:** registro → el admin asigna mentor → aprendes → mentorías → Vitrina → empleo | — |
| 0.10 | **Una página por path:** Initiated, Wanderer; AI Engineer como "próximamente" | — |
| 0.11 | **Preguntas frecuentes** | 0.8, 0.9 |
| 0.12 | **Quiero ser mentor:** formulario de postulación | 0.5 |
| 0.13 | **Para empresas / reclutadores:** versión "próximamente" que reúne interesados en la Vitrina | 0.5 |
| 0.14 | **Footer completo:** enlaces legales, contacto, redes, © | 0.4 a 0.7 |

Casos de éxito y Blog se dejan para más adelante (cuando haya egresados y con el feature 7 del Blog).

### 0-D. SEO técnico y preparación para la app

| # | Tarea | Depende de |
|---|---|---|
| 0.15 | Agregar al sitemap todas las páginas nuevas | 0-B, 0-C |
| 0.16 | Datos estructurados para Google: Organización, Curso por path, FAQ | 0.10, 0.11 |
| 0.17 | Verificar el dominio en Google Search Console | — |
| 0.18 | Manifiesto de PWA e íconos | — |

**Pueden empezar ya:** 0.1, 0.3, 0.3.1, 0.8, 0.9, 0.10, 0.17, 0.18.

---

## MVP — App

### 1. Cuentas, roles y perfil
Depende de: —

- **Tres roles:** Aprendiz, Mentor y Administrador.
- El rol se asigna **por path**: una misma persona puede ser Mentor en Initiated y Aprendiz en AI Engineer.
- Cada rol ve su propio contenido:
  - **Aprendiz:** su avance, su mentor, sus sesiones y sus logros.
  - **Mentor:** sus aprendices, su agenda y alertas de aprendices inactivos.
  - **Admin:** usuarios, membresías, asignaciones, contenido y métricas.
- **Perfil:** foto, bio, stack, GitHub, portafolio y LinkedIn, más certificaciones y logros. Es la base de la Vitrina de Talento.
- El perfil del mentor incluye además un **título profesional** (por ejemplo, "Frontend Developer") y una **descripción corta**, que se muestran en la landing (feature 1-B).

### 1-B. Mentores activos en la landing ("Nuestras SwordVoices")
Depende de: 1

- La sección "Nuestras SwordVoices" deja de tener los mentores escritos a mano en el código: **la landing los obtiene de un endpoint** que devuelve los mentores activos.
- **Mentor activo:** tiene el rol de Mentor en al menos un path y el admin no lo ha desactivado.
- Por cada mentor se muestra: foto, nombre, título profesional, descripción corta, LinkedIn, GitHub y portafolio, tomados de su perfil.
- El mentor (o el admin) puede elegir **no aparecer en la landing**.
- El admin define el **orden** en que aparecen.
- Si el endpoint falla, la sección no debe romper la página (se oculta o muestra un mensaje).
- Los mentores deben seguir siendo visibles para Google (la sección no puede cargarse solo en el navegador).
- La Política de Privacidad debe mencionar que el perfil del mentor se publica en la landing.

### 2. Paths de aprendizaje
Depende de: 1

- **Initiated (Frontend):** certificaciones de freeCodeCamp Responsive Web Design, JavaScript y Front End Development Libraries.
- **Wanderer (Backend):** certificaciones de freeCodeCamp Back End Development and APIs y Relational Database.
- Cada path tiene hitos y un proyecto final que revisa el mentor.
- Paths futuros ya anunciados en la landing: Warrior y Master.

### 3. Membresía activa
Depende de: 1

- Registra fecha de inicio y vencimiento del mes pagado.
- Estados: **activa**, **vencida**, **reembolsada**.
- El admin la activa o renueva a mano cuando confirma el pago. Opcionalmente anota el monto acordado como referencia interna.
- El admin registra solicitudes de reembolso y la app calcula el monto según las reglas de operacion-del-servicio.md.

### 4. Asignación de mentor
Depende de: 1, 2, 3

- **El admin asigna el mentor** a cada aprendiz, por path.
- El admin puede reasignar si el mentor deja de estar disponible o el aprendiz lo pide.

### 5. Integración con freeCodeCamp
Depende de: 1, 2

- El aprendiz vincula su usuario de freeCodeCamp y la app muestra su avance en cada certificación del path.
- El mentor y el admin ven ese avance en su panel.

### 6. Agendamiento de mentorías
Depende de: 3, 4

- El mentor publica su disponibilidad semanal.
- El aprendiz **elige un horario fijo semanal** entre los horarios libres de su mentor. Ese horario queda reservado.
- La app **crea automáticamente las 4 sesiones** del mes de membresía.
- El aprendiz **no puede reprogramar**; solo ve sus sesiones y su estado.
- Si el mentor cancela, elige una nueva fecha dentro del período de la membresía (la app no permite una fecha posterior al vencimiento). Si no queda tiempo, la sesión pasa al mes siguiente.
- El mentor marca cada sesión: **asistió**, **no asistió**, **cancelada por el mentor (reprogramada)**.
- Contador visible para el aprendiz: "te quedan N sesiones este mes".
- Al renovar se mantiene el mismo horario. Con la membresía vencida no se crean sesiones nuevas.
- Recordatorios por correo en el MVP (push llega en la Etapa 2).

### 7. Métricas básicas
Depende de: 1 a 6

- **Aprendices:** activos, nuevos, inactivos, abandono, avance promedio por path.
- **Mentores:** sesiones dadas, aprendices a cargo, asistencia.
- **Negocio:** membresías activas y vencidas, renovaciones, reembolsos.

---

## Etapa 2

### 8. Notificaciones (PWA)
Depende de: 1 (los avisos principales salen de 3 y 6)

- App instalable en el celular con notificaciones push.
- Avisos: sesión en 24 h y en 1 h, sesión reprogramada por el mentor, membresía por vencer, nuevo feedback del mentor, racha en riesgo, aprendiz inactivo (para el mentor), nuevo artículo del blog, "ya eres visible en la Vitrina".
- En iPhone el push solo funciona si el usuario agrega la app a la pantalla de inicio: mantener **correo de respaldo** para los avisos importantes.

### 9. Path AI Engineer (nombre pendiente)
Depende de: 2, 4

- Contenido propio, sin freeCodeCamp.
- El aprendiz marca su avance y el mentor lo valida.

### 10. Retos, code reviews y proyecto final
Depende de: 2, 4

- El aprendiz entrega proyectos y el mentor da feedback dentro de la app.
- El proyecto final aprobado es requisito para la Vitrina.

### 11. Gamificación
Depende de: 5, 9, 10

- Insignias, rachas y rangos por path, con la temática de espadas de la marca.
- La racha puede medirse por asistencia semanal a las mentorías.

---

## Etapa 3

### 12. Vitrina de Talento
Depende de: 1, 5, 9, 10

- Directorio de aprendices listos para contratar, abierto a reclutadores y empresas.
- **El aprendiz se publica automáticamente cuando cumple los requisitos:**
  - Path(s) completado(s), con certificaciones de freeCodeCamp o validación del mentor.
  - Proyecto final aprobado por el mentor.
  - Perfil completo (GitHub, portafolio, LinkedIn).
  - **Consentimiento del aprendiz**, que puede ocultarse cuando quiera (por ejemplo, al conseguir empleo).
- Recomendación del mentor visible en el perfil.
- Filtros para reclutadores: path, stack, país, idioma.
- Posible fuente de ingresos futura (acceso pago para empresas).
- Pendiente: definir qué paths cuentan (¿basta con Initiated o se requieren dos?).

### 13. Métricas de empleabilidad
Depende de: 12

- Aprendices en la Vitrina, contratados y tiempo promedio hasta el empleo.

---

## En paralelo

| Feature | Depende de | Notas |
|---|---|---|
| **Asistente virtual — landing** | 0.11 (FAQ) y las reglas del servicio definidas | Explica qué es SwordVoice, los paths, la membresía y cómo funciona la mentoría. Recomienda un path. Si no sabe responder, deriva al admin o al formulario de contacto. Puede salir antes del MVP |
| **Blog** | 1 | Escriben mentores (y quizá aprendices destacados); el admin aprueba antes de publicar. Los artículos aparecen en el perfil del autor |
| **Comunidad** | 1 | Espacio de preguntas por path o integración con Discord |
| **Asistente virtual — app** | Features del MVP | Ayuda de uso: "¿cómo vinculo freeCodeCamp?", "¿qué me falta para entrar a la Vitrina?" |

---

## Ideas en espera (no confirmadas)

- Test de diagnóstico al registrarse para recomendar un path.
- Preparación de entrevistas (simulacros de RRHH y técnicos).
- Checklist de empleabilidad (podría sumarse a los requisitos de la Vitrina).
- Bolsa de empleos.
- Casos de éxito.
- Evaluación de mentores por parte de los aprendices.
- Plan de carrera de aprendiz a mentor.
- **Cobros dentro de la plataforma:** pasarela de pago, página de Reembolsos independiente, actualización de Términos y Privacidad, activación automática de la membresía.
