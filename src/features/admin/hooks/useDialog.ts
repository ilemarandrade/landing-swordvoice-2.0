import { useEffect, useRef } from "react";

// Al abrir, el foco va al botón de cerrar; Esc cierra.
export function useDialog(onClose: () => void) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  // onClose cambia en cada render del padre: con un ref el foco solo se mueve al abrir.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return { closeButtonRef };
}
