import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";
export function PlanOptions({ current }: { current?: PlanId | undefined }) {
  return <div className="grid grid-cols-3 gap-6">
    {PLANS.map(plan => <div key={plan.id} className="flex flex-col rounded-lg border border-border bg-card p-7">
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="mt-5"><span className="text-4xl font-semibold">${plan.price}</span><span className="ml-2 text-sm text-muted-foreground">USD / month</span></p>
      <ul className="mb-8 mt-7 flex-1 space-y-3 text-sm">{plan.benefits.map(benefit => <li key={benefit} className="flex items-center gap-2"><Check className="size-4 text-primary" />{benefit}</li>)}</ul>
      {current === plan.id ? <Button variant="secondary" disabled>Current plan</Button> : plan.id === "free" && !current ? <Button variant="outline" asChild><Link to="/auth" search={{ mode: "signup" }}>Create Account</Link></Button> : <Button variant="outline" disabled>Not yet available</Button>}
    </div>)}
  </div>;
}