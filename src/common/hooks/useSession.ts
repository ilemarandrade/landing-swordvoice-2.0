import { useSyncExternalStore } from "react";
import { getTokens, subscribe } from "@/common/api/tokenStorage";

export type SessionStatus = "unknown" | "authenticated" | "anonymous";

const getSnapshot = (): SessionStatus =>
  getTokens() ? "authenticated" : "anonymous";
// En el servidor y durante la hidratación no se conoce el storage.
const getServerSnapshot = (): SessionStatus => "unknown";

export function useSession() {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { status };
}
