import { useState } from "react";
import { useCurrentUser } from "@/features/dashboard/hooks/useCurrentUser";
import { useLogoutMutation } from "@/features/dashboard/hooks/useLogoutMutation";
import { getInitials } from "@/features/dashboard/utils/getInitials";

export function useAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { name } = useCurrentUser();
  const { mutate: logout } = useLogoutMutation();

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    initials: getInitials(name),
    // Al borrar los tokens, el SessionGuard del grupo (app) redirige al login.
    signOut: () => logout(),
  };
}
