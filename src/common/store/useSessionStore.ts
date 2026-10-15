import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LearningPathId } from "@/common/constants/learningPaths";

export type SessionUser = {
  name: string;
  email: string;
  path: LearningPathId | null;
};

type SessionState = {
  user: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
};

// Sesión local temporal mientras no exista backend de auth (roadmap feature 1).
// Solo decide qué vistas se muestran; no es una barrera de seguridad.
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "sv-session",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
