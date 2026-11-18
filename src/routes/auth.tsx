import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";
import { useSession } from "@/lib/auth";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signin" | "signup" } => ({ mode: search["mode"] === "signup" ? "signup" : "signin" }),
  head: () => pageHead("Sign in or create an account — Boards", "Access your private task boards with your name and password."),
  component: AuthPage,
});
function AuthPage() {
  const { mode } = Route.useSearch();
  const { session, ready } = useSession();
  if (ready && session) return <Navigate to="/boards" replace />;
  return <AuthScreen mode={mode ?? "signin"} />;
}