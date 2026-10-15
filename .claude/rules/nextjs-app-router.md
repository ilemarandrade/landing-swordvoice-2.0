---
paths:
  - "src/app/**"
---

# Rutas de Next.js (App Router)

Antes de crear o editar un archivo en `src/app`, aplica `docs/architecture/conventions.md` §4.8. Lo esencial:

- `layout.tsx` renderiza el marco del segmento (navbar, `<main>`, footer, guard); nunca envuelve un `XxxLayout` de una feature.
- `page.tsx` compone las secciones importadas de `@/features/<x>` y exporta `metadata`; nunca reenvía a un `XxxPage`.
- `page.tsx` y `layout.tsx` son Server Components: sin `"use client"`.
- Route groups `(nombre)` para compartir layouts sin cambiar la URL.
- Archivos especiales solo cuando aportan: `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx` (solo con trabajo asíncrono en el servidor), `route.ts` (solo en `api/`).
- Next 15.5: `params`/`searchParams` son `Promise`; el middleware es `src/middleware.ts`.
