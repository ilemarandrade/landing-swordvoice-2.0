# Convenciones de arquitectura — SwordVoice

Fuente única de verdad para implementar código en este repo. `pnpm lint` hace cumplir las reglas de estructura (§1, §3); el resto se revisa en code review. Si una regla no cubre tu caso: **detente y pregunta**, no improvises.

Ejemplo canónico de punta a punta: la feature `src/features/paths` (schema → service con `request()` → `queryOptions` → hook → componente cliente → route).

## 1. Estructura

```
src/app/                 Rutas de Next: cada segmento compone su UI con los archivos especiales
                         (layout, page, error, not-found, loading, route…). Ver §4.8.
src/features/<dominio>/  Una carpeta por dominio (home, auth, legal, dashboard…).
  components/            Una carpeta kebab-case por componente con su index.tsx (ver §4.1)
  hooks/                 Lógica del módulo + useXxxQuery / useXxxMutation
  services/              Funciones cliente que llaman a request()
  server/                Solo servidor (import "server-only"); entra por server/index.ts
  schemas/               *.schema.ts (zod) → tipos con z.infer
  store/                 Slice Zustand (solo si §4.5 lo justifica)
  constants/             Incluye queryKeys.ts cuando haya queries
  utils/
  index.ts               API pública: secciones, componentes y constantes que componen las rutas de app/
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
- Las features NO definen páginas ni layouts (`XxxPage`, `XxxLayout`): exportan secciones y componentes, y la ruta los compone en `src/app` (§4.8).
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
- **Por ahora todas las peticiones a la API se hacen desde el cliente** con TanStack Query: ni `page.tsx`, ni `generateMetadata`, ni `sitemap.ts` llaman a la API, y no se usa prefetch ni `<HydrationBoundary>`. Flujo: schema → service → `queryOptions` → hook → componente cliente → `page.tsx` lo compone.
- Toda llamada HTTP pasa por `request(path, { method, body, params, schema })` de `@/common/api/httpClient`, que usa `fetch` nativo contra `NEXT_PUBLIC_API_URL` (timeout de 10 s), desempaqueta el sobre `{ statusCode, message, data }` y valida `data` con el schema. Lanza `ApiError(status, message, errorCode)` ante error de red, HTTP no-2xx o respuesta inválida.
- `services/<recurso>Service.ts`: funciones que solo llaman a `request`. Ej.: `src/features/paths/services/pathsService.ts`.
- `hooks/`: `useQuery` / `useMutation` envolviendo services. Query keys en `constants/queryKeys.ts`: `export const xKeys = { all: ["x"] as const, detail: (id: string) => ["x", id] as const }`.
- `app/api/**/route.ts`: `safeParse` del body con el MISMO schema → 400 `{ message }`; llama a `features/<x>/server`; 200 con JSON validable por el schema de respuesta; 500 `{ message }` genérico, y el error real solo a `console.error`.
- Prohibido usar `fetch` fuera de `src/common/api` y `src/features/*/server` (ESLint).
- Las queries se definen con `queryOptions` (solo `queryKey` + `queryFn`) en `hooks/` para reutilizarlas en el hook y en `useQueries`. Ej.: `src/features/paths/hooks/pathQueryOptions.ts`.
- La política global vive en `createQueryClient()` (`src/common/api/queryClient.ts`), que `Providers` instancia una vez con `useState`: `staleTime` de 60 s y sin reintentos ante 4xx. No repitas `retry` ni `staleTime` en cada query salvo que esa query necesite otra cosa.
- Los estados derivados de un error (p. ej. `isNotFound` ante un 404) los calcula el hook, no el componente. Ej.: `src/features/paths/hooks/usePathDetailQuery.ts`.

### 4.5 Estado
- Datos de servidor: SOLO TanStack Query. Nunca se copian a Zustand ni a `useState`.
- Zustand: solo estado de cliente compartido por componentes no relacionados (sesión, UI global). Los globales van en `common/store/useXStore.ts` y los de una feature en `features/<x>/store/`. Se consumen con selector atómico: `useXStore((s) => s.value)`; nunca `useXStore()` entero.
- Estado local: `useState` en el componente o en su hook.

### 4.6 Errores y entorno
- `ApiError` es el único error de red. En las mutations: `onError: notifyError` (de `@/common/errors/notifyError`). Nunca un `toast.error` suelto para errores.
- `src/app/error.tsx` cubre todos los segmentos hijos (incluidos los grupos `(marketing)`, `(auth)`, `(app)`). Añade un `error.tsx` propio solo cuando un segmento necesite una pantalla de error distinta.
- Variables de servidor: añade la clave al schema de `src/common/config/env.ts` (server-only) y léela con `getServerEnv()` dentro de la función que la usa (nunca a nivel de módulo).
- Variables `NEXT_PUBLIC_*`: NUNCA en `env.ts` (es server-only y rompe el build si lo importa un componente cliente). Van en `src/common/config/publicEnv.ts`, sin `import "server-only"`, leyendo cada variable de forma literal para que Next la incruste: `export const publicEnv = z.object({ NEXT_PUBLIC_X: z.string() }).parse({ NEXT_PUBLIC_X: process.env.NEXT_PUBLIC_X })`. Ese archivo ya está permitido en ESLint. Ej.: `NEXT_PUBLIC_API_URL`.
- Prohibido `process.env` en cualquier otro lugar.

### 4.7 Estilo
- TypeScript strict. Prohibidos `any`, `@ts-ignore` y `eslint-disable`.
- Componentes en `<carpeta-kebab-case>/index.tsx`; el resto en `camelCase.ts`; schemas en `*.schema.ts`; tests en `*.test.ts(x)` junto al archivo (`contact-form/index.test.tsx`).
- Exports nombrados (salvo los archivos que Next exige con export default en `app/`).
- Textos de UI en español.

### 4.8 Rutas (App Router)
Next.js 15.5. Referencia: https://nextjs.org/docs/app/getting-started/project-structure

- Las features no exportan componentes con nombre `XxxPage` ni `XxxLayout` (el lint lo bloquea); un marco reutilizable dentro de una feature se nombra por lo que es (`AuthBottomBar`, `DashboardSidebar`).
- **`layout.tsx` es el marco del segmento**: renderiza directamente lo que comparten sus rutas (navbar, `<main>`, footer, guard de sesión) y recibe `children`. No envuelvas un componente `XxxLayout` de una feature. Ej.: `src/app/(auth)/layout.tsx`.
- **`page.tsx` compone la ruta**: importa las secciones desde `@/features/<x>` y las ordena; exporta `metadata` (o `generateMetadata` si depende de `params`) cuando la ruta necesita su propio título o descripción; si no, hereda el del layout. Sin estado ni efectos. Ej.: `src/app/(auth)/iniciar-sesion/page.tsx`.
- `page.tsx` y `layout.tsx` son **Server Components**: nunca `"use client"`. La interactividad va en un componente cliente de la feature o de `common`.
- **Route groups `(nombre)`** para compartir un layout entre rutas sin cambiar la URL; se pueden anidar (`(marketing)/(legal)`). Una carpeta sin `page.tsx` ni `route.ts` no es ruta.
- **Archivos especiales**, solo cuando aportan:
  - `error.tsx` (cliente): `src/app/error.tsx` cubre todos los segmentos hijos. Añade uno propio solo si un segmento necesita otra pantalla de error.
  - `global-error.tsx` (cliente): reemplaza al layout raíz si este falla; trae su propio `<html lang="es">` y `<body>` e importa `globals.css`. Al ser cliente, la Metadata API no aplica: si necesita título, usa `<title>` dentro de su `<html>`.
  - `not-found.tsx`: `src/app/not-found.tsx` atiende URLs inexistentes y las llamadas a `notFound()`.
  - `loading.tsx`: solo en segmentos con trabajo asíncrono en el servidor (fetch en un Server Component). No sirve para estado de cliente.
  - `template.tsx` solo si el estado debe reiniciarse en cada navegación; `default.tsx` solo con rutas paralelas (`@slot`).
  - `route.ts` solo en `src/app/api/**` (§4.4).
- **Metadata**: con la Metadata API (`metadata` / `generateMetadata`) en `layout.tsx` o `page.tsx`, nunca con `<head>` ni `<title>` manuales (salvo en `global-error.tsx`). El título usa la plantilla del layout raíz (`%s · Swordvoice Academy`), así que la página solo da su parte. Las rutas privadas declaran `robots: { index: false, follow: false }` en el layout de su grupo. `sitemap.ts`, `robots.ts`, `favicon.ico` y `opengraph-image.*` viven en `src/app`.
- **Parámetros dinámicos**: en Next 15 `params` y `searchParams` son `Promise`: `const { slug } = await params`.
- **Navegación y recursos**: `next/link` para links internos; `redirect()` y `notFound()` de `next/navigation` en el servidor, `useRouter` solo en handlers de cliente; `next/image` para imágenes (el lint prohíbe `<img>`); fuentes con `next/font` en el layout raíz.
- **Middleware**: `src/middleware.ts` (en Next 15 todavía no se llama `proxy.ts`).

## 5. Tests (Vitest + React Testing Library)
- Junto al código: `x.ts` → `x.test.ts`.
- Schemas: casos válidos e inválidos con el mensaje exacto (`src/features/home/schemas/contact.schema.test.ts`).
- Services / httpClient: `vi.spyOn(globalThis, "fetch")` — éxito, `!res.ok`, respuesta inválida (`src/common/api/httpClient.test.ts`).
- Hooks: `renderHook`; si usan React Query, `renderWithClient` de `test/renderWithClient.tsx`.
- Componentes: comportamiento visible con `getByRole` / `getByLabelText` + `userEvent`. Sin snapshots.
- Server y route handlers: `// @vitest-environment node`.

## 6. Comandos
`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` — los cuatro en verde antes de entregar.
