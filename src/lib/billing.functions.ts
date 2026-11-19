import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequest } from "@tanstack/react-start/server";
import { PLANS } from "@/lib/plans";

async function stripeClient() {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Payments are not set up yet.");
  const { default: Stripe } = await import("stripe");
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ plan: z.enum(["basic", "premium"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const plan = PLANS.find((p) => p.id === data.plan)!;
    const origin = new URL(getRequest().url).origin;
    const stripe = await stripeClient();
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        client_reference_id: context.userId,
        metadata: { userId: context.userId, plan: plan.id },
        line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: plan.price * 100, recurring: { interval: "month" }, product_data: { name: `Boards ${plan.name}`, tax_code: "txcd_10103001" } } }],
        success_url: `${origin}/account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/account`,
      });
      if (!session.url) throw new Error("no url");
      return { url: session.url };
    } catch (e) {
      console.error("Stripe checkout failed", e);
      throw new Error("Checkout could not be started. Please try again.");
    }
  });

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ sessionId: z.string().min(1).max(255).startsWith("cs_") }).parse(input))
  .handler(async ({ data, context }) => {
    const stripe = await stripeClient();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const plan = session.metadata?.["plan"];
    if (session.client_reference_id !== context.userId || session.status !== "complete" || session.payment_status !== "paid" || (plan !== "basic" && plan !== "premium")) {
      throw new Error("We couldn't confirm this payment.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("account_plans").update({ plan }).eq("user_id", context.userId);
    if (error) throw new Error("Your plan could not be updated. Please contact support.");
    return { plan };
  });
