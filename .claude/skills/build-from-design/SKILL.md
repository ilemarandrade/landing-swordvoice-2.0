---
name: build-from-design
description: Implementa en este proyecto (Next.js + Tailwind) un diseño hecho en Claude Design. Úsala cuando el usuario pase un link de artifact de claude.ai (claude.ai/artifact/… o claude.ai/code/artifact/…) o un export .html de Claude Design y pida construirlo, implementarlo, maquetarlo o pasarlo a código ("implementa este diseño", "construye esta vista", "pásalo al proyecto").
---

# Construir un diseño de Claude Design

Un export de Claude Design es un prototipo: HTML + CSS con tokens en `:root` y, casi siempre, render con JS vanilla. **Es la referencia visual, no código para copiar.** Se reconstruye con la arquitectura del repo: `docs/architecture/conventions.md` manda sobre todo lo que diga el export.

## Regla de oro: reusar antes que crear

El diseño se adapta al sistema existente, no al revés.

- **Lo que ya existe no se reescribe.** Componentes de `src/common/components` y de las features, íconos de `src/common/assets/icons`, tokens de `tailwind.config.ts`, fuentes y fondos de `public/`: se importan y se usan tal cual.
- **Solo se crean piezas que no existen**: componentes, íconos, tokens o assets nuevos. Cada uno sigue el estilo de sus vecinos: misma estructura de carpeta, mismos props, mismos tokens y misma tipografía.
- **Si el diseño difiere de algo existente** (un botón con otro padding, una card con otro radio, una sección ya hecha con otro layout), no lo modifiques. Anótalo en el inventario como diferencia y deja que el usuario decida entre tres opciones:
  - usar lo existente tal cual (es la opción por defecto);
  - añadir una variante o prop sin romper los usos actuales;
  - rediseñarlo, solo si lo pide explícitamente.
- Lo mismo con los tokens: un valor del export que se parece a un token existente usa el token existente. Uno nuevo solo entra si no hay equivalente.

## 1. Conseguir el HTML

- **Link de claude.ai**: léelo con el tool `Artifact` (`action: "read"`, `url`), nunca con WebFetch ni curl. El resultado indica el archivo local donde quedó la página completa: usa ese archivo. Si el artifact es de otra persona solo recibes un resumen: pídele al usuario el export `.html`.
- **Archivo `.html` local**: úsalo directamente. No lo leas entero: suelen pesar cientos de KB por las fuentes en base64.

## 2. Limpiar y detectar lo que ya existe

Ejecuta desde la raíz del repo:

```bash
node .claude/skills/build-from-design/scripts/clean-export.mjs <export.html> <scratchpad>/design-clean.html --assets <scratchpad>/design-assets
```

El script:
- quita el base64 y los paths SVG largos;
- compara cada asset (por hash) y cada path SVG con `public/` y `src/`;
- imprime `REUSAR → ruta` o `NUEVO` para cada uno, más los tokens de `:root`;
- extrae a `--assets` solo los assets nuevos. En `design-clean.html` los existentes quedan marcados como `existe: <ruta>`.

Lee `design-clean.html` por partes con Read o Grep.

Descarta lo que es del prototipo y no del producto: controles de "Vista previa" (p. ej. `<nav class="pv">`), botones para alternar vistas o estados, datos mock y estilos de esa barra.

## 3. Inventario (muéstralo al usuario)

1. **Vistas y estados**: cada pantalla y variante (público/logueado, vacío, error, cargando, mobile). Los toggles del preview suelen revelarlas: busca la función que pinta cada una.
2. **Buscar equivalentes antes de proponer nada.** Por cada sección y componente del diseño:
   - Glob `src/features/*/components/**/index.tsx` y `src/common/components/**/index.tsx`.
   - Grep por textos visibles del diseño (títulos como "Nuestros Paths") y por propósito (button, card, badge, progress, accordion).
   - Lee los candidatos.

   Clasifica cada pieza en una tabla:

   | Pieza del diseño | Estado | Archivo existente / destino |
   |---|---|---|
   | Botón "Ver path" | REUSAR | `src/common/components/button-link` |
   | Sección "Nuestros Paths" | EXISTE, DIFIERE (describe la diferencia) | `src/features/home/components/paths-section` |
   | Acordeón de temas | NUEVO | `src/features/<x>/components/...` |

3. **Tokens**: compara cada variable de `:root` con `tailwind.config.ts` y `src/app/globals.css`:
   - mismo valor → REUSAR (`--primary:#ff7a00` = `primary`);
   - valor cercano → usa el existente y anota la diferencia;
   - sin equivalente → NUEVO, con su nombre propuesto en `theme.extend`.

   Aplica lo mismo a la escala tipográfica (`fontSize`): ajusta el diseño a la escala existente y propón ampliarla solo si un tamaño no tiene equivalente.
4. **Assets e íconos**: usa la salida del script. Los marcados REUSAR se importan desde su ruta. Para los NUEVOS:
   - imágenes → `public/` + `next/image`;
   - fuentes → `next/font` en el layout raíz;
   - SVG → `src/common/assets/icons/<Nombre>Icon.tsx`, con el mismo formato que los íconos vecinos.
5. **Comportamiento**: qué es estático, qué es interactivo (necesita `"use client"` en el componente más bajo) y qué datos vendrían del servidor. La lógica pura del prototipo (cálculos, ordenamientos) se vuelve una función en `utils/` con tests. Lo que el diseño no define (textos finales, endpoints, reglas) se pregunta, no se inventa.

## 4. Mapeo a la arquitectura

- Las piezas NUEVAS van en `src/features/<dominio>/components/<kebab-case>/index.tsx`, con los hijos anidados (§4.1). Pasan a `common/` solo si otra feature ya las usa (§2).
- Las piezas REUSAR se importan sin tocarlas. Las de EXISTE, DIFIERE siguen la decisión del usuario.
- La ruta se compone en `src/app/...` siguiendo §4.8 y `.claude/rules/nextjs-app-router.md`:
  - `page.tsx` ordena las secciones y exporta `metadata`.
  - Los layouts son Server Components.
- Solo Tailwind con los tokens del repo. Las clases CSS del export se traducen a utilidades; no se pegan como `<style>` ni CSS suelto, y no hay colores hex sueltos en `className` si existe un token. Los textos de UI van en español.

## 5. Plan y ejecución

1. Divide en tareas chicas (tokens/assets nuevos → componentes nuevos → secciones → ruta). Cada tarea lleva:
   - sus archivos objetivo, marcados como **crear** o **editar**. Solo se editan archivos existentes que el usuario aprobó en el inventario;
   - sus criterios de aceptación, incluido el visual: "coincide con la vista X del diseño en desktop y 375px".

   **Presenta el plan y espera el OK del usuario.**
2. Por tarea, sigue el flujo de `CLAUDE.md`:
   1. Agente `developer`. Pásale la ruta de `design-clean.html`, el fragmento relevante y la tabla del inventario, con la instrucción explícita de **importar las piezas REUSAR y no modificar archivos fuera de su lista**.
   2. Revisa su diff contra conventions.md y contra esa lista. Si tocó un archivo existente no aprobado, lo devuelves.
   3. Agente `tester`.
   4. Si algo falla, máximo 2 iteraciones.
3. Verificación visual: levanta la app (skill `run`) y compara cada vista con el export abierto en el navegador, en desktop y mobile. Anota las diferencias que queden, sobre todo las que vienen de reusar componentes existentes.
4. Con `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde, haz un commit por tarea.

## Errores comunes

- Reescribir o "ajustar de paso" un componente existente para que calce con el diseño.
- Crear un componente, ícono o token que ya existe con otro nombre (`--primary` vs `primary`, un `PathCard` nuevo junto a `path-available`).
- Copiar el HTML/CSS del export tal cual, o meter su JS en un `useEffect`.
- Duplicar fuentes o fondos que ya están en `public/` o `src/common/assets`.
- Implementar la barra de "Vista previa" o los datos mock como si fueran parte del producto.
- Leer el export sin limpiarlo y agotar el contexto con base64.
