"use client";
import { useAccountMenu } from "@/features/dashboard/hooks/useAccountMenu";

export function AccountMenu() {
  const { isOpen, toggle, initials, signOut } = useAccountMenu();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label="Mi cuenta"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-blue text-[15px] font-bold hover:border-primary"
      >
        {initials}
      </button>
      {isOpen && (
        <div
          id="account-menu"
          className="absolute right-0 top-14 z-20 w-48 rounded-xl border border-white/15 bg-black p-2"
        >
          <button
            type="button"
            onClick={signOut}
            className="min-h-11 w-full rounded-lg px-3 text-left hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
