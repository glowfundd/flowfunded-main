-- FlowFunded Phase 2 Database Schema
-- Run this in your Supabase SQL Editor

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  full_name text,
  avatar_url text,
  country text,
  payout_wallet text,
  payout_method text default 'crypto', -- 'crypto' | 'bank'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── CHALLENGES ──────────────────────────────────────────────────────────────
create table if not exists public.challenges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_size numeric not null,         -- 10000 | 25000 | 50000 | 100000 | 200000
  phase int not null default 1,          -- 1 = evaluation, 2 = verification, 3 = funded
  status text not null default 'active', -- 'active' | 'passed' | 'failed' | 'funded'
  profit_target numeric not null,        -- e.g. 0.08 for 8%
  max_drawdown numeric not null,         -- e.g. 0.10 for 10%
  daily_loss_limit numeric not null,     -- e.g. 0.05 for 5%
  starting_balance numeric not null,
  current_balance numeric not null,
  peak_balance numeric not null,
  platform text default 'MT5',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.challenges enable row level security;
create policy "Users can view own challenges" on public.challenges for select using (auth.uid() = user_id);
create policy "Users can insert own challenges" on public.challenges for insert with check (auth.uid() = user_id);
create policy "Users can update own challenges" on public.challenges for update using (auth.uid() = user_id);

-- ─── TRADES ──────────────────────────────────────────────────────────────────
create table if not exists public.trades (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  direction text not null,    -- 'buy' | 'sell'
  entry_price numeric not null,
  exit_price numeric,
  lot_size numeric not null default 0.01,
  pnl numeric,
  status text not null default 'open',  -- 'open' | 'closed'
  opened_at timestamptz default now(),
  closed_at timestamptz
);
alter table public.trades enable row level security;
create policy "Users can view own trades" on public.trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "Users can update own trades" on public.trades for update using (auth.uid() = user_id);

-- ─── DAILY EQUITY SNAPSHOTS ───────────────────────────────────────────────────
create table if not exists public.equity_snapshots (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  balance numeric not null,
  equity numeric not null,
  daily_pnl numeric not null default 0,
  created_at timestamptz default now(),
  unique(challenge_id, date)
);
alter table public.equity_snapshots enable row level security;
create policy "Users can view own snapshots" on public.equity_snapshots for select using (auth.uid() = user_id);
create policy "Users can insert own snapshots" on public.equity_snapshots for insert with check (auth.uid() = user_id);

-- ─── PAYOUTS ─────────────────────────────────────────────────────────────────
create table if not exists public.payouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_id uuid references public.challenges(id) on delete cascade,
  amount numeric not null,
  profit_split numeric not null default 0.85,  -- e.g. 0.85 = 85%
  gross_profit numeric not null,
  method text not null,   -- 'crypto_usdt' | 'crypto_btc' | 'bank_wire'
  wallet_address text,
  status text not null default 'pending',  -- 'pending' | 'processing' | 'completed' | 'rejected'
  requested_at timestamptz default now(),
  processed_at timestamptz,
  tx_hash text,
  notes text
);
alter table public.payouts enable row level security;
create policy "Users can view own payouts" on public.payouts for select using (auth.uid() = user_id);
create policy "Users can insert own payouts" on public.payouts for insert with check (auth.uid() = user_id);

-- ─── SEED DEMO DATA (optional — for testing) ──────────────────────────────────
-- After auth sign-up, insert a demo challenge for your user:
-- insert into public.challenges (user_id, account_size, phase, status, profit_target, max_drawdown, daily_loss_limit, starting_balance, current_balance, peak_balance)
-- values ('<your_user_id>', 50000, 1, 'active', 0.08, 0.10, 0.05, 50000, 52340, 52340);
