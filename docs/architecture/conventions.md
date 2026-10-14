# Convenciones de arquitectura — SwordVoice

Fuente única de verdad para implementar código en este repo. `pnpm lint` hace cumplir las reglas de estructura (§1, §3); el resto se revisa en code review. Si una regla no cubre tu caso: **detente y pregunta**, no improvises.

Ejemplo canónico de punta a punta: el formulario de contacto de `src/features/home` (schema → service → hooks → componente → route → server).

## 1. Estructura

```
src/app/                 Solo routing de Next (page, layout, error, route). Sin lógica.
src/features/<page>/     Una carpeta por página/dominio.
  components/            Una carpeta kebab-case por componente con su index.tsx (ver §4.1)
  hooks/                 Lógica del módulo + useXxxQuery / useXxxMutation
  services/              Funciones cliente que llaman a request()
  server/                Solo servidor (import "server-only"); entra por server/index.ts
  schemas/               *.schema.ts (zod) → tipos con z.infer
  store/                 Slice Zustand (solo si §4.5 lo justifica)
  constants/             Incluye queryKeys.ts cuando haya queries
  utils/
  <Page>Page.tsx         Compone las secciones (components/). Sin estado ni efectos.
  index.ts               API pública (lo que consume app/)
src/common/              Lo compartido: components, providers, hooks, api, store, config, errors, utils, constants, assets
  providers/             Providers de React (QueryClient, Toaster…) que usa app/layout.tsx
```

## 2. Cuándo algo va a common

Nace en la feature. Se mueve a `common/` cuando lo usa **una segunda feature**. Excepción: los componentes base genéricos (button, input, textarea, typography) viven en `common/components/`.

## 3. Dependencias (ESLint las hace cumplir)

- `app` → `features/<x>` (solo `index.ts` o `server/index.ts`) → `common`.
- Una feature NO importa de otra feature. `common` NO importa de `features` ni de `app`.
- Dentro de una feature: `components → hooks → services → @/common/api`. Un componente nunca importa `services/` ni `server/`.
- `server/` solo se importa desde `src/app/api/**`.
- Imports siempre con `@/` (también dentro de la misma feature).

## 4. Reglas por capa

### 4.1 Componentes (composición por carpetas)
- NO hay carpetas `atoms` / `molecules` / `organisms`. Cada componente es una carpeta kebab-case con su `index.tsx`.
- Un componente que usa subcomponentes propios los lleva como carpetas hijas, cada una con su `index.tsx`:

  ```
  components/chat/
    index.tsx            <Chat/> compone a sus hijos
    history-chat/
      index.tsx          <HistoryChat/>
    input-chat/
      index.tsx          <InputChat/>
  ```

- Un hijo solo lo importa su padre. Si otro componente de la feature lo necesita, sube a `features/<x>/components/<nombre>/`; si lo necesita otra feature, a `common/components/<nombre>/`.
- Componentes base (un elemento visual, sin lógica de negocio): `src/common/components/input/index.tsx`.
- Componente con hijos: `src/common/components/navbar/index.tsx` → `navbar/nav-link/index.tsx`; `src/features/home/components/contact-section/index.tsx` → `contact-section/contact-form/index.tsx`.
- Los componentes usan hooks de su feature; nunca `services` ni `fetch`.
- **`<Page>Page.tsx`**: solo compone. Ej.: `src/features/home/HomePage.tsx`.
- Export nombrado en PascalCase (`export function ContactForm`), props en `type XxxProps`. Más de 150 líneas → divide en hijos.
- Import por carpeta: `@/features/home/components/contact-section/contact-form` (sin `/index`).
- Solo Tailwind. `"use client"` solo en el componente más bajo que lo necesite (usa hooks, eventos o framer-motion).

✅ `export function ServiceItem({ title }: ServiceItemProps)` · ❌ `export default (props: any) =>`

### 4.2 Hooks
- Crea un hook cuando la lógica tiene estado o efectos y es cerrada para el módulo, o cuando se reutiliza.
- Va en `features/<x>/hooks/useXxx.ts`; pasa a `common/hooks` al segundo uso entre features.
- Devuelve un objeto con nombre (no tuplas de más de 2 elementos).
- Máximo un `useEffect` por componente; si necesitas más → hook. Ej.: `src/features/home/hooks/useIsPastSection.ts`.

### 4.3 Formularios
- Siempre `react-hook-form` + `zodResolver`. Prohibido yup.
- Schema en `schemas/<nombre>.schema.ts`; tipo `export type XxxFormValues = z.infer<typeof xxxSchema>`. Mensajes en español dentro del schema. Strings con `.trim()` y `.max()`.
- La lógica va en `useXxxForm`, que devuelve `{ control, onSubmit, isSubmitting }` (ver `src/features/home/hooks/useContactForm.ts`).
- Todo campo se renderiza con `InputController` (`src/common/components/input-controller/index.tsx`): usa `useController` de react-hook-form por dentro y recibe solo lo que define el input — `control`, `name`, `label` y opcionales `type`, `autoComplete`, `placeholder`, `description` (texto de ayuda bajo el campo), `multiline` (textarea) y `options` (grupo de radios). `type="password"` añade el botón ver/ocultar; `type="checkbox"` guarda un boolean. El error del schema lo muestra solo.
- Prohibido usar `register`, `Controller` o `Input`/`Textarea` directamente en un formulario. Si necesitas otro tipo de campo (select, checkbox…), extiende `InputController` en `common/components/input-controller/` en vez de hacerlo en la feature.
- Ejemplo: `<InputController control={control} name="email" label="Correo electrónico" type="email" />` (ver `src/features/home/components/contact-section/contact-form/index.tsx`).

### 4.4 Endpoints
- Toda llamada HTTP del cliente pasa por `request(path, { method, body, schema })` de `@/common/api/httpClient`. Lanza `ApiError` si `!res.ok` o si la respuesta no cumple el schema.
- `services/<recurso>Service.ts`: funciones que solo llaman a `request`. Ej.: `src/features/home/services/contactService.ts`.
- `hooks/`: `useQuery` / `useMutation` envolviendo services. Query keys en `constants/queryKeys.ts`: `export const xKeys = { all: ["x"] as const, detail: (id: string) => ["x", id] as const }`.
- `app/api/**/route.ts`: `safeParse` del body con el MISMO schema → 400 `{ message }`; llama a `features/<x>/server`; 200 con JSON validable por el schema de respuesta; 500 `{ message }` genérico, y el error real solo a `console.error`. Ej.: `src/app/api/sendEmail/route.ts`.
- Prohibido `fetch` fuera de `src/common/api` y `src/features/*/server`.

### 4.5 Estado
- Datos de servidor: SOLO TanStack Query. Nunca se copian a Zustand ni a `useState`.
- Zustand: solo estado de cliente compartido por componentes no relacionados (sesión, UI global). Los globales van en `common/store/useXStore.ts` y los de una feature en `features/<x>/store/`. Se consumen con selector atómico: `useXStore((s) => s.value)`; nunca `useXStore()` entero.
- Estado local: `useState` en el componente o en su hook.

### 4.6 Errores y entorno
- `ApiError` es el único error de red. En las mutations: `onError: notifyError` (de `@/common/errors/notifyError`). Nunca un `toast.error` suelto para errores.
- Un `error.tsx` por segmento de ruta.
- Variables de servidor: añade la clave al schema de `src/common/config/env.ts` (server-only) y léela con `getServerEnv()` dentro de la función que la usa (nunca a nivel de módulo).
- Variables `NEXT_PUBLIC_*`: NUNCA en `env.ts` (es server-only y rompe el build si lo importa un componente cliente). Van en `src/common/config/publicEnv.ts`, sin `import "server-only"`, leyendo cada variable de forma literal para que Next la incruste: `export const publicEnv = z.object({ NEXT_PUBLIC_X: z.string() }).parse({ NEXT_PUBLIC_X: process.env.NEXT_PUBLIC_X })`. Ese archivo ya está permitido en ESLint.
- Prohibido `process.env` en cualquier otro lugar.
- Texto de usuario que va a HTML (emails): pásalo por `escapeHtml`.

### 4.7 Estilo
- TypeScript strict. Prohibidos `any`, `@ts-ignore` y `eslint-disable`.
- Componentes en `<carpeta-kebab-case>/index.tsx`; el resto en `camelCase.ts`; schemas en `*.schema.ts`; tests en `*.test.ts(x)` junto al archivo (`contact-form/index.test.tsx`).
- Exports nombrados (salvo los archivos que Next exige con export default en `app/`).
- Textos de UI en español.

## 5. Tests (Vitest + React Testing Library)
- Junto al código: `x.ts` → `x.test.ts`.
- Schemas: casos válidos e inválidos con el mensaje exacto (`src/features/home/schemas/contact.schema.test.ts`).
- Services / httpClient: `vi.spyOn(globalThis, "fetch")` — éxito, `!res.ok`, respuesta inválida (`src/common/api/httpClient.test.ts`).
- Hooks: `renderHook`; si usan React Query, `renderWithClient` de `test/renderWithClient.tsx`.
- Componentes: comportamiento visible con `getByRole` / `getByLabelText` + `userEvent`. Sin snapshots.
- Server y route handlers: `// @vitest-environment node` (`src/app/api/sendEmail/route.test.ts`, `src/features/home/server/deliverContactEmail.test.ts`).

## 6. Comandos
`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` — los cuatro en verde antes de entregar.
