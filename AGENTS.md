<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Users sign in with first + last name + password; `nameToEmail` in src/lib/auth.ts derives the internal auth email (auth requires an email), so names must be unique and auto-confirm stays on.

- Public landing and auth live at top-level; private board and account pages live under the client-only authenticated layout to preserve private access on hard refresh.
- Session state has one root subscriber and a shared context, preventing stale sign-in controls and competing auth listeners.
- Plan entitlements are read-only to users and card counts are atomically enforced by database triggers, preventing self-upgrades and concurrent limit bypasses.
- Name and password changes reauthenticate the caller before updating only that caller's auth record; the lifecycle trigger synchronizes profile names so sign-in and display names remain aligned. Use authenticated server operations for password updates because browser auth updates fail through the managed preview proxy.
- Share prices and UI allowances through the plan module; verified subscription integration must update entitlements before paid benefits become available.
