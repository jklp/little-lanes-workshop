import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { AuthScreen } from "./AuthScreen";

export function AppShell({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  const [name, setName] = useState("");
  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("first_name,last_name").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => data && setName(`${data.first_name} ${data.last_name}`));
  }, [session]);

  if (!ready) return null;
  if (!session) return <AuthScreen />;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-8">
          <Link to="/" className="text-[15px] font-semibold tracking-tight">Boards</Link>
          <div className="flex items-center gap-5 text-sm">
            <span className="text-muted-foreground">{name}</span>
            <button onClick={() => supabase.auth.signOut()} className="text-primary">Sign Out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-8 py-10">{children}</main>
    </div>
  );
}
