import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Users sign in with first + last name; we derive a stable internal address from it. */
export function nameToEmail(first: string, last: string) {
  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean(first)}.${clean(last)}@users.boards.local`;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready };
}
