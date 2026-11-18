import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { changeAccountName, changeAccountPassword } from "@/lib/account.functions";
import { pageHead } from "@/lib/page-head";
import type { PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanOptions } from "@/components/PlanOptions";
import { toast } from "sonner";
export const Route = createFileRoute("/_authenticated/account")({
  head: () => pageHead("Your account — Boards", "Manage your name, password, and Boards plan."), component: Account,
});
function Account() {
  const { session } = useSession();
  const changeName = useServerFn(changeAccountName);
  const changePassword = useServerFn(changeAccountPassword);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [namePassword, setNamePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<PlanId>("free");
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!session) return;
    void Promise.all([
      supabase.from("profiles").select("first_name,last_name").eq("id", session.user.id).single(),
      supabase.from("account_plans").select("plan,card_count").eq("user_id", session.user.id).single(),
    ]).then(([profile, allowance]) => {
      if (profile.data) { setFirst(profile.data.first_name); setLast(profile.data.last_name); }
      if (allowance.data) { setPlan(allowance.data.plan === "basic" || allowance.data.plan === "premium" ? allowance.data.plan : "free"); setCount(allowance.data.card_count); }
      if (profile.error || allowance.error) toast.error("Your account could not be loaded.");
    });
  }, [session]);
  async function saveName(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      await changeName({ data: { first, last, password: namePassword } });
      await supabase.auth.refreshSession();
      setNamePassword(""); toast.success("Name updated. Use your new name next time you sign in.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Your name could not be changed."); }
    finally { setBusy(false); }
  }
  async function savePassword(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      await changePassword({ data: { password, currentPassword } });
      setPassword(""); setCurrentPassword(""); toast.success("Password updated.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Your password could not be changed."); }
    finally { setBusy(false); }
  }
  return <div>
    <h1 className="text-3xl font-semibold">Account</h1>
    <section className="mt-10 grid grid-cols-[240px_1fr] gap-12 border-b border-border pb-10">
      <div><h2 className="text-lg font-semibold">Your name</h2><p className="mt-2 text-sm text-muted-foreground">Your name is also your sign-in.</p></div>
      <form onSubmit={saveName} className="max-w-md space-y-4">
        <div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-sm"><span>First name</span><Input value={first} onChange={e => setFirst(e.target.value)} required /></label><label className="space-y-2 text-sm"><span>Last name</span><Input value={last} onChange={e => setLast(e.target.value)} required /></label></div>
        <label className="block space-y-2 text-sm"><span>Current password</span><Input type="password" autoComplete="current-password" value={namePassword} onChange={e => setNamePassword(e.target.value)} required /></label>
        <Button disabled={busy} type="submit">Save Name</Button>
      </form>
    </section>
    <section className="grid grid-cols-[240px_1fr] gap-12 border-b border-border py-10">
      <h2 className="text-lg font-semibold">Password</h2>
      <form onSubmit={savePassword} className="max-w-md space-y-4">
        <label className="block space-y-2 text-sm"><span>Current password</span><Input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></label>
        <label className="block space-y-2 text-sm"><span>New password</span><Input type="password" autoComplete="new-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></label>
        <Button disabled={busy} type="submit">Change Password</Button>
      </form>
    </section>
    <section className="py-10"><div className="mb-7 flex items-end justify-between"><h2 className="text-lg font-semibold">Your plan</h2><p className="text-sm text-muted-foreground">{plan === "free" ? `${count} / 10 cards · Free` : `${count} cards · ${plan === "basic" ? "Basic" : "Premium"}`}</p></div><PlanOptions current={plan} /><p className="mt-5 text-sm text-muted-foreground">Paid subscriptions are not yet available.</p></section>
  </div>;
}