# Perfil y foto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Flujo del repo (CLAUDE.md):** en cada tarea el subagente `developer` hace los pasos de implementación y el `tester` los de tests; la sesión principal revisa contra `docs/architecture/conventions.md` y commitea con lint, typecheck, test y build en verde. Máximo 2 iteraciones developer↔tester por tarea.
>
> **Requisito previo:** los planes de los sub-proyectos 1 y 2 están implementados (`apiClient` con Bearer y refresh, `useSession`, `useMeQuery`, `useAccountMenu` con `useCurrentUser`, `isApiErrorCode` en `src/features/auth/utils`).

**Goal:** Ver y editar el perfil en `/dashboard/profile` y subir o cambiar la foto directo a R2 (reducida en el navegador), con la foto también en el avatar del header.

**Architecture:** El perfil (`GET /profiles/me`) es una query en `src/common/hooks` porque lo usan las features `profile` y `dashboard`. El formulario envía solo los campos modificados (`dirtyFields`) y convierte los vacíos en `null`. La foto pasa por `resizeImage` (canvas, ≤512 px, WebP) → URL prefirmada → `PUT` directo a R2 con `fetch` sin cabeceras de la API → confirmación. Piezas compartidas que ganan un segundo uso (`isApiErrorCode`, `getInitials`, el avatar) suben a `src/common`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, axios (`apiClient`), `fetch` (solo en `src/common/api`), TanStack Query 5, zod 4, react-hook-form, Canvas/`createImageBitmap`, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-19-perfil-y-foto-design.md`

## Global Constraints

- Ruta nueva: `/dashboard/profile` (`routes.DASHBOARD_PROFILE`), dentro de `(app)`.
- Query key del perfil: `["profiles", "me"]`. Cambiar `name` invalida `["auth", "me"]`.
- `PATCH` solo con campos modificados; `""` → `null`; `name` nunca `null`; sin `professionalTitle`/`shortDescription` si la cuenta no es `MENTOR` en ningún path.
- Reglas del formulario idénticas a la API (spec §1) y mensajes exactos del spec §3.
- Foto: jpeg/png/webp, ≤ 2 097 152 bytes; reducida a lado mayor ≤ 512 px; `PUT` a R2 sin `Authorization` y con el `Content-Type` del paso 1. Solo "Subir foto"/"Cambiar foto": **no** hay quitar foto.
- Errores con `notifyError` (nunca `toast.error` suelto); `FREECODECAMP_USERNAME_TAKEN` va bajo el campo.
- Imágenes con `next/image`. Sistema de diseño existente. Textos en español; imports con `@/`; sin `any`, `@ts-ignore`, `eslint-disable`.

## Review Focus

1. **Foto de móvil de 6 MB en un iPhone (Safari no codifica WebP):** debe subirse igual, como PNG o JPEG por debajo de 2 MB — test en Task 3 (`resizeImage` con `toBlob` que devuelve `image/png`).
2. **Elegir la misma foto otra vez tras un error:** el `<input type="file">` se limpia y vuelve a disparar `change` — test en Task 3.
3. **Guardar sin tocar nada / guardar solo la bio:** el botón está deshabilitado sin cambios y el `PATCH` lleva solo `bio` — test en Task 2.
4. **Un aprendiz no envía campos de mentor** aunque existan en los valores del formulario — test en Task 2 (`toProfilePatch`).
5. **CORS de R2 sin configurar:** el `PUT` falla en el navegador y se muestra "No pudimos subir la foto. Inténtalo de nuevo." sin confirmar la clave — test en Task 3.

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/common/api/isApiErrorCode.ts` | mover desde `features/auth/utils` | Comprobar `errorCode` (2.º uso: `profile`) |
| `src/common/utils/getInitials.ts` | mover desde `features/dashboard/utils` | Iniciales (2.º uso: `profile`) |
| `src/common/components/avatar/index.tsx` | crear | Foto redonda o iniciales |
| `src/common/api/profile.schema.ts` | crear | `profileSchema`, `Profile` |
| `src/common/hooks/useProfileQuery.ts` | crear | `GET /profiles/me` |
| `src/common/api/uploadToSignedUrl.ts` | crear | `PUT` directo a R2 |
| `src/common/constants/routes.ts` | modificar | `DASHBOARD_PROFILE` |
| `src/features/profile/schemas/profileForm.schema.ts` | crear | Validación del formulario |
| `src/features/profile/schemas/photoUploadUrl.schema.ts` | crear | Respuesta de `upload-url` |
| `src/features/profile/constants/profileMessages.ts` | crear | Textos |
| `src/features/profile/utils/toProfilePatch.ts` | crear | Valores → cuerpo del `PATCH` |
| `src/features/profile/utils/resizeImage.ts` | crear | Reducir la foto |
| `src/features/profile/hooks/useUpdateProfileMutation.ts` | crear | `PATCH /profiles/me` |
| `src/features/profile/hooks/useProfileForm.ts` | crear | Formulario |
| `src/features/profile/hooks/useChangePhotoMutation.ts` | crear | Los 3 pasos de la foto |
| `src/features/profile/hooks/usePhotoPicker.ts` | crear | Input de archivo + mutation |
| `src/features/profile/components/profile-section/**` | crear | Pantalla (foto + datos) |
| `src/features/profile/index.ts` | crear | Exporta `ProfileSection` |
| `src/app/(app)/dashboard/profile/page.tsx` | crear | Ruta |
| `src/features/dashboard/constants/dashboardNav.ts` | modificar | Entrada "Mi perfil" |
| `src/features/dashboard/hooks/useAccountMenu.ts`, `components/dashboard-header/account-menu/index.tsx` | modificar | Foto en el avatar + link "Mi perfil" |

---

### Task 1: Piezas compartidas, perfil y subida firmada

**Files:**
- Move: `src/features/auth/utils/isApiErrorCode.ts` (+ su test) → `src/common/api/isApiErrorCode.ts`; `src/features/dashboard/utils/getInitials.ts` → `src/common/utils/getInitials.ts`
- Create: `src/common/components/avatar/index.tsx`, `src/common/api/profile.schema.ts`, `src/common/hooks/useProfileQuery.ts`, `src/common/api/uploadToSignedUrl.ts`
- Modify: `src/common/constants/routes.ts`, todos los imports de `isApiErrorCode` en `src/features/auth`, `src/features/dashboard/hooks/useAccountMenu.ts`
- Test: `src/common/utils/getInitials.test.ts`, `src/common/components/avatar/index.test.tsx`, `src/common/hooks/useProfileQuery.test.ts`, `src/common/api/uploadToSignedUrl.test.ts`

**Interfaces:**
- Produces:
  - `isApiErrorCode(error: unknown, code: string): boolean` en `@/common/api/isApiErrorCode`
  - `getInitials(name: string): string` en `@/common/utils/getInitials`
  - `Avatar({ name: string; photoUrl: string | null; size: number; className?: string })`
  - `profileSchema`, `type Profile = { name: string; photoUrl, bio, githubUrl, portfolioUrl, linkedinUrl, freeCodeCampUsername, professionalTitle, shortDescription: string | null }`
  - `useProfileQuery(): UseQueryResult<Profile, Error>` con key `["profiles", "me"]`
  - `uploadToSignedUrl(url: string, blob: Blob): Promise<void>`; falla con `ApiError(status | 0, …, "SIGNED_UPLOAD_FAILED")`
  - `routes.DASHBOARD_PROFILE = "/dashboard/profile"`

- [ ] **Step 1 (developer): Mover `isApiErrorCode` y `getInitials`**

```bash
git mv src/features/auth/utils/isApiErrorCode.ts src/common/api/isApiErrorCode.ts
git mv src/features/auth/utils/isApiErrorCode.test.ts src/common/api/isApiErrorCode.test.ts
mkdir -p src/common/utils
git mv src/features/dashboard/utils/getInitials.ts src/common/utils/getInitials.ts
```

Sustituir en todo `src/` los imports `@/features/auth/utils/isApiErrorCode` por `@/common/api/isApiErrorCode` y `@/features/dashboard/utils/getInitials` por `@/common/utils/getInitials` (buscar con grep; incluye el test movido). El contenido de ambos archivos no cambia.

- [ ] **Step 2 (developer): `routes.ts`** — añadir después de `DASHBOARD_PATHS`: `DASHBOARD_PROFILE: "/dashboard/profile",`.

- [ ] **Step 3 (developer): Crear `src/common/components/avatar/index.tsx`**

```tsx
import Image from "next/image";
import { getInitials } from "@/common/utils/getInitials";

type AvatarProps = {
  name: string;
  photoUrl: string | null;
  size: number;
  className?: string;
};

export function Avatar({ name, photoUrl, size, className }: AvatarProps) {
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue font-bold ${className ?? ""}`;

  if (photoUrl) {
    return (
      <span className={base} style={{ width: size, height: size }}>
        <Image
          src={photoUrl}
          alt={`Foto de ${name}`}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={base}
      style={{ width: size, height: size, fontSize: Math.round(size / 3) }}
    >
      {getInitials(name)}
    </span>
  );
}
```

- [ ] **Step 4 (developer): Crear `src/common/api/profile.schema.ts` y `src/common/hooks/useProfileQuery.ts`**

```ts
// src/common/api/profile.schema.ts
import { z } from "zod";

const optional = z.string().nullable();

export const profileSchema = z.object({
  name: z.string(),
  photoUrl: optional,
  bio: optional,
  githubUrl: optional,
  portfolioUrl: optional,
  linkedinUrl: optional,
  freeCodeCampUsername: optional,
  professionalTitle: optional,
  shortDescription: optional,
});

export type Profile = z.infer<typeof profileSchema>;
```

```ts
// src/common/hooks/useProfileQuery.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/api/apiClient";
import { profileSchema } from "@/common/api/profile.schema";
import { useSession } from "@/common/hooks/useSession";

async function getProfile() {
  const { data } = await apiClient.get("/profiles/me");
  return profileSchema.parse(data);
}

export function useProfileQuery() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["profiles", "me"],
    queryFn: getProfile,
    enabled: status === "authenticated",
  });
}
```

- [ ] **Step 5 (developer): Crear `src/common/api/uploadToSignedUrl.ts`**

```ts
import { ApiError } from "@/common/api/ApiError";
import { GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "@/common/constants/messages";

export const SIGNED_UPLOAD_FAILED = "SIGNED_UPLOAD_FAILED";

// PUT directo al almacenamiento con una URL prefirmada. No usa apiClient: su baseURL y
// el header Authorization invalidarían la firma. El navegador fija Content-Length.
export async function uploadToSignedUrl(url: string, blob: Blob): Promise<void> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": blob.type },
      body: blob,
    });
  } catch {
    // CORS sin configurar o sin conexión.
    throw new ApiError(0, NETWORK_ERROR_MESSAGE, SIGNED_UPLOAD_FAILED);
  }
  if (!response.ok) {
    throw new ApiError(response.status, GENERIC_ERROR_MESSAGE, SIGNED_UPLOAD_FAILED);
  }
}
```

- [ ] **Step 6 (developer): `useAccountMenu`** — cambiar el import de `getInitials` (Step 1 ya lo hizo); sin otros cambios en esta tarea.

- [ ] **Step 7 (developer):** `pnpm lint && pnpm typecheck && pnpm test` → pasan (los tests existentes de `isApiErrorCode` siguen pasando desde su nueva ubicación).

- [ ] **Step 8 (tester): Escribir `src/common/utils/getInitials.test.ts` y `src/common/components/avatar/index.test.tsx`**

```ts
// src/common/utils/getInitials.test.ts
import { describe, expect, it } from "vitest";
import { getInitials } from "@/common/utils/getInitials";

describe("getInitials", () => {
  it.each([
    ["Ana Pérez", "AP"],
    ["ana maría pérez", "AM"],
    ["  Ana  ", "A"],
    ["", "SV"],
  ])("%j → %s", (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });
});
```

```tsx
// src/common/components/avatar/index.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/common/components/avatar";

describe("Avatar", () => {
  it("shows the photo when there is one", () => {
    render(<Avatar name="Ana Pérez" photoUrl="https://media.swordvoice.com/p.png" size={44} />);
    expect(screen.getByRole("img", { name: "Foto de Ana Pérez" })).toHaveAttribute(
      "src",
      "https://media.swordvoice.com/p.png",
    );
  });

  it("shows the initials without a photo", () => {
    render(<Avatar name="Ana Pérez" photoUrl={null} size={44} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("AP")).toBeInTheDocument();
  });
});
```

- [ ] **Step 9 (tester): Escribir `src/common/hooks/useProfileQuery.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { saveTokens } from "@/common/api/tokenStorage";
import { useProfileQuery } from "@/common/hooks/useProfileQuery";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { get: vi.fn() } }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

const profile = {
  name: "Ana Pérez",
  photoUrl: null,
  bio: null,
  githubUrl: "https://github.com/ana",
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: "ana-dev",
  professionalTitle: null,
  shortDescription: null,
};

describe("useProfileQuery", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(apiClient.get).mockReset();
  });

  it("does not request the profile without a session", () => {
    renderHook(() => useProfileQuery(), { wrapper });
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("returns the parsed profile", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.get>>);
    const { result } = renderHook(() => useProfileQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/profiles/me");
    expect(result.current.data).toEqual(profile);
  });

  it("exposes the ApiError and rejects an invalid response", async () => {
    saveTokens({ accessToken: "a", refreshToken: "r", expiresIn: 900 });
    vi.mocked(apiClient.get).mockRejectedValueOnce(new ApiError(500, "x"));
    const failing = renderHook(() => useProfileQuery(), { wrapper });
    await waitFor(() => expect(failing.result.current.error).toBeInstanceOf(ApiError));

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { name: 1 } } as Awaited<ReturnType<typeof apiClient.get>>);
    const invalid = renderHook(() => useProfileQuery(), { wrapper });
    await waitFor(() => expect(invalid.result.current.isError).toBe(true));
  });
});
```

- [ ] **Step 10 (tester): Escribir `src/common/api/uploadToSignedUrl.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadToSignedUrl } from "@/common/api/uploadToSignedUrl";

const blob = new Blob(["x"], { type: "image/webp" });
const url = "https://r2.example.com/profiles/u/p.webp?X-Amz-Signature=abc";

describe("uploadToSignedUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("PUTs the blob with its Content-Type and no Authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await uploadToSignedUrl(url, blob);
    expect(fetchMock).toHaveBeenCalledWith(url, {
      method: "PUT",
      headers: { "Content-Type": "image/webp" },
      body: blob,
    });
  });

  it("fails with the storage status when the response is not OK", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    await expect(uploadToSignedUrl(url, blob)).rejects.toMatchObject({
      status: 403,
      errorCode: "SIGNED_UPLOAD_FAILED",
    });
  });

  it("fails with status 0 when the request is blocked (CORS or offline)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(uploadToSignedUrl(url, blob)).rejects.toMatchObject({
      status: 0,
      errorCode: "SIGNED_UPLOAD_FAILED",
    });
  });
});
```

- [ ] **Step 11:** `pnpm test src/common` → PASS.

- [ ] **Step 12: Commit**

```bash
git add src/common src/features
git commit -m "feat: :sparkles: add profile query, avatar and signed upload helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Formulario de perfil

**Files:**
- Create: `src/features/profile/schemas/profileForm.schema.ts`, `src/features/profile/constants/profileMessages.ts`, `src/features/profile/utils/toProfilePatch.ts`, `src/features/profile/hooks/useUpdateProfileMutation.ts`, `src/features/profile/hooks/useProfileForm.ts`, `src/features/profile/components/profile-section/profile-form/index.tsx`
- Test: `src/features/profile/schemas/profileForm.schema.test.ts`, `src/features/profile/utils/toProfilePatch.test.ts`, `src/features/profile/hooks/useUpdateProfileMutation.test.ts`, `src/features/profile/components/profile-section/profile-form/index.test.tsx`

**Interfaces:**
- Consumes: `profileSchema`, `Profile`, `isApiErrorCode` (Task 1), `apiClient`, `notifyError`.
- Produces:
  - `profileFormSchema`, `type ProfileFormValues` (todos `string`)
  - `profileMessages` (ver Step 2)
  - `type ProfilePatch`, `toProfilePatch(values: ProfileFormValues, dirtyFields: Partial<Record<keyof ProfileFormValues, boolean>>, options: { isMentor: boolean }): ProfilePatch`
  - `toProfileFormValues(profile: Profile): ProfileFormValues`
  - `useUpdateProfileMutation(): UseMutationResult<Profile, Error, ProfilePatch>`
  - `useProfileForm(profile: Profile, options: { isMentor: boolean }): { control; onSubmit; isSubmitting: boolean; canSubmit: boolean }`
  - `ProfileForm({ profile: Profile; email: string; isMentor: boolean })`

- [ ] **Step 1 (developer): Crear `src/features/profile/schemas/profileForm.schema.ts`**

```ts
import { z } from "zod";

const GITHUB_URL = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/;
const LINKEDIN_URL = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?$/;
const FREECODECAMP_USERNAME = /^[a-zA-Z0-9_-]{3,30}$/;

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

// Vacío es válido en los opcionales: significa borrar el campo.
const optionalText = (max: number, message: string) => z.string().trim().max(max, message);

const optionalUrl = (isValid: (value: string) => boolean, message: string) =>
  z
    .string()
    .trim()
    .max(300, "La URL no puede superar 300 caracteres")
    .refine((value) => value === "" || isValid(value), message);

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresa tu nombre")
    .max(80, "El nombre no puede superar 80 caracteres"),
  bio: optionalText(500, "La bio no puede superar 500 caracteres"),
  githubUrl: optionalUrl(
    (value) => GITHUB_URL.test(value),
    "Usa el formato https://github.com/tu-usuario",
  ),
  linkedinUrl: optionalUrl(
    (value) => LINKEDIN_URL.test(value),
    "Usa el formato https://www.linkedin.com/in/tu-perfil",
  ),
  portfolioUrl: optionalUrl(isHttpsUrl, "Usa una URL que empiece por https://"),
  freeCodeCampUsername: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || FREECODECAMP_USERNAME.test(value),
      "Entre 3 y 30 caracteres: letras, números, - o _",
    ),
  professionalTitle: optionalText(80, "El título no puede superar 80 caracteres"),
  shortDescription: optionalText(280, "La descripción no puede superar 280 caracteres"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
```

- [ ] **Step 2 (developer): Crear `src/features/profile/constants/profileMessages.ts`**

```ts
export const profileMessages = {
  PROFILE_UPDATED: "Perfil actualizado",
  PHOTO_UPDATED: "Foto actualizada",
  FREECODECAMP_TAKEN: "Ese usuario de freeCodeCamp ya está vinculado a otra cuenta",
  INVALID_IMAGE: "Elige una imagen JPG, PNG o WebP",
  PHOTO_UPLOAD_FAILED: "No pudimos subir la foto. Inténtalo de nuevo.",
} as const;
```

- [ ] **Step 3 (developer): Crear `src/features/profile/utils/toProfilePatch.ts`**

```ts
import type { Profile } from "@/common/api/profile.schema";
import type { ProfileFormValues } from "@/features/profile/schemas/profileForm.schema";

const NULLABLE_FIELDS = [
  "bio",
  "githubUrl",
  "portfolioUrl",
  "linkedinUrl",
  "freeCodeCampUsername",
  "professionalTitle",
  "shortDescription",
] as const;

type NullableField = (typeof NULLABLE_FIELDS)[number];

const MENTOR_FIELDS: ReadonlySet<NullableField> = new Set(["professionalTitle", "shortDescription"]);

export type ProfilePatch = { name?: string } & Partial<Record<NullableField, string | null>>;

export function toProfileFormValues(profile: Profile): ProfileFormValues {
  return {
    name: profile.name,
    bio: profile.bio ?? "",
    githubUrl: profile.githubUrl ?? "",
    portfolioUrl: profile.portfolioUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    freeCodeCampUsername: profile.freeCodeCampUsername ?? "",
    professionalTitle: profile.professionalTitle ?? "",
    shortDescription: profile.shortDescription ?? "",
  };
}

// Solo los campos modificados; un campo vaciado se envía como null para borrarlo.
export function toProfilePatch(
  values: ProfileFormValues,
  dirtyFields: Partial<Record<keyof ProfileFormValues, boolean>>,
  { isMentor }: { isMentor: boolean },
): ProfilePatch {
  const patch: ProfilePatch = {};
  if (dirtyFields.name) patch.name = values.name;
  for (const field of NULLABLE_FIELDS) {
    if (!dirtyFields[field]) continue;
    if (!isMentor && MENTOR_FIELDS.has(field)) continue;
    patch[field] = values[field] === "" ? null : values[field];
  }
  return patch;
}
```

- [ ] **Step 4 (developer): Crear `src/features/profile/hooks/useUpdateProfileMutation.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/common/api/apiClient";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { profileSchema } from "@/common/api/profile.schema";
import { notifyError } from "@/common/errors/notifyError";
import { profileMessages } from "@/features/profile/constants/profileMessages";
import type { ProfilePatch } from "@/features/profile/utils/toProfilePatch";

async function updateProfile(patch: ProfilePatch) {
  const { data } = await apiClient.patch("/profiles/me", patch);
  return profileSchema.parse(data);
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile, patch) => {
      queryClient.setQueryData(["profiles", "me"], profile);
      // El nombre también vive en /auth/me (saludo, iniciales).
      if (patch.name !== undefined) {
        void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
      toast.success(profileMessages.PROFILE_UPDATED);
    },
    // El usuario de freeCodeCamp ocupado se muestra bajo su campo.
    onError: (error) => {
      if (!isApiErrorCode(error, "FREECODECAMP_USERNAME_TAKEN")) notifyError(error);
    },
  });
}
```

- [ ] **Step 5 (developer): Crear `src/features/profile/hooks/useProfileForm.ts`**

```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import type { Profile } from "@/common/api/profile.schema";
import { profileMessages } from "@/features/profile/constants/profileMessages";
import { useUpdateProfileMutation } from "@/features/profile/hooks/useUpdateProfileMutation";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/profile/schemas/profileForm.schema";
import { toProfileFormValues, toProfilePatch } from "@/features/profile/utils/toProfilePatch";

export function useProfileForm(profile: Profile, { isMentor }: { isMentor: boolean }) {
  const { mutate, isPending } = useUpdateProfileMutation();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { dirtyFields, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: toProfileFormValues(profile),
    resolver: zodResolver(profileFormSchema),
  });

  const onSubmit = handleSubmit((values) =>
    mutate(toProfilePatch(values, dirtyFields, { isMentor }), {
      // Lo guardado pasa a ser el nuevo punto de partida (sin cambios pendientes).
      onSuccess: (updated) => reset(toProfileFormValues(updated)),
      onError: (error) => {
        if (isApiErrorCode(error, "FREECODECAMP_USERNAME_TAKEN")) {
          setError("freeCodeCampUsername", { message: profileMessages.FREECODECAMP_TAKEN });
        }
      },
    }),
  );

  return { control, onSubmit, isSubmitting: isPending, canSubmit: isDirty && !isPending };
}
```

- [ ] **Step 6 (developer): Crear `profile-section/profile-form/index.tsx`**

```tsx
"use client";
import { Button } from "@/common/components/button";
import { InputController } from "@/common/components/input-controller";
import type { Profile } from "@/common/api/profile.schema";
import { useProfileForm } from "@/features/profile/hooks/useProfileForm";

type ProfileFormProps = { profile: Profile; email: string; isMentor: boolean };

export function ProfileForm({ profile, email, isMentor }: ProfileFormProps) {
  const { control, onSubmit, canSubmit } = useProfileForm(profile, { isMentor });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col rounded-[18px] border border-white/15 bg-[#000E2799] p-6 md:p-9"
    >
      <h2 className="mb-4 text-2xl font-bold">Datos</h2>
      <InputController control={control} name="name" label="Nombre" autoComplete="name" />
      <div className="mb-4 flex flex-col gap-1">
        <span className="text-sm font-semibold">Correo electrónico</span>
        <span className="text-[15px] text-[#C9C9D6]">{email}</span>
      </div>
      <InputController control={control} name="bio" label="Bio" multiline />
      <InputController
        control={control}
        name="githubUrl"
        label="GitHub"
        type="url"
        placeholder="https://github.com/tu-usuario"
      />
      <InputController
        control={control}
        name="linkedinUrl"
        label="LinkedIn"
        type="url"
        placeholder="https://www.linkedin.com/in/tu-perfil"
      />
      <InputController
        control={control}
        name="portfolioUrl"
        label="Portafolio"
        type="url"
        placeholder="https://tu-portafolio.dev"
      />
      <InputController
        control={control}
        name="freeCodeCampUsername"
        label="Usuario de freeCodeCamp"
        autoComplete="off"
      />
      {isMentor && (
        <fieldset className="mt-2 flex flex-col border-t border-white/15 pt-6">
          <legend className="mb-4 text-lg font-bold text-primary">Perfil de mentor</legend>
          <InputController
            control={control}
            name="professionalTitle"
            label="Título profesional"
            placeholder="Frontend Developer"
            description="Se muestra en la landing."
          />
          <InputController
            control={control}
            name="shortDescription"
            label="Descripción corta"
            multiline
            description="Se muestra en la landing."
          />
        </fieldset>
      )}
      <Button type="submit" label="Guardar cambios" fullWidth disabled={!canSubmit} />
    </form>
  );
}
```

(Si `InputController` no pinta `description` en modo `multiline`, la ayuda de "Descripción corta" se omite: no se extiende `InputController` en esta tarea.)

- [ ] **Step 7 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 8 (tester): Escribir `profileForm.schema.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { profileFormSchema } from "@/features/profile/schemas/profileForm.schema";

const empty = {
  name: "Ana Pérez",
  bio: "",
  githubUrl: "",
  portfolioUrl: "",
  linkedinUrl: "",
  freeCodeCampUsername: "",
  professionalTitle: "",
  shortDescription: "",
};

function firstMessage(values: unknown) {
  const result = profileFormSchema.safeParse(values);
  return result.success ? null : result.error.issues[0]?.message;
}

describe("profileFormSchema", () => {
  it("accepts empty optional fields (they mean delete)", () => {
    expect(profileFormSchema.safeParse(empty).success).toBe(true);
  });

  it("accepts valid values", () => {
    expect(
      profileFormSchema.safeParse({
        ...empty,
        githubUrl: "https://github.com/ana-dev",
        linkedinUrl: "https://linkedin.com/in/ana-perez/",
        portfolioUrl: "https://ana.dev",
        freeCodeCampUsername: "Ana_Dev",
      }).success,
    ).toBe(true);
  });

  it.each([
    [{ ...empty, name: "  " }, "Ingresa tu nombre"],
    [{ ...empty, name: "x".repeat(81) }, "El nombre no puede superar 80 caracteres"],
    [{ ...empty, bio: "x".repeat(501) }, "La bio no puede superar 500 caracteres"],
    [{ ...empty, githubUrl: "https://gitlab.com/ana" }, "Usa el formato https://github.com/tu-usuario"],
    [{ ...empty, githubUrl: "https://github.com/ana/repo" }, "Usa el formato https://github.com/tu-usuario"],
    [{ ...empty, linkedinUrl: "https://www.linkedin.com/company/x" }, "Usa el formato https://www.linkedin.com/in/tu-perfil"],
    [{ ...empty, portfolioUrl: "http://ana.dev" }, "Usa una URL que empiece por https://"],
    [{ ...empty, portfolioUrl: `https://${"a".repeat(300)}.dev` }, "La URL no puede superar 300 caracteres"],
    [{ ...empty, freeCodeCampUsername: "ab" }, "Entre 3 y 30 caracteres: letras, números, - o _"],
    [{ ...empty, freeCodeCampUsername: "ana dev" }, "Entre 3 y 30 caracteres: letras, números, - o _"],
    [{ ...empty, professionalTitle: "x".repeat(81) }, "El título no puede superar 80 caracteres"],
    [{ ...empty, shortDescription: "x".repeat(281) }, "La descripción no puede superar 280 caracteres"],
  ])("rejects %j with its message", (values, message) => {
    expect(firstMessage(values)).toBe(message);
  });
});
```

- [ ] **Step 9 (tester): Escribir `toProfilePatch.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { toProfileFormValues, toProfilePatch } from "@/features/profile/utils/toProfilePatch";

const values = {
  name: "Ana Pérez",
  bio: "",
  githubUrl: "https://github.com/ana",
  portfolioUrl: "",
  linkedinUrl: "",
  freeCodeCampUsername: "ana-dev",
  professionalTitle: "Frontend Developer",
  shortDescription: "",
};

describe("toProfilePatch", () => {
  it("sends only the modified fields", () => {
    expect(toProfilePatch(values, { githubUrl: true }, { isMentor: false })).toEqual({
      githubUrl: "https://github.com/ana",
    });
  });

  it("sends an emptied field as null", () => {
    expect(toProfilePatch(values, { bio: true }, { isMentor: false })).toEqual({ bio: null });
  });

  it("sends the name as a string", () => {
    expect(toProfilePatch(values, { name: true }, { isMentor: false })).toEqual({ name: "Ana Pérez" });
  });

  it("returns an empty patch without changes", () => {
    expect(toProfilePatch(values, {}, { isMentor: true })).toEqual({});
  });

  it("skips mentor fields for a non-mentor", () => {
    expect(
      toProfilePatch(values, { professionalTitle: true, shortDescription: true }, { isMentor: false }),
    ).toEqual({});
  });

  it("sends mentor fields for a mentor", () => {
    expect(
      toProfilePatch(values, { professionalTitle: true, shortDescription: true }, { isMentor: true }),
    ).toEqual({ professionalTitle: "Frontend Developer", shortDescription: null });
  });
});

describe("toProfileFormValues", () => {
  it("turns null into empty strings and keeps the name", () => {
    expect(
      toProfileFormValues({
        name: "Ana",
        photoUrl: "https://x/p.png",
        bio: null,
        githubUrl: null,
        portfolioUrl: null,
        linkedinUrl: null,
        freeCodeCampUsername: "ana",
        professionalTitle: null,
        shortDescription: null,
      }),
    ).toEqual({
      name: "Ana",
      bio: "",
      githubUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
      freeCodeCampUsername: "ana",
      professionalTitle: "",
      shortDescription: "",
    });
  });
});
```

- [ ] **Step 10 (tester): Escribir `useUpdateProfileMutation.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { notifyError } from "@/common/errors/notifyError";
import { useUpdateProfileMutation } from "@/features/profile/hooks/useUpdateProfileMutation";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { patch: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const profile = {
  name: "Ana",
  photoUrl: null,
  bio: "Hola",
  githubUrl: null,
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: null,
  professionalTitle: null,
  shortDescription: null,
};

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, ...renderHook(() => useUpdateProfileMutation(), { wrapper }) };
}

describe("useUpdateProfileMutation", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
  });

  it("patches, caches the profile and does not refetch /auth/me without a name change", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { client, invalidate, result } = setup();
    act(() => result.current.mutate({ bio: "Hola" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.patch).toHaveBeenCalledWith("/profiles/me", { bio: "Hola" });
    expect(client.getQueryData(["profiles", "me"])).toEqual(profile);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("refetches /auth/me when the name changes", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { invalidate, result } = setup();
    act(() => result.current.mutate({ name: "Ana" }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
  });

  it("does not toast FREECODECAMP_USERNAME_TAKEN but toasts other errors", async () => {
    vi.mocked(apiClient.patch).mockRejectedValueOnce(new ApiError(409, "x", "FREECODECAMP_USERNAME_TAKEN"));
    const taken = setup();
    act(() => taken.result.current.mutate({ freeCodeCampUsername: "ana" }));
    await waitFor(() => expect(taken.result.current.isError).toBe(true));
    expect(notifyError).not.toHaveBeenCalled();

    vi.mocked(apiClient.patch).mockRejectedValueOnce(new ApiError(500, "x"));
    const failing = setup();
    act(() => failing.result.current.mutate({ bio: "x" }));
    await waitFor(() => expect(failing.result.current.isError).toBe(true));
    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it("fails when the response does not match the schema", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { name: 1 } } as Awaited<ReturnType<typeof apiClient.patch>>);
    const { result } = setup();
    act(() => result.current.mutate({ bio: "x" }));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

- [ ] **Step 11 (tester): Escribir `profile-form/index.test.tsx`**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../../test/renderWithClient";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { ProfileForm } from "@/features/profile/components/profile-section/profile-form";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { patch: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));

const profile = {
  name: "Ana Pérez",
  photoUrl: null,
  bio: null,
  githubUrl: null,
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: null,
  professionalTitle: null,
  shortDescription: null,
};

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.mocked(apiClient.patch).mockReset();
  });

  it("shows the email read-only and disables saving without changes", () => {
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled();
  });

  it("shows mentor fields only for mentors", () => {
    const { unmount } = renderWithClient(
      <ProfileForm profile={profile} email="ana@example.com" isMentor={false} />,
    );
    expect(screen.queryByLabelText("Título profesional")).not.toBeInTheDocument();
    unmount();
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor />);
    expect(screen.getByLabelText("Título profesional")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción corta")).toBeInTheDocument();
  });

  it("sends only the bio when only the bio changes", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { ...profile, bio: "Aprendiendo React" },
    } as Awaited<ReturnType<typeof apiClient.patch>>);
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    await userEvent.type(screen.getByLabelText("Bio"), "Aprendiendo React");
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith("/profiles/me", { bio: "Aprendiendo React" }),
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled());
  });

  it("shows the taken freeCodeCamp username under its field", async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new ApiError(409, "x", "FREECODECAMP_USERNAME_TAKEN"));
    renderWithClient(<ProfileForm profile={profile} email="ana@example.com" isMentor={false} />);
    await userEvent.type(screen.getByLabelText("Usuario de freeCodeCamp"), "ana-dev");
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(
      await screen.findByText("Ese usuario de freeCodeCamp ya está vinculado a otra cuenta"),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 12:** `pnpm test src/features/profile` → PASS.

- [ ] **Step 13: Commit**

```bash
git add src/features/profile
git commit -m "feat: :sparkles: edit the profile with partial updates

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Foto de perfil

**Files:**
- Create: `src/features/profile/schemas/photoUploadUrl.schema.ts`, `src/features/profile/utils/resizeImage.ts`, `src/features/profile/hooks/useChangePhotoMutation.ts`, `src/features/profile/hooks/usePhotoPicker.ts`, `src/features/profile/components/profile-section/profile-photo/index.tsx`
- Test: `src/features/profile/utils/resizeImage.test.ts`, `src/features/profile/hooks/useChangePhotoMutation.test.ts`, `src/features/profile/components/profile-section/profile-photo/index.test.tsx`

**Interfaces:**
- Consumes: `profileSchema`, `uploadToSignedUrl`, `SIGNED_UPLOAD_FAILED`, `isApiErrorCode`, `Avatar` (Task 1), `profileMessages` (Task 2).
- Produces:
  - `photoUploadUrlSchema` (`{ uploadUrl: string; key: string; expiresIn: number }`)
  - `class InvalidImageError extends Error`, `resizeImage(file: File): Promise<Blob>`
  - `useChangePhotoMutation(): UseMutationResult<Profile, Error, File>`
  - `usePhotoPicker(): { inputRef: RefObject<HTMLInputElement | null>; openPicker: () => void; onFileChange: (event: ChangeEvent<HTMLInputElement>) => void; isUploading: boolean }`
  - `ProfilePhoto({ profile: Profile })`

- [ ] **Step 1 (developer): Crear `src/features/profile/schemas/photoUploadUrl.schema.ts`**

```ts
import { z } from "zod";

export const photoUploadUrlSchema = z.object({
  uploadUrl: z.url(),
  key: z.string().min(1),
  expiresIn: z.number(),
});
```

- [ ] **Step 2 (developer): Crear `src/features/profile/utils/resizeImage.ts`**

```ts
const MAX_SIDE = 512;
const MAX_BYTES = 2 * 1024 * 1024;
const QUALITY = 0.85;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class InvalidImageError extends Error {
  constructor() {
    super("Invalid image");
    this.name = "InvalidImageError";
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

function isUploadable(blob: Blob | null): blob is Blob {
  return blob !== null && ACCEPTED_TYPES.includes(blob.type) && blob.size <= MAX_BYTES;
}

// Reduce el lado mayor a 512 px y recodifica. Redibujar en el canvas descarta el EXIF (GPS).
export async function resizeImage(file: File): Promise<Blob> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new InvalidImageError();
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new InvalidImageError();
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Safari no codifica WebP y devuelve PNG: sirve si cumple tipo y tamaño.
  const webp = await toBlob(canvas, "image/webp");
  if (isUploadable(webp)) return webp;
  const jpeg = await toBlob(canvas, "image/jpeg");
  if (isUploadable(jpeg)) return jpeg;
  throw new InvalidImageError();
}
```

- [ ] **Step 3 (developer): Crear `src/features/profile/hooks/useChangePhotoMutation.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { isApiErrorCode } from "@/common/api/isApiErrorCode";
import { profileSchema } from "@/common/api/profile.schema";
import { SIGNED_UPLOAD_FAILED, uploadToSignedUrl } from "@/common/api/uploadToSignedUrl";
import { notifyError } from "@/common/errors/notifyError";
import { profileMessages } from "@/features/profile/constants/profileMessages";
import { photoUploadUrlSchema } from "@/features/profile/schemas/photoUploadUrl.schema";
import { InvalidImageError, resizeImage } from "@/features/profile/utils/resizeImage";

async function changePhoto(file: File) {
  const blob = await resizeImage(file);
  const { data } = await apiClient.post("/profiles/me/photo/upload-url", {
    contentType: blob.type,
    size: blob.size,
  });
  const { uploadUrl, key } = photoUploadUrlSchema.parse(data);
  await uploadToSignedUrl(uploadUrl, blob);
  const { data: profile } = await apiClient.put("/profiles/me/photo", { key });
  return profileSchema.parse(profile);
}

const UPLOAD_FAILURE_CODES = [SIGNED_UPLOAD_FAILED, "PHOTO_NOT_UPLOADED", "INVALID_PHOTO_KEY"];

// Traduce los fallos propios de la foto a un mensaje claro; el resto conserva el de la API.
function toPhotoError(error: unknown): unknown {
  if (error instanceof InvalidImageError) {
    return new ApiError(400, profileMessages.INVALID_IMAGE);
  }
  if (UPLOAD_FAILURE_CODES.some((code) => isApiErrorCode(error, code))) {
    return new ApiError(400, profileMessages.PHOTO_UPLOAD_FAILED);
  }
  return error;
}

export function useChangePhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changePhoto,
    onSuccess: (profile) => {
      queryClient.setQueryData(["profiles", "me"], profile);
      toast.success(profileMessages.PHOTO_UPDATED);
    },
    onError: (error) => notifyError(toPhotoError(error)),
  });
}
```

- [ ] **Step 4 (developer): Crear `src/features/profile/hooks/usePhotoPicker.ts`**

```ts
import { useRef, type ChangeEvent } from "react";
import { useChangePhotoMutation } from "@/features/profile/hooks/useChangePhotoMutation";

export function usePhotoPicker() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { mutate, isPending } = useChangePhotoMutation();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    // Limpia el input para que elegir el mismo archivo otra vez vuelva a disparar change.
    mutate(file, { onSettled: () => { input.value = ""; } });
  };

  return {
    inputRef,
    openPicker: () => inputRef.current?.click(),
    onFileChange,
    isUploading: isPending,
  };
}
```

- [ ] **Step 5 (developer): Crear `profile-section/profile-photo/index.tsx`**

```tsx
"use client";
import type { Profile } from "@/common/api/profile.schema";
import { Avatar } from "@/common/components/avatar";
import { Button } from "@/common/components/button";
import { usePhotoPicker } from "@/features/profile/hooks/usePhotoPicker";

type ProfilePhotoProps = { profile: Profile };

export function ProfilePhoto({ profile }: ProfilePhotoProps) {
  const { inputRef, openPicker, onFileChange, isUploading } = usePhotoPicker();

  return (
    <section className="flex flex-col items-center gap-5 rounded-[18px] border border-white/15 bg-[#000E2799] p-6 text-center md:p-9">
      <h2 className="text-2xl font-bold">Foto</h2>
      <div className="relative">
        <Avatar name={profile.name} photoUrl={profile.photoUrl} size={128} />
        {isUploading && (
          <span
            role="status"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 text-sm font-semibold"
          >
            Subiendo…
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="hidden"
        aria-label="Elegir foto de perfil"
      />
      <Button
        type="button"
        label={profile.photoUrl ? "Cambiar foto" : "Subir foto"}
        onClick={openPicker}
        disabled={isUploading}
      />
      <p className="text-sm text-[#C9C9D6]">JPG, PNG o WebP. La ajustamos a 512 px.</p>
    </section>
  );
}
```

- [ ] **Step 6 (developer):** `pnpm lint && pnpm typecheck` → pasan.

- [ ] **Step 7 (tester): Escribir `src/features/profile/utils/resizeImage.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InvalidImageError, resizeImage } from "@/features/profile/utils/resizeImage";

type Canvas = { width: number; height: number; getContext: () => { drawImage: () => void }; toBlob: ReturnType<typeof vi.fn> };

let canvas: Canvas;

function stubBitmap(width: number, height: number) {
  vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width, height, close: vi.fn() }));
}

function blobsFor(map: Record<string, Blob | null>) {
  canvas.toBlob.mockImplementation((resolve: (blob: Blob | null) => void, type: string) =>
    resolve(map[type] ?? null),
  );
}

const photo = new File(["x"], "foto.jpg", { type: "image/jpeg" });

describe("resizeImage", () => {
  beforeEach(() => {
    canvas = { width: 0, height: 0, getContext: () => ({ drawImage: vi.fn() }), toBlob: vi.fn() };
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) =>
      tag === "canvas" ? (canvas as unknown as HTMLCanvasElement) : createElement(tag),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("scales the longest side to 512 keeping the ratio and returns WebP", async () => {
    stubBitmap(4000, 3000);
    const webp = new Blob(["w"], { type: "image/webp" });
    blobsFor({ "image/webp": webp });
    await expect(resizeImage(photo)).resolves.toBe(webp);
    expect(canvas.width).toBe(512);
    expect(canvas.height).toBe(384);
  });

  it("does not upscale a small image", async () => {
    stubBitmap(300, 200);
    blobsFor({ "image/webp": new Blob(["w"], { type: "image/webp" }) });
    await resizeImage(photo);
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(200);
  });

  it("accepts the PNG that Safari returns instead of WebP", async () => {
    stubBitmap(4000, 3000);
    const png = new Blob(["p"], { type: "image/png" });
    blobsFor({ "image/webp": png });
    await expect(resizeImage(photo)).resolves.toBe(png);
  });

  it("falls back to JPEG when the first encoding is not usable", async () => {
    stubBitmap(4000, 3000);
    const jpeg = new Blob(["j"], { type: "image/jpeg" });
    blobsFor({ "image/webp": null, "image/jpeg": jpeg });
    await expect(resizeImage(photo)).resolves.toBe(jpeg);
  });

  it("rejects a file that is not JPG, PNG or WebP", async () => {
    await expect(resizeImage(new File(["x"], "a.gif", { type: "image/gif" }))).rejects.toBeInstanceOf(
      InvalidImageError,
    );
  });

  it("rejects an image that cannot be decoded", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("decode")));
    await expect(resizeImage(photo)).rejects.toBeInstanceOf(InvalidImageError);
  });
});
```

- [ ] **Step 8 (tester): Escribir `src/features/profile/hooks/useChangePhotoMutation.test.ts`**

```ts
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/common/api/ApiError";
import { apiClient } from "@/common/api/apiClient";
import { uploadToSignedUrl } from "@/common/api/uploadToSignedUrl";
import { notifyError } from "@/common/errors/notifyError";
import { useChangePhotoMutation } from "@/features/profile/hooks/useChangePhotoMutation";
import { InvalidImageError, resizeImage } from "@/features/profile/utils/resizeImage";

vi.mock("@/common/api/apiClient", () => ({ apiClient: { post: vi.fn(), put: vi.fn() } }));
vi.mock("@/common/errors/notifyError", () => ({ notifyError: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));
vi.mock("@/common/api/uploadToSignedUrl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/common/api/uploadToSignedUrl")>()),
  uploadToSignedUrl: vi.fn(),
}));
vi.mock("@/features/profile/utils/resizeImage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/profile/utils/resizeImage")>()),
  resizeImage: vi.fn(),
}));

const blob = new Blob(["w"], { type: "image/webp" });
const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
const key = "profiles/0192f6e2-8a7b-7c3d-9e4f-1a2b3c4d5e6f/0192f6e3-1b2c-7d3e-8f4a-5b6c7d8e9f00.webp";
const profile = {
  name: "Ana",
  photoUrl: `https://media.swordvoice.com/${key}`,
  bio: null,
  githubUrl: null,
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: null,
  professionalTitle: null,
  shortDescription: null,
};

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, ...renderHook(() => useChangePhotoMutation(), { wrapper }) };
}

function lastNotifiedMessage() {
  const error = vi.mocked(notifyError).mock.calls.at(-1)?.[0];
  return error instanceof ApiError ? error.message : undefined;
}

describe("useChangePhotoMutation", () => {
  beforeEach(() => {
    vi.mocked(resizeImage).mockResolvedValue(blob);
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { uploadUrl: "https://r2.example.com/x?X-Amz-Signature=s", key, expiresIn: 300 },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    vi.mocked(uploadToSignedUrl).mockResolvedValue(undefined);
    vi.mocked(apiClient.put).mockResolvedValue({ data: profile } as Awaited<ReturnType<typeof apiClient.put>>);
  });

  it("requests the URL with the resized blob, uploads it and confirms the key", async () => {
    const { client, result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.post).toHaveBeenCalledWith("/profiles/me/photo/upload-url", {
      contentType: "image/webp",
      size: blob.size,
    });
    expect(uploadToSignedUrl).toHaveBeenCalledWith("https://r2.example.com/x?X-Amz-Signature=s", blob);
    expect(apiClient.put).toHaveBeenCalledWith("/profiles/me/photo", { key });
    expect(client.getQueryData(["profiles", "me"])).toEqual(profile);
  });

  it("does not confirm when the upload to storage fails (CORS)", async () => {
    vi.mocked(uploadToSignedUrl).mockRejectedValue(new ApiError(0, "x", "SIGNED_UPLOAD_FAILED"));
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiClient.put).not.toHaveBeenCalled();
    expect(lastNotifiedMessage()).toBe("No pudimos subir la foto. Inténtalo de nuevo.");
  });

  it("explains an invalid image without calling the API", async () => {
    vi.mocked(resizeImage).mockRejectedValue(new InvalidImageError());
    const { result } = setup();
    act(() => result.current.mutate(file));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(lastNotifiedMessage()).toBe("Elige una imagen JPG, PNG o WebP");
  });

  it("maps PHOTO_NOT_UPLOADED and keeps the API message for STORAGE_UNAVAILABLE", async () => {
    vi.mocked(apiClient.put).mockRejectedValueOnce(new ApiError(400, "x", "PHOTO_NOT_UPLOADED"));
    const first = setup();
    act(() => first.result.current.mutate(file));
    await waitFor(() => expect(first.result.current.isError).toBe(true));
    expect(lastNotifiedMessage()).toBe("No pudimos subir la foto. Inténtalo de nuevo.");

    vi.mocked(apiClient.post).mockRejectedValueOnce(
      new ApiError(503, "El almacenamiento no está disponible", "STORAGE_UNAVAILABLE"),
    );
    const second = setup();
    act(() => second.result.current.mutate(file));
    await waitFor(() => expect(second.result.current.isError).toBe(true));
    expect(lastNotifiedMessage()).toBe("El almacenamiento no está disponible");
  });
});
```

- [ ] **Step 9 (tester): Escribir `profile-photo/index.test.tsx`**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "../../../../../../test/renderWithClient";
import { ProfilePhoto } from "@/features/profile/components/profile-section/profile-photo";

const mutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
vi.mock("@/features/profile/hooks/useChangePhotoMutation", () => ({
  useChangePhotoMutation: () => mutation,
}));

const base = {
  name: "Ana Pérez",
  photoUrl: null,
  bio: null,
  githubUrl: null,
  portfolioUrl: null,
  linkedinUrl: null,
  freeCodeCampUsername: null,
  professionalTitle: null,
  shortDescription: null,
};
const file = new File(["x"], "foto.png", { type: "image/png" });

describe("ProfilePhoto", () => {
  beforeEach(() => {
    mutation.mutate.mockReset();
    mutation.isPending = false;
  });

  it("offers to upload without a photo and to change with one, never to remove", () => {
    const { unmount } = renderWithClient(<ProfilePhoto profile={base} />);
    expect(screen.getByRole("button", { name: "Subir foto" })).toBeInTheDocument();
    unmount();
    renderWithClient(<ProfilePhoto profile={{ ...base, photoUrl: "https://media.swordvoice.com/p.png" }} />);
    expect(screen.getByRole("button", { name: "Cambiar foto" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Quitar/ })).not.toBeInTheDocument();
  });

  it("uploads the chosen file and clears the input so the same file can be chosen again", async () => {
    mutation.mutate.mockImplementation((_file: File, options: { onSettled: () => void }) =>
      options.onSettled(),
    );
    renderWithClient(<ProfilePhoto profile={base} />);
    const input = screen.getByLabelText<HTMLInputElement>("Elegir foto de perfil");
    await userEvent.upload(input, file);
    expect(mutation.mutate).toHaveBeenCalledWith(file, expect.anything());
    await waitFor(() => expect(input.value).toBe(""));
    await userEvent.upload(input, file);
    expect(mutation.mutate).toHaveBeenCalledTimes(2);
  });

  it("disables the button and shows the overlay while uploading", () => {
    mutation.isPending = true;
    renderWithClient(<ProfilePhoto profile={base} />);
    expect(screen.getByRole("button", { name: "Subir foto" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Subiendo…");
  });
});
```

- [ ] **Step 10:** `pnpm test src/features/profile` → PASS.

- [ ] **Step 11: Commit**

```bash
git add src/features/profile
git commit -m "feat: :sparkles: upload a resized profile photo straight to storage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Pantalla, ruta, navegación y avatar del header

**Files:**
- Create: `src/features/profile/components/profile-section/index.tsx`, `src/features/profile/index.ts`, `src/app/(app)/dashboard/profile/page.tsx`
- Modify: `src/features/dashboard/constants/dashboardNav.ts`, `src/features/dashboard/hooks/useAccountMenu.ts`, `src/features/dashboard/components/dashboard-header/account-menu/index.tsx`
- Test: `src/features/profile/components/profile-section/index.test.tsx`, `src/features/dashboard/components/dashboard-header/account-menu/index.test.tsx`

**Interfaces:**
- Consumes: `useProfileQuery`, `useMeQuery`, `Avatar`, `routes.DASHBOARD_PROFILE` (Task 1), `ProfileForm` (Task 2), `ProfilePhoto` (Task 3), `useCurrentUser`, `useLogoutMutation` (sub-proyecto 1).
- Produces: `ProfileSection()` exportado en `@/features/profile`; `useAccountMenu(): { isOpen; toggle; name: string; photoUrl: string | null; signOut }`.

- [ ] **Step 1 (developer): Crear `profile-section/index.tsx`**

```tsx
"use client";
import { Button } from "@/common/components/button";
import { useMeQuery } from "@/common/hooks/useMeQuery";
import { useProfileQuery } from "@/common/hooks/useProfileQuery";
import { ProfileForm } from "@/features/profile/components/profile-section/profile-form";
import { ProfilePhoto } from "@/features/profile/components/profile-section/profile-photo";

export function ProfileSection() {
  const profile = useProfileQuery();
  const me = useMeQuery();

  if (profile.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-4">
        <p>No pudimos cargar tu perfil.</p>
        <Button type="button" label="Reintentar" onClick={() => void profile.refetch()} />
      </div>
    );
  }
  if (!profile.data || !me.data) {
    return <p role="status">Cargando tu perfil…</p>;
  }

  const isMentor = me.data.pathRoles.some((pathRole) => pathRole.role === "MENTOR");

  return (
    <>
      <h1 className="font-sedgwick text-[32px] md:text-5xl">
        Mi <span className="text-primary">perfil</span>
      </h1>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ProfilePhoto profile={profile.data} />
        <ProfileForm profile={profile.data} email={me.data.email} isMentor={isMentor} />
      </div>
    </>
  );
}
```

- [ ] **Step 2 (developer): Exportar y crear la ruta**

```ts
// src/features/profile/index.ts
export { ProfileSection } from "@/features/profile/components/profile-section";
```

```tsx
// src/app/(app)/dashboard/profile/page.tsx
import type { Metadata } from "next";
import { ProfileSection } from "@/features/profile";

export const metadata: Metadata = { title: "Mi perfil" };

export default function ProfilePage() {
  return <ProfileSection />;
}
```

- [ ] **Step 3 (developer): `dashboardNav.ts`** — antes de `{ id: "ajustes", … }` añadir:

```ts
  { id: "perfil", label: "Mi perfil", href: routes.DASHBOARD_PROFILE },
```

- [ ] **Step 4 (developer): Reescribir `src/features/dashboard/hooks/useAccountMenu.ts`**

```ts
import { useState } from "react";
import { useProfileQuery } from "@/common/hooks/useProfileQuery";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";
import { useLogoutMutation } from "@/features/dashboard/hooks/useLogoutMutation";

export function useAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { name } = useCurrentUser();
  const { data: profile } = useProfileQuery();
  const { mutate: logout } = useLogoutMutation();

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    name,
    photoUrl: profile?.photoUrl ?? null,
    // Al borrar los tokens, el SessionGuard del grupo (app) redirige al login.
    signOut: () => logout(),
  };
}
```

- [ ] **Step 5 (developer): Reescribir `account-menu/index.tsx`**

```tsx
"use client";
import Link from "next/link";
import { Avatar } from "@/common/components/avatar";
import { routes } from "@/common/constants/routes";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";

export function AccountMenu() {
  const { isOpen, toggle, name, photoUrl, signOut } = useAccountMenu();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label="Mi cuenta"
        className="rounded-full hover:[&>span]:border-primary"
      >
        <Avatar name={name} photoUrl={photoUrl} size={44} />
      </button>
      <div
        id="account-menu"
        hidden={!isOpen}
        className="absolute right-0 top-14 z-20 w-48 rounded-xl border border-white/15 bg-black p-2"
      >
        <Link
          href={routes.DASHBOARD_PROFILE}
          className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-white no-underline hover:bg-white/10"
        >
          Mi perfil
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="min-h-11 w-full rounded-lg px-3 text-left hover:bg-white/10"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6 (developer):** `pnpm lint && pnpm typecheck` → pasan. Buscar otros usos de `initials` de `useAccountMenu` (`grep -rn "initials" src/features/dashboard`) y adaptarlos.

- [ ] **Step 7 (tester): Escribir `profile-section/index.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileSection } from "@/features/profile/components/profile-section";

const state = vi.hoisted(() => ({
  profile: { data: undefined as unknown, isError: false, refetch: vi.fn() },
  me: { data: undefined as unknown },
}));

vi.mock("@/common/hooks/useProfileQuery", () => ({ useProfileQuery: () => state.profile }));
vi.mock("@/common/hooks/useMeQuery", () => ({ useMeQuery: () => state.me }));
vi.mock("@/features/profile/components/profile-section/profile-photo", () => ({
  ProfilePhoto: () => <div>foto</div>,
}));
vi.mock("@/features/profile/components/profile-section/profile-form", () => ({
  ProfileForm: ({ isMentor, email }: { isMentor: boolean; email: string }) => (
    <div>{`form ${email} mentor=${String(isMentor)}`}</div>
  ),
}));

const me = (role: "MENTOR" | "APPRENTICE") => ({
  email: "ana@example.com",
  pathRoles: [{ path: { id: "p1", slug: "initiated", name: "Initiated" }, role }],
});

describe("ProfileSection", () => {
  beforeEach(() => {
    state.profile = { data: undefined, isError: false, refetch: vi.fn() };
    state.me = { data: undefined };
  });

  it("shows a loading status until profile and user arrive", () => {
    render(<ProfileSection />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando tu perfil…");
  });

  it("offers a retry when the profile fails", async () => {
    state.profile.isError = true;
    render(<ProfileSection />);
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(state.profile.refetch).toHaveBeenCalled();
  });

  it.each([
    ["MENTOR", "true"],
    ["APPRENTICE", "false"],
  ] as const)("passes isMentor for a %s", (role, expected) => {
    state.profile.data = { name: "Ana" };
    state.me.data = me(role);
    render(<ProfileSection />);
    expect(screen.getByText(`form ana@example.com mentor=${expected}`)).toBeInTheDocument();
  });
});
```

- [ ] **Step 8 (tester): Escribir `account-menu/index.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccountMenu } from "@/features/dashboard/components/dashboard-header/account-menu";

const menu = vi.hoisted(() => ({
  isOpen: true,
  toggle: vi.fn(),
  name: "Ana Pérez",
  photoUrl: null as string | null,
  signOut: vi.fn(),
}));
vi.mock("@/features/dashboard/hooks/useAccountMenu", () => ({ useAccountMenu: () => menu }));

describe("AccountMenu", () => {
  it("shows the initials without a photo and the photo when there is one", () => {
    const { unmount } = render(<AccountMenu />);
    expect(screen.getByText("AP")).toBeInTheDocument();
    unmount();
    menu.photoUrl = "https://media.swordvoice.com/p.png";
    render(<AccountMenu />);
    expect(screen.getByRole("img", { name: "Foto de Ana Pérez" })).toBeInTheDocument();
  });

  it("links to the profile and signs out", async () => {
    render(<AccountMenu />);
    expect(screen.getByRole("link", { name: "Mi perfil" })).toHaveAttribute("href", "/dashboard/profile");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(menu.signOut).toHaveBeenCalled();
  });
});
```

- [ ] **Step 9:** `pnpm test` → todo PASS.

- [ ] **Step 10: Commit**

```bash
git add src/features "src/app/(app)/dashboard/profile"
git commit -m "feat: :sparkles: add the profile page and show the photo in the header

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Verificación final contra la API

- [ ] **Step 1:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` → los cuatro en verde.

- [ ] **Step 2: Configuración** (la hace el usuario): en la API, las variables `R2_*`; en el bucket de R2, acceso público y una regla CORS que permita `PUT` con la cabecera `Content-Type` desde `http://localhost:3000` (y el dominio de producción).

- [ ] **Step 3: Prueba manual**
  1. Barra lateral y menú de cuenta llevan a `/dashboard/profile`.
  2. Editar la bio → "Guardar cambios" → recargar: persiste. En Network, el `PATCH` lleva solo `bio`.
  3. Vaciar el GitHub y guardar → recargar: el campo sigue vacío (`null`).
  4. Cambiar el nombre → el saludo del dashboard y las iniciales se actualizan.
  5. Usuario de freeCodeCamp usado por otra cuenta → error bajo el campo.
  6. Con una cuenta aprendiz no aparece "Perfil de mentor"; con una cuenta mentor sí.
  7. Subir una foto de > 2 MB → "Subiendo…" → la foto aparece en la tarjeta y en el header; en Network el `PUT` a R2 no lleva `Authorization`.
  8. Subir otra foto → reemplaza a la anterior.
  9. Elegir un `.gif` renombrado o un archivo que no sea imagen → "Elige una imagen JPG, PNG o WebP".

- [ ] **Step 4:** Si hubo correcciones, commit con `fix: :bug: …` y la línea `Co-Authored-By`.
