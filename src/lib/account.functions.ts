import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const changeAccountName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ first: z.string().trim().min(1).max(80), last: z.string().trim().min(1).max(80), password: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: current, error } = await context.supabase.auth.getUser();
    if (error || !current.user?.email || current.user.id !== context.userId) throw new Error("Please sign in again.");
    const { data: verified, error: invalid } = await context.supabase.auth.signInWithPassword({ email: current.user.email, password: data.password });
    if (invalid || verified.user?.id !== context.userId) throw new Error("Current password is incorrect.");
    const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!clean(data.first) || !clean(data.last)) throw new Error("Each name must contain a letter or number.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      email: `${clean(data.first)}.${clean(data.last)}@users.boards.local`, email_confirm: true,
      user_metadata: { ...current.user.user_metadata, first_name: data.first, last_name: data.last },
    });
    if (updateError) throw new Error(/already|registered|exists/i.test(updateError.message) ? "An account with this name already exists." : "Your name could not be changed. Please try again.");
    return { success: true };
  });