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
