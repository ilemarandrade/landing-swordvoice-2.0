# Agentes Haiku (developer + tester) y convenciones de arquitectura — Diseño

- **Fecha:** 2026-10-14
- **Estado:** aprobado en brainstorming, pendiente de revisión del spec
- **Alcance:** solo el repo `landing-swordvoice-2.0`

## 1. Objetivo

Delegar la implementación y el testing a dos subagentes de Claude Code que usan el modelo **Haiku** (más barato). Como un modelo pequeño improvisa cuando las reglas son ambiguas, el diseño tiene tres piezas:

1. Un **reglamento único** (`docs/architecture/conventions.md`) con reglas cerradas por capa y ejemplos canónicos.
2. **Agentes delgados**, cuyo prompt define rol, proceso, prohibiciones y formato de reporte, y los remite al reglamento.
3. Un **linter** (ESLint) que convierte las reglas de estructura en errores mecánicos que Haiku corrige.

El orquestador es la sesión principal (Opus). Planifica, reparte tareas, revisa diffs contra el reglamento e itera.

**Criterio de éxito:** una tarea típica (p. ej. "formulario nuevo con su endpoint") la implementa el developer, la testea el tester y queda con `lint`, `typecheck`, `test` y `build` en verde, sin violar ninguna regla de dependencia ni de capa.

## 2. Decisiones

| Tema | Decisión |
|---|---|
| Orquestación | La sesión principal orquesta; developer y tester son subagentes `model: haiku` |
| Empaquetado de reglas | Enfoque A: `conventions.md` único + agentes delgados + enforcement ESLint |
| Tests | Vitest + React Testing Library (sin E2E por ahora) |
| Formularios | react-hook-form + zod (`@hookform/resolvers/zod`); se elimina yup |
| Datos de servidor | TanStack Query sobre un `httpClient` único que valida con zod |
| Estado global | Zustand solo para estado de cliente; se instala, pero no se crea ningún store hasta que el MVP lo necesite (sesión/rol) |
| Estructura | Screaming por página en `src/features/<page>`, compartido en `src/common` |
| Código existente | Se migra a la nueva estructura y sirve como implementación de referencia |

## 3. Estructura de carpetas

```
src/
├─ app/                              # SOLO routing de Next (page, layout, error, route)
│  ├─ layout.tsx                     #   providers (QueryClientProvider, Toaster)
│  ├─ page.tsx                       #   import { HomePage } from "@/features/home"; render
│  ├─ error.tsx                      #   error boundary del segmento
│  └─ api/<recurso>/route.ts         #   handler delgado: valida con schema → llama a features/x/server
├─ features/
│  └─ <page>/                        # una carpeta por página/dominio
│     ├─ components/
│     │  ├─ atoms/                   #   solo si el atom es exclusivo de la página
│     │  ├─ molecules/
│     │  └─ organisms/
│     ├─ hooks/                      #   lógica del módulo + useXxxQuery / useXxxMutation
│     ├─ services/                   #   funciones cliente que llaman a httpClient
│     ├─ server/                     #   código solo-servidor (import "server-only")
│     ├─ schemas/                    #   *.schema.ts (zod) → tipos con z.infer
│     ├─ store/                      #   slice Zustand, solo si hace falta (ver §4.5)
│     ├─ constants/                  #   incluye queryKeys.ts
│     ├─ <Page>Page.tsx              #   compone organisms, sin lógica
│     └─ index.ts                    #   API pública del módulo
└─ common/
   ├─ components/{atoms,molecules,organisms}/
   ├─ hooks/
   ├─ api/                           #   httpClient.ts, ApiError.ts, queryClient.ts
   ├─ store/                         #   stores Zustand globales
   ├─ config/env.ts                  #   env validado con zod (server y public separados)
   ├─ errors/                        #   notifyError, utilidades de error
   ├─ utils/
   └─ constants/
```

### Reglas de dependencia (las verifica ESLint)

- `app` → `features/*` (solo vía `index.ts`) → `common`.
- Una feature **no** importa de otra feature.
- `common` **no** importa de `features` ni de `app`.
- Dentro de una feature: `components` → `hooks` → `services` → `common/api`. Un componente no importa `services` ni `server`.
- `server/` solo se importa desde `app/api/**` y desde otros archivos de `server/`.
- `index.ts` exporta lo que `app/` consume: el componente de página y, si existen, los handlers de `server`. `server/` se exporta desde un entrypoint separado, `features/<page>/server/index.ts`, para no arrastrar código de servidor al bundle cliente.

### Promoción a `common`

Algo se mueve a `common/` cuando lo usa una **segunda** feature, no antes. Los atoms genéricos (Button, Input, Typography…) nacen en `common`.

## 4. Reglas por capa

Estas reglas son el contenido normativo de `docs/architecture/conventions.md`. Cada regla del reglamento lleva un ejemplo "✅ así / ❌ no así".

### 4.1 Componentes (atomic design)

- **atoms:** un elemento visual sin lógica de negocio ni hooks de datos. Props tipadas con `type XxxProps`.
- **molecules:** composición de atoms (p. ej. `FormField` = label + input + mensaje de error). Sin hooks de datos.
- **organisms:** secciones con comportamiento. Pueden usar hooks de su feature. No llaman a services ni a `fetch`.
- **`<Page>Page.tsx`:** solo compone organisms y layout, sin estado ni efectos.
- Un componente por archivo, en `PascalCase.tsx`, con export nombrado. Si pasa de 150 líneas, se divide.
- Estilos solo con Tailwind (sin CSS por componente).
- `"use client"` solo en el componente más bajo que lo necesite.

### 4.2 Hooks

- Se crea un hook cuando la lógica tiene estado o efectos y es cerrada para un módulo, o cuando se reutiliza.
- Ubicación: `features/<page>/hooks` si es del módulo; `common/hooks` desde el segundo uso entre features.
- Nombre `useXxx`, en archivo `useXxx.ts`. Devuelve un objeto con nombre (no tuplas de más de 2 elementos).
- Un componente tiene como máximo un `useEffect`; si necesita más, la lógica va a un hook.

### 4.3 Formularios

- Siempre `react-hook-form` + `zodResolver`.
- El schema va en `schemas/<nombre>.schema.ts`, y el tipo se obtiene con `export type XxxFormValues = z.infer<typeof xxxSchema>`.
- La lógica va en un hook `useXxxForm`, que devuelve `{ register, errors, onSubmit, isSubmitting }` y orquesta la mutation, los toasts y el reset.
- El organism solo renderiza. Los inputs son atoms de `common` que reciben `error?: string`.
- Los mensajes de validación van en español, dentro del schema.

### 4.4 Endpoints

- `common/api/httpClient.ts` expone `request<T>(path, { method, body, schema })`. Hace `fetch` y, si `!res.ok`, lanza `ApiError` (status, message). Valida el JSON de la respuesta con `schema.parse`.
- `services/<recurso>Service.ts` contiene funciones puras y tipadas (`sendContactEmail(values)`) que solo llaman a `request`.
- `hooks/` envuelve services con `useQuery` / `useMutation`. Las query keys van centralizadas en `constants/queryKeys.ts`.
- `app/api/**/route.ts` valida el body con el **mismo** schema zod (`safeParse`; si falla, responde 400), llama al handler de `features/<page>/server` y responde 200, 400 o 500 sin filtrar errores internos.
- Prohibido `fetch` fuera de `common/api` y de `server/`.

### 4.5 Estado

- **Datos de servidor:** solo TanStack Query. Nunca se copian a Zustand ni a `useState`.
- **Zustand:** solo estado de cliente que cruza componentes no relacionados. Los stores globales van en `common/store` y los de una feature en `features/<page>/store`. Se consumen con selectores atómicos (`useXStore(s => s.value)`), nunca con el store completo.
- **Estado local** (abierto/cerrado, valor temporal): `useState` en el componente o en su hook.

### 4.6 Errores y entorno

- `ApiError` es la única clase de error de red. `common/errors/notifyError(error)` traduce el error a un toast (react-hot-toast).
- Las mutations muestran el error con `notifyError` en `onError`, nunca con un `toast` suelto.
- Hay un `error.tsx` por segmento de ruta.
- `common/config/env.ts` valida `process.env` con zod y exporta `serverEnv` (solo-servidor, con `import "server-only"`) y `publicEnv` (`NEXT_PUBLIC_*`). Prohibido leer `process.env` fuera de ese archivo.

### 4.7 Estilo de código

- TypeScript strict, sin `any`. Imports con el alias `@/`.
- Componentes en `PascalCase.tsx`; el resto en `camelCase.ts`; schemas en `*.schema.ts`; tests en `*.test.ts(x)` junto al archivo que prueban.
- Exports nombrados (salvo los archivos de `app/` que Next exige por defecto).

## 5. Agentes

### 5.1 `.claude/agents/developer.md`

- **Frontmatter:** `name: developer`, `model: haiku`, `tools: Read, Edit, Write, Glob, Grep, Bash`.
- **Entrada:** una tarea del orquestador con objetivo, archivos o feature afectados y criterios de aceptación.
- **Proceso:**
  1. Leer `docs/architecture/conventions.md`.
  2. Leer el código de la feature afectada y el ejemplo canónico (feature `home`, flujo de contacto).
  3. Implementar.
  4. Ejecutar `pnpm lint && pnpm typecheck` y corregir hasta que pase en verde.
- **Prohibido:** instalar o quitar dependencias, tocar archivos fuera del alcance de la tarea, escribir tests, hacer commits, desactivar reglas de lint (`eslint-disable`) y usar `any`.
- **Si una regla no cubre el caso, se detiene y lo reporta como duda**, sin improvisar.
- **Salida (formato fijo):** archivos creados o modificados; decisiones tomadas; checklist del reglamento (§4.1–4.7, sí/no/no aplica); resultado de lint y typecheck; dudas.

### 5.2 `.claude/agents/tester.md`

- **Frontmatter:** `name: tester`, `model: haiku`, `tools: Read, Edit, Write, Glob, Grep, Bash`.
- **Entrada:** el reporte del developer más los criterios de aceptación.
- **Qué testea** (Vitest + RTL, archivos `*.test.ts(x)` junto al código):
  - schemas: casos válidos e inválidos, incluidos los mensajes;
  - services: con `fetch` mockeado (éxito, `!res.ok` → `ApiError`, respuesta inválida);
  - hooks: `renderHook` con un `QueryClient` de prueba (`retry: false`);
  - organisms: comportamiento visible, con queries `getByRole` / `getByLabelText` y `userEvent`. Sin snapshots.
- **Proceso:** leer el reglamento → escribir tests → `pnpm test`.
- **Prohibido:** modificar código de producción, instalar dependencias y hacer commits. Si un test revela un bug, lo reporta con el test que falla.
- **Salida:** tests creados, resultado de `pnpm test` y bugs encontrados (archivo, test, esperado contra obtenido).

### 5.3 Ciclo del orquestador

1. Dividir el plan en tareas pequeñas, de una feature o capa cada una.
2. Invocar al developer y revisar su diff contra el reglamento.
3. Invocar al tester.
4. Si hay fallos, devolver la tarea al developer con el error exacto. **Máximo 2 iteraciones**; después el orquestador lo resuelve o consulta al usuario.
5. Hacer commit al cerrar cada tarea.

### 5.4 `CLAUDE.md` (nuevo)

Incluye un resumen del proyecto, los comandos (`dev`, `lint`, `typecheck`, `test`, `build`), la regla "toda implementación sigue `docs/architecture/conventions.md`" y la descripción del ciclo de §5.3.

## 6. Enforcement (ESLint, `.eslintrc.json`)

- Se mantiene `next/core-web-vitals`. Se añade `eslint-plugin-boundaries` con los elementos `app` (`src/app/**`), `feature` (`src/features/*`, capturando el nombre), `feature-server` (`src/features/*/server/**`) y `common` (`src/common/**`), con las reglas de §3.
  - `app` puede importar `feature` (solo vía index), `feature-server` y `common`.
  - `feature` puede importar su propia feature y `common`.
  - `common` solo puede importar `common`.
- `boundaries/entry-point`: desde fuera de una feature solo se importa `index.ts` o `server/index.ts`.
- `no-restricted-imports`: `yup` está prohibido.
- `no-restricted-syntax` / `no-restricted-globals`: `fetch` está prohibido fuera de `src/common/api/**` y de `src/features/*/server/**`; `process.env` está prohibido fuera de `src/common/config/env.ts`.
- `@typescript-eslint/no-explicit-any`: error.

## 7. Dependencias y scripts

- **Agregar:** `zod`, `@tanstack/react-query`, `zustand`, `server-only`.
- **Agregar (dev):** `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `eslint-plugin-boundaries`, `vite-tsconfig-paths`.
- **Quitar:** `yup`.
- **Scripts:** `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`.
- **Config:** `vitest.config.ts` (jsdom, setup con jest-dom, alias `@/`).

## 8. Migración de la landing actual

| Origen | Destino |
|---|---|
| `src/components/{Button,Input,Textarea,Typography}` | `src/common/components/atoms/` |
| `src/components/Navbar` | `src/common/components/organisms/` |
| `src/components/{PathAvailable,Services,SwordvoicesCard,SwordVoicesCarousel}` | `src/features/home/components/` (en el nivel atómico que corresponda) |
| `src/constants/animations/*`, `paths.ts`, `services.ts`, `swordvoices.tsx` | `src/features/home/constants/` |
| `src/constants/{site,routes}.ts` | `src/common/constants/` |
| `src/app/hooks/{useIsMobile,useBackToTopButton}.tsx` | `src/common/hooks/` (`.ts` si no tienen JSX) |
| Secciones de `src/app/page.tsx` | organisms en `src/features/home/components/organisms/` + `HomePage.tsx` |
| Flujo de contacto (`useSendEmailOfContact`, `sendEmailService`, `api/sendEmail/route.ts`) | ejemplo canónico, ver abajo |

El **flujo de contacto** se rehace como implementación de referencia de punta a punta:

- `features/home/schemas/contact.schema.ts`: el schema del formulario (`name`, `email`, `message`) se comparte con el route handler.
- `features/home/services/contactService.ts`: `sendContactEmail(values)` llama a `request("/api/sendEmail", …)`.
- `features/home/hooks/useSendContactEmail.ts` es la mutation; `useContactForm.ts` combina RHF, zod y la mutation, y maneja los toasts.
- `features/home/components/organisms/ContactForm.tsx` solo renderiza.
- `features/home/server/sendContactEmail.ts` usa nodemailer con `serverEnv`. Se corrigen tres defectos actuales:
  1. `sendMail` se usa con callback y el error nunca llega al handler, así que el endpoint siempre responde 200. Pasa a `await transporter.sendMail(...)`.
  2. El cliente no revisa `res.ok`, así que un 500 se muestra como éxito. `httpClient` lo resuelve.
  3. El nombre y el mensaje del usuario se interpolan en HTML sin escapar. Se escapan antes de construir el HTML.
- `app/api/sendEmail/route.ts` hace `safeParse` y responde 400 si falla; después llama al server handler y responde 200 o 500.

Además, `app/layout.tsx` incorpora `QueryClientProvider` (vía un organism cliente `Providers` en `common`) y el `Toaster` existente. Se añade `app/error.tsx`.

**Fuera de alcance:** cambios visuales, contenido nuevo y features del roadmap.

## 9. Verificación

1. `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde.
2. Tests de referencia del contacto: schema, service, `useContactForm` y `ContactForm`.
3. Prueba de que el lint muerde: un import temporal de `features/home` desde `common` debe fallar en `pnpm lint` (se revierte).
4. `pnpm dev`: la landing se ve igual que antes (revisión manual sección por sección) y el formulario de contacto envía. Un envío con el SMTP fallando muestra el toast de error.

## 10. Riesgos

- **La migración toca casi toda la landing.** Se hace en la rama `chore/haiku-agents-conventions`, con un commit por bloque (deps y config → common → features/home → contacto → agentes y docs) y `build` en verde en cada commit.
- **nodemailer en Cloudflare Workers (OpenNext).** La migración no cambia el runtime del endpoint. Si hoy no funciona en producción, se reporta aparte y no se resuelve aquí.
- **Haiku puede ignorar el reglamento.** Lo mitigan el lint como red mecánica, el checklist obligatorio en el reporte y la revisión del orquestador.
- **Reglas de lint demasiado estrictas o mal configuradas** pueden bloquear casos legítimos. Se ajustan en el reglamento y en la config a la vez, nunca con `eslint-disable`.
