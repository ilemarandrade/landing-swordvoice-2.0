# Perfil y foto — Diseño

**Fecha:** 2026-10-19 · **Estado:** aprobado en conversación, pendiente de revisión escrita

Sub-proyecto 4 de 5 de la integración "Cuentas, roles por path y perfil". Depende del sub-proyecto 1 (`apiClient` con Bearer y refresh, `useMeQuery`, guard privado) y del 2 (`isApiErrorCode`).

## Objetivo

Que cada persona vea y edite su perfil (`GET`/`PATCH /profiles/me`) en `/dashboard/profile`, y suba o quite su foto (subida directa a Cloudflare R2 con URL prefirmada), con la foto visible también en el avatar del header.

## Decisiones del usuario

- El perfil es una página: `/dashboard/profile`, enlazada desde el menú de cuenta y desde la barra lateral.
- Título profesional y descripción corta solo para cuentas con `MENTOR` en al menos un path.
- Una foto grande se reduce en el navegador (lado mayor ≤ 512 px, WebP) antes de subirla.
- Rutas nuevas en inglés; sistema de diseño existente.

## Fuera de alcance

- Cambiar el correo (no hay endpoint).
- Recortar la foto (crop) o elegir el encuadre.
- "No aparecer en la landing" y orden de mentores (feature 1-B, sin endpoint).
- Certificaciones, logros y stack del perfil (no están en `ProfileResponseDto`).

---

## 1. Contrato de la API (leído en `swordvoice-api/src/modules/profiles`)

- `GET /profiles/me` y `PATCH /profiles/me` → `data: Profile = { name: string; photoUrl, bio, githubUrl, portfolioUrl, linkedinUrl, freeCodeCampUsername, professionalTitle, shortDescription: string | null }`.
- `PATCH` parcial: campo ausente no cambia; `null` borra (todos salvo `name`); `name` no admite `null`.
- Reglas: `name` 1–80 (trim); `bio` 1–500 (trim); `githubUrl` ≤300 `^https://github\.com/[A-Za-z0-9-]+/?$`; `linkedinUrl` ≤300 `^https://(www\.)?linkedin\.com/in/[A-Za-z0-9_%-]+/?$`; `portfolioUrl` ≤300, URL `https`; `freeCodeCampUsername` `^[a-zA-Z0-9_-]{3,30}$` (se guarda en minúsculas); `professionalTitle` 1–80 (trim); `shortDescription` 1–280 (trim). 409 `FREECODECAMP_USERNAME_TAKEN`.
- `POST /profiles/me/photo/upload-url` `{ contentType: "image/jpeg" | "image/png" | "image/webp", size: 1–2097152 }` → `data: { uploadUrl, key, expiresIn: 300 }`.
- `PUT` a `uploadUrl` con el mismo `Content-Type` y exactamente `size` bytes.
- `PUT /profiles/me/photo` `{ key: ^profiles/<uuid>/<uuid>.(jpg|png|webp)$ }` → `data: Profile`. Errores: 400 `INVALID_PHOTO_KEY`, 400 `PHOTO_NOT_UPLOADED`, 503 `STORAGE_UNAVAILABLE`.
- `DELETE /profiles/me/photo` → `data: Profile` (si hay avatar del proveedor OAuth, vuelve a `photoUrl`).

## 2. Pantalla y navegación

- Ruta `src/app/(app)/dashboard/profile/page.tsx` (marco y guard privado de `(app)`); metadata `title: "Mi perfil"`. `routes.DASHBOARD_PROFILE = "/dashboard/profile"`.
- `dashboardNav`: nueva entrada `{ id: "perfil", label: "Mi perfil", href: routes.DASHBOARD_PROFILE }` antes de "Ajustes".
- Menú de cuenta: link "Mi perfil" (`next/link`) encima de "Cerrar sesión".
- Avatar del header: `photoUrl` del perfil con `next/image` (redondo); sin foto, las iniciales como hoy.
- Pantalla (feature `src/features/profile`): título "Mi perfil" y dos tarjetas con el estilo de card del dashboard (`rounded-[18px] border border-white/15 bg-[#000E2799]`):
  1. **Foto**: avatar grande; "Cambiar foto"; "Quitar foto" solo si la foto es una **subida** (ver §4); overlay "Subiendo…" durante la subida.
  2. **Datos**: Nombre*, Correo (solo lectura, de `me.email`), Bio (textarea), GitHub, LinkedIn, Portafolio, Usuario de freeCodeCamp; si `me.pathRoles` tiene algún `MENTOR`, sección "Perfil de mentor" con Título profesional y Descripción corta (textarea, ayuda "Se muestra en la landing"). Botón "Guardar cambios" deshabilitado sin cambios o mientras guarda.
- Todo campo con `InputController` (`multiline` para textareas).

## 3. Datos y guardado

- `src/common/api/profile.schema.ts`: `profileSchema`, `photoUploadUrlSchema`, tipos. `src/common/hooks/useProfileQuery.ts`: `GET /profiles/me`, key `["profiles", "me"]`, `enabled` con sesión. En `common` porque lo usan `profile` y `dashboard` (§2 de conventions).
- `features/profile/schemas/profileForm.schema.ts`: los campos como strings (vacío permitido = borrar), con trim donde la API recorta y mensajes:
  - Nombre: "Ingresa tu nombre" / "El nombre no puede superar 80 caracteres".
  - Bio: "La bio no puede superar 500 caracteres".
  - GitHub: "Usa el formato https://github.com/tu-usuario".
  - LinkedIn: "Usa el formato https://www.linkedin.com/in/tu-perfil".
  - Portafolio: "Usa una URL que empiece por https://".
  - freeCodeCamp: "Entre 3 y 30 caracteres: letras, números, - o _".
  - Título: "El título no puede superar 80 caracteres". Descripción: "La descripción no puede superar 280 caracteres".
  - URLs: "La URL no puede superar 300 caracteres".
- `features/profile/utils/toProfilePatch.ts`: `toProfilePatch(values, dirtyFields, { isMentor })` → solo los campos modificados; `""` → `null`; `name` siempre string; sin campos de mentor si `!isMentor`.
- `useUpdateProfileMutation`: `PATCH /profiles/me` + `profileSchema.parse`; `onSuccess`: `setQueryData(["profiles","me"])`, si el patch tenía `name` → `invalidateQueries(["auth","me"])`, toast "Perfil actualizado"; `onError`: `notifyError` salvo `FREECODECAMP_USERNAME_TAKEN`.
- `useProfileForm`: valores iniciales desde el perfil (`null` → `""`), `reset` con la respuesta al guardar; 409 → `setError("freeCodeCampUsername", "Ese usuario de freeCodeCamp ya está vinculado a otra cuenta")`.

## 4. Foto

- `features/profile/utils/resizeImage.ts`: `resizeImage(file): Promise<Blob>` — `createImageBitmap(file)`; canvas con el lado mayor ≤ 512 px conservando proporción; `toBlob("image/webp", 0.85)`; si el tipo devuelto no es jpeg/png/webp, reintenta `toBlob("image/jpeg", 0.85)`. Redibujar descarta EXIF (incluido GPS). Falla de decodificación → `InvalidImageError`.
- `src/common/api/uploadToSignedUrl.ts`: `uploadToSignedUrl(url, blob)` — `fetch(url, { method: "PUT", headers: { "Content-Type": blob.type }, body: blob })`; respuesta no OK → error. **No** usa `apiClient`: sin `Authorization` ni `baseURL` (romperían la firma). El navegador fija `Content-Length`.
- `useChangePhotoMutation`: resize → `POST upload-url` (`{ contentType: blob.type, size: blob.size }`) → `uploadToSignedUrl` → `PUT /profiles/me/photo` `{ key }` → `setQueryData` + toast "Foto actualizada".
- `useRemovePhotoMutation`: `DELETE /profiles/me/photo` → `setQueryData` + toast "Foto eliminada".
- `features/profile/utils/isUploadedPhoto.ts`: `true` si la ruta de `photoUrl` termina en `/profiles/<uuid>/<uuid>.(jpg|png|webp)` (formato de las claves de R2). La respuesta no distingue foto subida de avatar OAuth; sin esto, "Quitar foto" aparecería para un avatar de Google que no se puede quitar.
- Errores (todos con `notifyError`): archivo no decodificable o de otro tipo → "Elige una imagen JPG, PNG o WebP" (sin llamar a la API); fallo del `PUT` a R2, `PHOTO_NOT_UPLOADED` o `INVALID_PHOTO_KEY` → "No pudimos subir la foto. Inténtalo de nuevo."; `STORAGE_UNAVAILABLE` y el resto → mensaje de la API. Tras un error se limpia el `<input type="file">` para poder elegir el mismo archivo.
- La foto se pinta con `next/image` (`images.unoptimized` ya está activo: no hace falta `remotePatterns`).

## 5. Tests (Vitest)

- `profileForm.schema`: cada regla con su mensaje exacto; vacío válido en los opcionales; nombre vacío inválido.
- `toProfilePatch`: solo modificados; vaciado → `null`; `name` nunca `null`; sin campos de mentor si no es mentor.
- `isUploadedPhoto`: URL de R2 → `true`; avatar de Google/GitHub → `false`; `null` → `false`.
- `useProfileQuery` y las mutations: éxito, `ApiError`, respuesta inválida; cambio de nombre invalida `["auth","me"]`; 409 no notifica.
- `resizeImage` (con `createImageBitmap` y canvas mockeados): lado mayor 512, proporción, fallback a JPEG, error de decodificación.
- `uploadToSignedUrl`: `PUT` sin `Authorization` y con el `Content-Type` exacto; respuesta no OK → error.
- `useChangePhotoMutation`: orden de los 3 pasos; si falla el `PUT` a R2 no se confirma; mensaje de error correcto.
- Componentes: campos de mentor solo con `MENTOR`; 409 bajo el campo; "Quitar foto" solo con foto subida; botones deshabilitados durante la subida; avatar del header con foto o iniciales.

## 6. Criterio de cierre

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde; en local contra la API con R2 configurado (bucket público y CORS que permita `PUT` con `Content-Type` desde `http://localhost:3000`): editar y vaciar campos persiste tras recargar; cambiar el nombre actualiza el saludo; subir una foto de > 2 MB funciona y aparece en el header; quitarla vuelve a las iniciales (o al avatar OAuth).
