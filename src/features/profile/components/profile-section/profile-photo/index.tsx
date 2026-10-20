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
      <p className="text-sm text-[#C9C9D6]">
        JPG, PNG o WebP. La ajustamos a 512 px.
      </p>
    </section>
  );
}
