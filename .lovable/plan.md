# Simple landing page, accounts, and paid plans

## Public website
- Make the home page a restrained, Apple-like introduction to **Boards**, with generous whitespace, the existing typography, and a real app preview showing the three fixed columns.
- Keep it to a short introduction, an app preview, and a compact pricing section—no testimonials, extra features, or elaborate effects.
- Add **Sign In** and **Create Account** links that open the existing form in the appropriate mode on a dedicated sign-in page.
- Signed-in visitors see **Open Boards** and **Account** instead of sign-in prompts.
- Keep the desktop-only layout and all existing private-board functionality.

## Account management
- Add an **Account** link inside the app, opening a simple page with name, password, and plan sections.
- Allow first and last name changes. Keep sign-in credentials aligned with the new name, reject names already in use, and preserve all existing boards and cards.
- Require the current password when changing a password; show clear success and error messages.
- Keep name-and-password login only, with no social login or email-based password reset.

## Plans and card limits
| Plan | Monthly price | Cards | Additional benefit |
| --- | --- | --- | --- |
| Free | $0 USD | 10 total across the account's boards | — |
| Basic | $5 USD | Unlimited | — |
| Premium | $50 USD | Unlimited | 24/7 support |

- Interpret the Free cap as **10 cards per account**, across all boards and all three columns—not 10 per board.
- Show the current plan and Free card usage on the Account page, with a compact upgrade section.
- At the Free limit, block new cards and offer an upgrade link. Editing, moving, and deleting existing cards still work.
- Keep existing cards if an account already exceeds 10 or later returns to Free; block additions until usage falls below 10.
- Enforce limits securely, including simultaneous card creation; users cannot grant themselves paid access.
- Present Premium's support benefit without inventing a support email or chat service. A real support contact will be needed before offering that service to paying users.

## Payments: separate activation step
- First build the pages, account controls, pricing, and Free cap. All accounts remain Free until a subscription is confirmed.
- Paddle is the selected provider. Your current Lovable workspace is Free, so activating built-in payments waits for your Lovable upgrade.
- Until activation, paid options clearly state that payments are not yet available; choosing a plan will not falsely upgrade an account.
- After your Lovable upgrade, enable Paddle to create a **test** environment, then create the two USD monthly subscriptions and connect checkout and subscription management.
- Grant unlimited cards only after verified payment events, and update access for cancellation or expiry according to subscription status.
- Live payments require Paddle verification. Test payments do not use real money.

## Technical approach
- Put the public home at `/`, the existing auth form at `/auth`, private board list at `/boards`, and account settings at `/account`.
- Preserve existing `/board/$id` links while applying the managed signed-in route gate to private pages.
- Reuse the existing design system and form controls; give each page its own title and sharing description.
- Keep plan definitions shared between pricing, account views, and tests. Store subscription entitlements separately from user-editable profile fields.
- Use authenticated server operations where privileged name changes are necessary; never accept a caller-supplied account ID as authority.
- Apply backend card-limit enforcement and add focused tests for prices, allowances, account isolation, and limit handling.

## Verification
- Check landing → sign-in/create-account → private boards → account settings.
- Verify a changed name can sign in, a changed password works, and boards remain unchanged.
- Verify the 10th Free card succeeds, the 11th fails across different boards, and existing cards remain editable.
- Check signed-out access cannot read private boards or account settings.
- After payment activation, verify test checkout and subscription access end-to-end before enabling live payments.