import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("first_name,last_name").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => data && setName(`${data.first_name} ${data.last_name}`));
  }, [session]);

  if (!ready) return null;
  if (!session) return null;
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-8">
          <Link to="/boards" className="text-[15px] font-semibold">Boards</Link>
          <div className="flex items-center gap-5 text-sm">
            <span className="text-muted-foreground">{name}</span>
            <Button variant="link" asChild><Link to="/account">Account</Link></Button>
            <Button variant="link" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-8 py-10">{children}</main>
    </div>
  );
}
