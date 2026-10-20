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
    mutate(file, {
      onSettled: () => {
        input.value = "";
      },
    });
  };

  return {
    inputRef,
    openPicker: () => inputRef.current?.click(),
    onFileChange,
    isUploading: isPending,
  };
}
