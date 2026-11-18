import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { nameToEmail } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";

export function AuthScreen({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const email = nameToEmail(first, last);
    const res =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { first_name: first.trim(), last_name: last.trim() } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) {
      const m = res.error.message;
      setError(
        /already registered/i.test(m)
          ? "An account with this name already exists."
          : /invalid login/i.test(m)
            ? "Name or password is incorrect."
            : m,
      );
    } else if (res.data.session) {
      await navigate({ to: "/boards" });
    } else {
      setError("Your account needs confirmation. Please contact the app owner.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={submit} className="w-[340px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold"><Link to="/">Boards</Link></h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue." : "Create your account."}
          </p>
        </div>
        <div className="space-y-3">
          <Input placeholder="First name" value={first} onChange={(e) => setFirst(e.target.value)} required className="h-11 rounded-xl bg-card" />
          <Input placeholder="Last name" value={last} onChange={(e) => setLast(e.target.value)} required className="h-11 rounded-xl bg-card" />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11 rounded-xl bg-card" />
        </div>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className="h-11 w-full rounded-xl text-[15px]">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
        <Button variant="link" asChild className="w-full">
          <Link to="/auth" search={{ mode: mode === "signin" ? "signup" : "signin" }} onClick={() => setError(null)}>
          {mode === "signin" ? "Create an account" : "Already have an account? Sign in"}
          </Link>
        </Button>
      </form>
    </div>
  );
}
