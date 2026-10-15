# SwordVoice Academy

Landing de SwordVoice en evolución a app de mentorías (roadmap: `docs/roadmap/`). Next.js 15 App Router + React 19 + TypeScript + Tailwind, desplegado en Cloudflare con OpenNext.

## Comandos
- `pnpm dev` — servidor local
- `pnpm lint` — ESLint (incluye las reglas de arquitectura)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest
- `pnpm build` — build de Next
- `pnpm deploy` — build + deploy a Cloudflare

## Reglas
Toda implementación sigue `docs/architecture/conventions.md`. Ejemplos canónicos: `src/features/paths` (de schema a componente con React Query) y `src/app/(auth)` (rutas: layout + pages que componen, §4.8). Las reglas por ruta de archivo viven en `.claude/rules/`.

## Flujo con agentes
La sesión principal orquesta; los subagentes `developer` y `tester` (modelo Haiku, en `.claude/agents/`) ejecutan.
1. Dividir el trabajo en tareas pequeñas (una feature o capa), cada una con archivos objetivo y criterios de aceptación.
2. Invocar `developer`; revisar su diff contra conventions.md.
3. Invocar `tester` con el reporte del developer.
4. Si hay fallos, devolver la tarea al developer con el error exacto. Máximo 2 iteraciones; después la resuelve la sesión principal o se consulta al usuario.
5. Commit al cerrar cada tarea (lint, typecheck, test y build en verde).
