import { supabase } from "./supabase";
import type { Challenge, Trade, EquitySnapshot, Payout } from "@/types/database";

// ─── CHALLENGES ───────────────────────────────────────────────────────────────

export async function getUserChallenges(userId: string): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActiveChallenge(userId: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ─── TRADES ───────────────────────────────────────────────────────────────────

export async function getOpenTrades(challengeId: string): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("status", "open")
    .order("opened_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getRecentClosedTrades(challengeId: string, limit = 20): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTradeSummary(challengeId: string) {
  const { data, error } = await supabase
    .from("trades")
    .select("pnl, status, direction")
    .eq("challenge_id", challengeId)
    .eq("status", "closed");
  if (error) throw error;
  const trades = data ?? [];
  const total = trades.length;
  const winners = trades.filter((t) => (t.pnl ?? 0) > 0).length;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const winRate = total > 0 ? (winners / total) * 100 : 0;
  return { total, winners, totalPnl, winRate };
}

// ─── EQUITY SNAPSHOTS ─────────────────────────────────────────────────────────

export async function getEquitySnapshots(
  challengeId: string,
  days = 30
): Promise<EquitySnapshot[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("equity_snapshots")
    .select("*")
    .eq("challenge_id", challengeId)
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── PAYOUTS ──────────────────────────────────────────────────────────────────

export async function getUserPayouts(userId: string): Promise<Payout[]> {
  const { data, error } = await supabase
    .from("payouts")
    .select("*")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function requestPayout(payload: {
  user_id: string;
  challenge_id: string;
  gross_profit: number;
  profit_split: number;
  method: Payout["method"];
  wallet_address?: string;
}): Promise<Payout> {
  const amount = payload.gross_profit * payload.profit_split;
  const { data, error } = await supabase
    .from("payouts")
    .insert({
      ...payload,
      amount,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function calcChallengeMetrics(challenge: Challenge) {
  const { starting_balance, current_balance, peak_balance, max_drawdown, daily_loss_limit, profit_target } = challenge;
  const totalPnl = current_balance - starting_balance;
  const totalPnlPct = (totalPnl / starting_balance) * 100;
  const drawdown = ((peak_balance - current_balance) / peak_balance) * 100;
  const profitTargetAmt = starting_balance * profit_target;
  const profitProgress = Math.min((totalPnl / profitTargetAmt) * 100, 100);
  const maxDrawdownAmt = starting_balance * max_drawdown;
  const dailyLossAmt = current_balance * daily_loss_limit;
  const isViolated = drawdown >= max_drawdown * 100;
  return {
    totalPnl,
    totalPnlPct,
    drawdown,
    profitProgress,
    profitTargetAmt,
    maxDrawdownAmt,
    dailyLossAmt,
    isViolated,
  };
}

// ─── DEPOSITS ─────────────────────────────────────────────────────────────────

import type { Deposit } from "@/types/database";

export async function submitDeposit(payload: {
  user_id: string;
  account_size: string;
  fee: string;
  coin: Deposit["coin"];
  tx_hash: string;
  amount_claimed: number;
}): Promise<Deposit> {
  const { data, error } = await supabase
    .from("deposits")
    .insert({ ...payload, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserDeposits(userId: string): Promise<Deposit[]> {
  const { data, error } = await supabase
    .from("deposits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function hasPendingDeposit(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("deposits")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "pending")
    .limit(1);
  return (data ?? []).length > 0;
}
