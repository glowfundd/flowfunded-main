# FlowFunded — Agent Handoff Document
> Last updated: June 2026 | Status: Phase 3 In Progress 🔄

This document gives a new agent (Claude or otherwise) everything needed to understand the codebase and continue building without any prior conversation context.

---

## 1. What Is FlowFunded?

A **proprietary trading firm platform** — traders pay to take evaluation challenges, prove their skill, and get funded with simulated capital up to $200K. They keep 80–90% of profits.

**Competitors for reference:** FTMO, MyForexFunds, The Funded Trader.

**Tech Stack:**
- Next.js 16.2.7 (App Router, TypeScript)
- React 19, Tailwind CSS 4
- Supabase (Auth + Postgres DB)
- Framer Motion (animations)
- Recharts (performance charts)
- Lucide React (icons)

**Repo:** `https://github.com/heisstrangewrld/flowfunded.git`

---

## 2. How to Run Locally

```bash
git clone https://github.com/heisstrangewrld/flowfunded.git
cd flowfunded
npm install

# Create .env.local with your Supabase credentials + wallet addresses:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
PAYMENT_USDT_TRC20=YOUR_USDT_TRC20_WALLET
PAYMENT_USDT_ERC20=YOUR_USDT_ERC20_WALLET
PAYMENT_BTC=YOUR_BTC_WALLET
PAYMENT_ETH=YOUR_ETH_WALLET

npm run dev
# Open http://localhost:3000
```

**Required: Run the Supabase schema first** (see Section 5).

---

## 3. Full Project File Structure

```
flowfunded/
├── supabase_schema.sql          ← DB migration (run this in Supabase SQL Editor)
├── AUTHENTICATION_SETUP.md      ← Supabase auth setup guide
├── AGENT_HANDOFF.md             ← This file
├── package.json
├── next.config.mjs
├── tsconfig.json
├── postcss.config.mjs
│
└── src/
    ├── app/
    │   ├── layout.tsx           ← Root layout, wraps AuthProvider + Navbar + Footer
    │   ├── globals.css          ← Design tokens, glass-panel, neon glow utilities
    │   ├── page.tsx             ← Landing page (hero, challenge configurator, payout feed, FAQ CTA)
    │   ├── dashboard/
    │   │   └── page.tsx         ← Main trader dashboard (Phase 2 rebuilt — real data)
    │   ├── login/page.tsx       ← Login form (Supabase email/password) — also routes admin to /admin
    │   ├── signup/page.tsx      ← Signup form
    │   ├── account/page.tsx     ← Account settings (stub — needs building)
    │   ├── checkout/page.tsx    ← Crypto checkout flow (account size → wallet address → tx hash submit)
    │   ├── admin/               ← Admin panel (role = 'admin' required)
    │   │   ├── layout.tsx       ← Admin sidebar layout
    │   │   ├── page.tsx         ← Admin dashboard (stats)
    │   │   ├── users/page.tsx   ← All users table + ban/unban
    │   │   ├── challenges/page.tsx ← All challenges + manual edit
    │   │   ├── payouts/page.tsx ← Approve/reject payout requests
    │   │   └── deposits/page.tsx ← Confirm crypto deposits, activate challenges
    │   ├── leaderboard/page.tsx ← Leaderboard (currently mock data)
    │   ├── faq/page.tsx         ← FAQ page (static)
    │   └── rules/page.tsx       ← Rules page (static)
    │
    ├── components/
    │   ├── Navbar.tsx           ← Responsive navbar, auth-aware, quick actions in dropdown
    │   ├── Footer.tsx           ← Site footer
    │   ├── ChallengeConfigurator.tsx ← Interactive pricing/challenge selector — links to /checkout
    │   ├── LivePayoutFeed.tsx   ← Scrolling marquee of recent payouts (mock data)
    │   └── dashboard/
    │       ├── PerformanceChart.tsx  ← Recharts area chart (equity curve, 7D/14D/30D/ALL)
    │       ├── ChallengeTracker.tsx  ← Phase progress stepper + rule violation alerts
    │       ├── OpenPositions.tsx     ← Live trades table
    │       └── PayoutFlow.tsx        ← Payout request modal + history table
    │
    ├── context/
    │   └── AuthContext.tsx      ← Global auth state (useAuth hook)
    │
    ├── lib/
    │   ├── supabase.ts          ← Supabase client singleton
    │   └── db.ts                ← All DB access helpers (challenges, trades, payouts, snapshots, deposits)
    │
    └── types/
        └── database.ts          ← TypeScript types: Profile, Challenge, Trade, EquitySnapshot, Payout, Deposit
```

---

## 4. Design System

**Colors (from `globals.css`):**
```
--background: #05070e        (deep space dark)
--primary:    #00f0ff        (neon cyan — primary brand colour)
--secondary:  #6366f1        (indigo/violet)
--accent:     #3b82f6        (blue)
--success:    #10b981        (emerald green)
--destructive:#ef4444        (red)
--muted:      #6b7280        (gray)
```

**Key CSS utilities:**
- `.glass-panel` — dark translucent card with backdrop-blur
- `.glass-panel-hover` — hover lift + cyan border glow
- `.text-neon-glow` — cyan text glow shadow
- `.border-neon-glow` — box shadow glow

**Conventions:**
- All cards: `rounded-xl glass-panel border border-white/5 p-6`
- Section headings: `text-lg font-bold text-white`
- Subtext: `text-sm text-gray-400`
- Primary buttons: `bg-primary text-black font-bold rounded-xl` with shadow `shadow-[0_0_20px_rgba(0,240,255,0.2)]`
- Ghost buttons: `bg-white/5 border border-white/10 text-gray-400 hover:text-white`

---

## 5. Database Schema

**Run `supabase_schema.sql` in your Supabase SQL Editor.** It creates:

| Table | Purpose |
|---|---|
| `profiles` | User profile (name, country, payout wallet, role). Auto-created on signup via trigger. |
| `challenges` | Each purchased challenge (account size, phase, status, balances, drawdown limits) |
| `trades` | Individual trade records linked to a challenge |
| `equity_snapshots` | Daily balance/equity snapshots for the performance chart |
| `payouts` | Payout requests with status tracking |
| `deposits` | Crypto deposit submissions (tx hash, amount claimed, coin, status) |

All tables have **Row Level Security (RLS)** — users can only see their own data. Admin reads all via service role.

**Add `role` column to profiles:**
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Create deposits table
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  account_size text NOT NULL,
  fee text NOT NULL,
  coin text NOT NULL,          -- 'USDT_TRC20' | 'USDT_ERC20' | 'BTC' | 'ETH'
  tx_hash text NOT NULL,
  amount_claimed numeric NOT NULL,
  status text DEFAULT 'pending', -- 'pending' | 'confirmed' | 'rejected'
  admin_note text,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**To seed test data after signing up:**
```sql
-- Get your user ID from Supabase Auth dashboard, then run:
INSERT INTO public.challenges (
  user_id, account_size, phase, status,
  profit_target, max_drawdown, daily_loss_limit,
  starting_balance, current_balance, peak_balance
) VALUES (
  'YOUR-USER-UUID', 50000, 1, 'active',
  0.08, 0.10, 0.05,
  50000, 52340, 52340
);

-- Make yourself admin:
UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR-USER-UUID';
```

---

## 6. Payment System — Crypto Only (No Stripe)

FlowFunded uses **manual crypto payments only**. No payment processor is integrated.

**Supported coins:**
- USDT (TRC20)
- USDT (ERC20)
- BTC (Bitcoin)
- ETH (Ethereum)

**Flow:**
1. Trader clicks "Start Challenge" on landing page
2. If not logged in → redirect to `/login?redirect=/checkout?account=...` → after login, back to checkout
3. Trader selects coin, sees wallet address (from env vars), copies it
4. Trader sends payment, then submits tx hash + amount on the checkout page
5. Submission creates a row in `deposits` table with `status = 'pending'`
6. Trader is redirected to `/dashboard` with a "Payment pending" banner
7. **Admin** sees pending deposit in `/admin/deposits`, verifies on-chain, clicks Confirm
8. On confirm: deposit status → `confirmed`, challenge row is auto-created for the trader

**Wallet addresses (set in `.env.local`):**
```
PAYMENT_USDT_TRC20=placeholder_trc20_address
PAYMENT_USDT_ERC20=placeholder_erc20_address
PAYMENT_BTC=placeholder_btc_address
PAYMENT_ETH=placeholder_eth_address
```

---

## 7. Admin Panel

**URL:** `/admin` and sub-routes  
**Access:** `profiles.role = 'admin'` — set manually in Supabase DB  
**Login:** Same login page as traders (`/login`) — after login, if role = admin, redirect to `/admin`

**Pages:**
| Route | Purpose |
|---|---|
| `/admin` | Stats dashboard: total revenue, active traders, pending payouts, pending deposits, challenges passed/failed |
| `/admin/users` | All users: email, name, country, challenges count, status, ban/unban |
| `/admin/challenges` | All challenges: view, edit phase/balance, add note, reset |
| `/admin/payouts` | Approve/reject payout requests, paste tx hash |
| `/admin/deposits` | Confirm/reject crypto deposit submissions, auto-creates challenge on confirm |

**Layout:** Sidebar navigation (separate from main site navbar/footer)

**Trader soft ban:** `profiles.is_banned = true` — they can log in but dashboard shows "Account suspended" banner, cannot request payouts.

---

## 8. What's Done (Phases 1 & 2)

### ✅ Phase 1 — Foundation
- Landing page (hero, stats, how-it-works, testimonials)
- Challenge configurator component (5 account sizes, interactive pricing)
- Live payout feed marquee (mock data for now)
- Supabase auth (login, signup, protected routes)
- Navbar (auth-aware, quick actions dropdown), Footer
- FAQ page, Rules page

### ✅ Phase 2 — Real Dashboard
- **PerformanceChart** — Recharts equity curve with range selector, gradient fill, custom tooltip
- **ChallengeTracker** — Phase 1→2→3 stepper, profit progress bar, max drawdown + daily loss rule monitoring
- **OpenPositions** — live trade table with BUY/SELL badges, P&L coloring, live indicator
- **PayoutFlow** — payout request modal (USDT/BTC/wire), history table with status badges
- **Dashboard page rebuilt** — all data loaded from Supabase, stat cards wired to real challenge data

---

## 9. What Needs to Be Built Next

### 🔄 Phase 3 — In Progress

#### A. Checkout Flow (improve existing)
- `/checkout` exists but tx hash submission needs wiring to `deposits` table
- Dashboard needs "Payment Pending" banner when deposit is pending
- Login redirect: `?redirect=` param support in `/login`

#### B. Admin Panel ← **Build this next**
- See Section 7 for full spec
- Start with layout + dashboard stats, then deposits page (most critical for revenue)

#### C. Account Settings Page (`src/app/account/page.tsx`)
- Profile: full_name, country, avatar upload
- Payout wallet: address, preferred method
- Security: change password

---

### 🟡 Phase 4 — Trader Experience

#### A. Live Leaderboard
- Query `challenges` joined with `profiles`, order by % gain
- Filter tabs: This Week / This Month / All Time

#### B. Affiliate / Referral System
- `referral_code` + `referred_by` on profiles
- `affiliate_earnings` table
- Landing page: `?ref=CODE` → cookie → credit on deposit confirm

#### C. Trading Journal (`src/app/journal/page.tsx`)

---

### 🟢 Phase 5 — Growth

#### A. FlowAcademy (`src/app/academy/page.tsx`)
#### B. Funded Certificate (PDF generation on status = 'funded')
#### C. Email Notifications (Supabase Edge Functions + Resend)

---

## 10. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # for admin API routes only

# Crypto wallet addresses
PAYMENT_USDT_TRC20=placeholder_trc20_address
PAYMENT_USDT_ERC20=placeholder_erc20_address
PAYMENT_BTC=placeholder_btc_address
PAYMENT_ETH=placeholder_eth_address

# For Phase 5 (Email):
RESEND_API_KEY=re_...
```

---

## 11. Git Commit History

```
(latest) Phase 3: Admin panel + crypto checkout flow
5596221  Delete CNAME
b78b963  Create CNAME
4144a58  Add crypto checkout flow
22781e9  Add AGENT_HANDOFF.md
4ee7bf2  Phase 2: Real dashboard
```

---

## 12. Known Issues / TODOs

| Item | File | Priority |
|---|---|---|
| Checkout tx hash submission not wired to DB | `src/app/checkout/page.tsx` | CRITICAL |
| Admin panel not built | `src/app/admin/` | CRITICAL |
| `LivePayoutFeed` uses hardcoded mock data | `src/components/LivePayoutFeed.tsx` | Medium |
| Leaderboard uses hardcoded mock data | `src/app/leaderboard/page.tsx` | Medium |
| Account settings page is a stub | `src/app/account/page.tsx` | High |
| Login page doesn't support `?redirect=` param | `src/app/login/page.tsx` | High |
| Google Fonts removed (blocked in build env) | `src/app/layout.tsx` | Low |

---

## 13. Prompt to Give a New Agent

```
I'm building FlowFunded — a prop trading firm platform at https://github.com/heisstrangewrld/flowfunded.git

Please clone the repo and read AGENT_HANDOFF.md first — it has the full context, file structure, design system, and what needs to be built next.

Stack: Next.js 16, TypeScript, Tailwind CSS 4, Supabase, Recharts, Framer Motion.

Phases 1 and 2 are complete. Phase 3 is in progress.

Payment is crypto-only (USDT TRC20/ERC20, BTC, ETH) — manual confirmation by admin. No Stripe.

Next priority: Admin panel (sidebar layout, /admin, /admin/users, /admin/challenges, /admin/payouts, /admin/deposits). See AGENT_HANDOFF.md Section 7 for full spec.
```
