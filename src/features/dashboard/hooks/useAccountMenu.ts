import { useState } from "react";
import { useSessionStore } from "@/common/store/useSessionStore";
import { getInitials } from "@/features/dashboard/utils/getInitials";

export function useAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const name = useSessionStore((state) => state.user?.name ?? "");
  const signOut = useSessionStore((state) => state.signOut);

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    initials: getInitials(name),
    // El SessionGuard del grupo (app) redirige al login al cerrar sesión.
    signOut,
  };
}
