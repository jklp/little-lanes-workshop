import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

/** Users sign in with first + last name; we derive a stable internal address from it. */
export function nameToEmail(first: string, last: string) {
  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean(first)}.${clean(last)}@users.boards.local`;
}

export const SessionContext = createContext<{ session: Session | null; ready: boolean }>({ session: null, ready: false });
export function useSession() { return useContext(SessionContext); }
