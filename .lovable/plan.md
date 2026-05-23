## Razorpay Automated Payment + Cinematic UI/UX

Full revert of the manual UTR flow back to a **server-verified Razorpay checkout**, plus a cinematic redesign across Home / Pay / Register / Leaderboard.

---

### 1. Backend — Server-side verification

**New table: `verified_sessions`**
- `payment_id` (PK, text) — Razorpay payment id, used as session token
- `display_name` (text, nullable until register)
- `verified` (bool, default true)
- `used` (bool, default false) — flips true when name claimed
- `order_id` (text)
- `created_at` (timestamptz)
- RLS: public SELECT by `payment_id` only; writes via service role from edge functions

**New table: `orders`**
- `order_id` (PK, text)
- `status` (text: pending/paid/failed)
- `amount` (int, default 100)
- `created_at`
- RLS: no public access; edge-function only

**Edge function: `create-order`** (rewrite existing)
- POST → calls Razorpay Orders API with hardcoded `amount: 100, currency: 'INR'`
- Inserts row into `orders` with status `pending`
- Returns `{ order_id, amount, currency, key_id }` (key_id = `RAZORPAY_KEY_ID`)

**Edge function: `verify-payment`** (rewrite existing)
- POST `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- HMAC-SHA256 check using `RAZORPAY_KEY_SECRET`
- On valid: update `orders` to `paid`, insert into `verified_sessions`, insert `payment_logs` (success), increment `site_stats.total_payers`, return `{ success: true, session_token: payment_id }`
- On invalid: insert `payment_logs` (failed), return 400

**Edge function: `register-user`** (rewrite back from UTR flow)
- POST `{ session_token, display_name, referred_by? }`
- Server re-checks `verified_sessions/{session_token}` exists, `verified=true`, `used=false`
- Inserts into `users_ledger` with `is_verified: true`, links `razorpay_payment_id = session_token`
- Marks `verified_sessions.used = true`, stores display_name
- Generates referral code, returns user record

---

### 2. Client — Payment flow

**`src/lib/api.ts`**
- `createOrder()` → returns `{ order_id, amount, currency, key_id }`
- `verifyPayment(order_id, payment_id, signature)` → returns `{ session_token }`
- `registerUser(session_token, display_name, referred_by?)`

**`src/pages/PayPage.tsx`** (rewrite)
- Step progress bar: DECIDE → PAY → JOIN (animated gold fill)
- States: `idle | creating | opening | verifying | success | error`
- Click PAY → `createOrder` → load Razorpay → open checkout with `order_id`
- Razorpay `handler` → `verifyPayment` → store `session_token` in sessionStorage → confetti → navigate `/register`
- `modal.ondismiss` → reset to idle

**`src/pages/RegisterPage.tsx`** (revert from UTR)
- Reads `session_token` from sessionStorage
- On mount: server-verifies session via `verified_sessions` SELECT
- Submits `{ session_token, display_name }` to `register-user`

**`src/components/RouteGuards.tsx` + new `useVerifiedSession` hook**
- Replaces sessionStorage-only check with DB check on every protected page load
- Reads `session_token` → fetches `verified_sessions/{token}` → allows or redirects with toast

---

### 3. Cinematic UI/UX

**Design tokens (`src/index.css` + `tailwind.config.ts`)**
- Replace palette with: `--void #030305`, `--ink #0a0a0f`, `--gold #FFD166`, `--green #06D6A0`, `--red #EF476F`, `--text #F0EDE8`, `--text-dim`, `--border`
- Gold-glow shadow utility
- Border-radius cap at 4px
- Custom scrollbar (4px dark track, gold thumb)

**Fonts (`index.html`)**
- Add Google Fonts: Syne (700/800), Space Grotesk (400–600), JetBrains Mono
- Tailwind `fontFamily`: `display: Syne`, `sans: Space Grotesk`, `mono: JetBrains Mono`
- Remove any Inter/Roboto references

**Motion**
- Install/use `framer-motion` (already present) + `canvas-confetti`
- Shared variants: page entry (opacity+y, ease [0.16,1,0.3,1]), word-stagger headline, scroll reveal via `useInView`, spring number counter

**HomePage**
- Dark full-viewport hero, canvas particle field (30 gold dots, opacity 0.12, slow drift)
- Word-by-word headline reveal (80ms stagger)
- Spring-counted live payer count (large JetBrains Mono numeral)
- Gold-bordered CTA, gold-flood-from-left hover, Lock→Unlock lucide animation
- 3 stat cards sliding in from left on scroll
- Bottom infinite marquee: "PAY ₹1 → JOIN THE LIST → SEE WHO PAID →"

**PayPage**
- Step progress bar
- 4 distinct loading micro-states with icons
- Confetti burst on success (gold + green + white)

**RegisterPage**
- Green verified banner slides down on mount
- Input gold-glow on focus
- Character count color shift white → amber → red
- Submit button dim/active states

**LeaderboardPage**
- Gold welcome banner with name + rank
- Rank "counts down" from total to user rank (spring, 800ms)
- Row stagger fade-in (20ms each)
- User's row: infinite-pulsing gold left border
- Hover y-lift on rows

**Global**
- No white backgrounds, no purple gradients, no Inter/Roboto
- Hover state on every interactive element
- Cards use only `border rgba(255,255,255,0.07)`, no heavy shadows

---

### Files to create
- `supabase/migrations/<ts>_verified_sessions.sql`
- `src/hooks/useVerifiedSession.ts`
- `src/components/ParticleField.tsx`
- `src/components/Marquee.tsx`
- `src/components/StepProgress.tsx`
- `src/components/CountUp.tsx`

### Files to edit
- `supabase/functions/create-order/index.ts`
- `supabase/functions/verify-payment/index.ts`
- `supabase/functions/register-user/index.ts`
- `src/lib/api.ts`, `src/lib/razorpay.ts`, `src/lib/session.ts`
- `src/pages/PayPage.tsx`, `src/pages/RegisterPage.tsx`, `src/pages/HomePage.tsx`, `src/pages/LeaderboardPage.tsx`
- `src/components/RouteGuards.tsx`, `src/components/DynamicIslandNav.tsx`
- `src/index.css`, `tailwind.config.ts`, `index.html`, `package.json` (add `canvas-confetti`)

### Secrets
`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are already configured — no new secrets needed. Currently in **test mode** with the keys you provided earlier.

### Notes
- Manual UTR flow (PayPage manual-verify, AdminPayments approve button) is removed — all verification is automatic via signature.
- `users_ledger.is_verified` will always be `true` going forward; existing pending rows can stay or be cleaned up by admin.
