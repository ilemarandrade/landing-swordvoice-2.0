#!/usr/bin/env node
// Limpia un export HTML de Claude Design para poder leerlo y detecta qué ya existe en el repo:
// - reemplaza los data: URI en base64 y los paths SVG largos por marcadores;
// - compara cada asset embebido (por hash) con public/ y src/;
// - busca cada path SVG del export en los .tsx/.svg de src/ y public/;
// - opcionalmente extrae a una carpeta los assets que NO existen todavía.
//
// Uso (desde la raíz del repo):
//   node clean-export.mjs <export.html> <salida.html> [--assets <carpeta>]

import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const [input, output, flag, assetsDir] = process.argv.slice(2);
if (!input || !output || (flag && (flag !== "--assets" || !assetsDir))) {
  console.error("Uso: node clean-export.mjs <export.html> <salida.html> [--assets <carpeta>]");
  process.exit(1);
}

const EXT = { "font/ttf": "ttf", "font/otf": "otf", "font/woff": "woff", "font/woff2": "woff2",
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };
const SKIP_DIRS = new Set(["node_modules", ".next", ".open-next", ".git", ".wrangler"]);

const md5 = (buf) => createHash("md5").update(buf).digest("hex");

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const repoFiles = [...walk("public"), ...walk("src")];
const repoHashes = new Map();
for (const f of repoFiles) {
  if (/\.(ttf|otf|woff2?|png|jpe?g|webp|gif|svg|ico)$/i.test(f)) repoHashes.set(md5(readFileSync(f)), relative(".", f));
}
const sourceFiles = repoFiles
  .filter((f) => /\.(tsx|svg)$/i.test(f))
  .map((f) => ({ path: relative(".", f), text: readFileSync(f, "utf8") }));

const html = readFileSync(input, "utf8");

// Assets embebidos: se agrupan por hash para no repetir el mismo archivo.
const assets = new Map();
let cleaned = html.replace(/data:([\w/+.-]+);base64,[A-Za-z0-9+/=]+/g, (match, mime) => {
  const buf = Buffer.from(match.slice(match.indexOf(",") + 1), "base64");
  const hash = md5(buf);
  if (!assets.has(hash)) {
    assets.set(hash, { id: `asset-${assets.size + 1}.${EXT[mime] ?? "bin"}`, mime, buf, uses: 0, existing: repoHashes.get(hash) });
  }
  const asset = assets.get(hash);
  asset.uses += 1;
  return `data:${mime};base64,[${asset.existing ? `existe: ${asset.existing}` : asset.id}]`;
});

// Paths SVG: se buscan en el repo (por su inicio, sin espacios) antes de acortarlos.
const norm = (s) => s.replace(/\s+/g, "");
const svgPaths = [];
cleaned = cleaned.replace(/\sd="([^"]{40,})"/g, (match, d) => {
  const needle = norm(d).slice(0, 40);
  const found = sourceFiles.find((f) => norm(f.text).includes(needle));
  svgPaths.push({ start: d.slice(0, 30), existing: found?.path });
  if (d.length < 120) return found ? `${match} data-existe="${found.path}"` : match;
  return ` d="[svg-path${found ? `; existe: ${found.path}` : ""}]"`;
});

writeFileSync(output, cleaned);

if (assetsDir) {
  mkdirSync(assetsDir, { recursive: true });
  for (const a of assets.values()) if (!a.existing) writeFileSync(join(assetsDir, a.id), a.buf);
}

const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "(sin título)";
const rootVars = [...(html.match(/:root\s*\{([^}]*)\}/)?.[1] ?? "").matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)];

console.log(`Título: ${title}`);
console.log(`Tamaño: ${Math.round(html.length / 1024)} KB → ${Math.round(cleaned.length / 1024)} KB (${cleaned.split("\n").length} líneas)`);
console.log(`\nAssets embebidos (${assets.size} únicos)${assetsDir ? ` — solo los nuevos se extraen a ${assetsDir}` : ""}:`);
for (const a of assets.values()) {
  const kb = Math.round(a.buf.length / 1024);
  console.log(`  ${a.existing ? "REUSAR" : "NUEVO "}  ${a.id}  ${a.mime}  ${kb} KB  ×${a.uses}${a.existing ? `  → ${a.existing}` : ""}`);
}
console.log(`\nPaths SVG (${svgPaths.length}):`);
for (const p of svgPaths) console.log(`  ${p.existing ? "REUSAR" : "NUEVO "}  d="${p.start}…"${p.existing ? `  → ${p.existing}` : ""}`);
console.log(`\nTokens en :root (${rootVars.length}) — compáralos con tailwind.config.ts:`);
for (const [, name, value] of rootVars) console.log(`  ${name}: ${value.trim()}`);
