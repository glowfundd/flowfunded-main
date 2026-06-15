"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getUserChallenges,
  getActiveChallenge,
  getOpenTrades,
  getEquitySnapshots,
  getUserPayouts,
  getTradeSummary,
  getRecentClosedTrades,
} from "@/lib/db";
import type { Challenge, Trade, EquitySnapshot, Payout } from "@/types/database";
import {
  LogOut, Trophy, Settings, BarChart3, Loader2, TrendingUp,
  Target, Zap, ArrowUpRight, ArrowDownRight,
  Award, AlertCircle, BookOpen, DollarSign, Clock, X, ShieldCheck,
} from "lucide-react";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import ChallengeTracker from "@/components/dashboard/ChallengeTracker";
import OpenPositions from "@/components/dashboard/OpenPositions";
import PayoutFlow from "@/components/dashboard/PayoutFlow";
import ChallengeCountdown from "@/components/dashboard/ChallengeCountdown";
import ReferralCard from "@/components/dashboard/ReferralCard";
import TradeJournal from "@/components/dashboard/TradeJournal";
import CertificateCard from "@/components/dashboard/CertificateCard";
import { Suspense } from "react";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_banned?: boolean;
}

function getInitials(name?: string) {
  if (!name) return "T";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function PendingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 flex items-center gap-4 animate-fade-in-down">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30">
        <Clock className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-yellow-300">Payment Under Review</p>
        <p className="text-xs text-yellow-400/70 mt-0.5">
          Your crypto payment has been submitted. We&apos;ll activate your challenge within a few hours after verifying your transaction on-chain.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1.5 rounded-lg text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function BannedBanner() {
  return (
    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-center gap-4">
      <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-300">Account Suspended</p>
        <p className="text-xs text-red-400/70 mt-0.5">
          Your account has been suspended. Please contact support for assistance.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
  idx,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  idx: number;
}) {
  return (
    <div
      className={`rounded-xl glass-panel p-5 border border-white/5 hover:border-white/15 hover:shadow-[var(--card-glow)] transition-all duration-300 scroll-reveal stagger-${idx + 1}`}
      data-reveal
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`${iconBg} p-2 rounded-lg`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-2xl font-extrabold mt-1 ${valueColor ?? "text-white"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1.5">{sub}</p>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentPending = searchParams.get("payment") === "pending";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPendingBanner, setShowPendingBanner] = useState(paymentPending);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [snapshots, setSnapshots] = useState<EquitySnapshot[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [tradeSummary, setTradeSummary] = useState({ total: 0, winners: 0, totalPnl: 0, winRate: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  const loadDashboardData = useCallback(async (userId: string) => {
    setDataLoading(true);
    try {
      const [activeChallenge, userPayouts] = await Promise.all([
        getActiveChallenge(userId),
        getUserPayouts(userId),
      ]);
      setChallenge(activeChallenge);
      setPayouts(userPayouts);
      if (activeChallenge) {
        const [openTrades, equityData, summary, closed] = await Promise.all([
          getOpenTrades(activeChallenge.id),
          getEquitySnapshots(activeChallenge.id, 30),
          getTradeSummary(activeChallenge.id),
          getRecentClosedTrades(activeChallenge.id, 20),
        ]);
        setTrades(openTrades);
        setSnapshots(equityData);
        setTradeSummary(summary);
        setClosedTrades(closed);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { router.push("/login"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, is_banned, role")
          .eq("id", authUser.id)
          .single();

        if (profile?.role === "admin") { router.push("/admin"); return; }

        setUser({
          id: authUser.id,
          email: authUser.email || "",
          full_name: profile?.full_name || authUser.user_metadata?.full_name || "Trader",
          is_banned: profile?.is_banned ?? false,
        });
        await loadDashboardData(authUser.id);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router, loadDashboardData]);

  useEffect(() => {
    if (!user?.id || showPendingBanner) return;
    supabase
      .from("deposits")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setShowPendingBanner(true);
      });
  }, [user?.id, showPendingBanner]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const balance = challenge?.current_balance ?? 0;
  const startingBalance = challenge?.starting_balance ?? 0;
  const totalPnl = balance - startingBalance;
  const totalPnlPct = startingBalance > 0 ? ((totalPnl / startingBalance) * 100) : 0;
  const isPositive = totalPnl >= 0;

  const statCards = [
    {
      label: "Account Balance",
      value: balance > 0 ? `$${balance.toLocaleString()}` : "—",
      sub: challenge ? `$${startingBalance.toLocaleString()} starting balance` : "No active challenge",
      icon: BarChart3, iconBg: "bg-primary/10", iconColor: "text-primary",
    },
    {
      label: "Active Challenge",
      value: challenge ? "1" : "0",
      sub: challenge ? `Phase ${challenge.phase} · ${challenge.status}` : "Start a challenge",
      icon: Trophy, iconBg: "bg-secondary/10", iconColor: "text-secondary",
    },
    {
      label: "Total P&L",
      value: totalPnl !== 0 ? `${isPositive ? "+" : ""}$${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—",
      sub: totalPnlPct !== 0 ? `${isPositive ? "+" : ""}${totalPnlPct.toFixed(2)}% return` : "No data yet",
      icon: TrendingUp, iconBg: isPositive ? "bg-emerald-500/10" : "bg-red-500/10",
      iconColor: isPositive ? "text-emerald-400" : "text-red-400",
      valueColor: isPositive ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Win Rate",
      value: tradeSummary.total > 0 ? `${tradeSummary.winRate.toFixed(1)}%` : "—",
      sub: tradeSummary.total > 0 ? `${tradeSummary.winners}/${tradeSummary.total} trades won` : "No closed trades",
      icon: Target, iconBg: "bg-blue-500/10", iconColor: "text-blue-400",
    },
  ];

  const quickNav = [
    { label: "Trade", icon: TrendingUp, href: "/dashboard/trade", color: "text-primary border-primary/20 hover:border-primary/50 hover:bg-primary/5" },
    { label: "Withdraw", icon: ArrowUpRight, href: "#payouts", color: "text-orange-400 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5" },
    { label: "Deposit", icon: ArrowDownRight, href: "/checkout", color: "text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5" },
    { label: "Certificate", icon: Award, href: "#certificate", color: "text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/5" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard", color: "text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5" },
    { label: "Rules", icon: ShieldCheck, href: "/rules", color: "text-cyan-400 border-cyan-400/20 hover:border-cyan-400/40 hover:bg-cyan-400/5" },
    { label: "Academy", icon: BookOpen, href: "#", color: "text-purple-400 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5" },
    { label: "Competition", icon: Zap, href: "/leaderboard", color: "text-pink-400 border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/5" },
  ];

  return (
    <div className="relative min-h-screen bg-background pt-24 pb-24">
      {/* Ambient glows */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/6 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 text-lg font-extrabold text-white shadow-lg">
                {getInitials(user?.full_name)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-background" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Welcome back, <span className="text-primary font-semibold">{user?.full_name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-primary/30 transition-all text-sm"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Banners ─────────────────────────────────────────────────────── */}
        {user?.is_banned && <BannedBanner />}
        {showPendingBanner && !user?.is_banned && (
          <PendingBanner onDismiss={() => setShowPendingBanner(false)} />
        )}

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => (
            <StatCard key={stat.label} {...stat} idx={idx} />
          ))}
        </div>

        {/* ── Quick Nav ───────────────────────────────────────────────────── */}
        <div className="mb-8 scroll-reveal" data-reveal>
          <div className="flex flex-wrap gap-2">
            {quickNav.map((item) => {
              const Icon = item.icon;
              const cls = `flex items-center gap-2 px-4 py-2 rounded-full border bg-white/[0.02] text-sm font-semibold transition-all ${item.color}`;
              return (
                <Link key={item.label} href={item.href} className={cls}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── No Challenge CTA ────────────────────────────────────────────── */}
        {!dataLoading && !challenge && !showPendingBanner && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 mb-8 text-center scroll-reveal" data-reveal>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto mb-4">
              <Trophy className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Challenge</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Purchase a challenge to start tracking your performance, risk metrics, and path to funding.
            </p>
            <Link
              href="/#challenges"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-black bg-primary rounded-full hover:bg-primary/95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              <Trophy className="h-4 w-4" /> Start a Challenge
            </Link>
          </div>
        )}

        {/* ── Certificate Card ────────────────────────────────────────────── */}
        {!dataLoading && challenge && (
          <div id="certificate" className="mb-8 scroll-reveal" data-reveal>
            <CertificateCard challenge={challenge} userName={user?.full_name ?? "Trader"} />
          </div>
        )}

        {/* ── Performance Chart + Portfolio ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 scroll-reveal" data-reveal>
          <div className="lg:col-span-2 rounded-xl glass-panel border border-white/5 p-6">
            {dataLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              <PerformanceChart snapshots={snapshots} startingBalance={challenge?.starting_balance ?? 50000} />
            )}
          </div>
          <div className="rounded-xl glass-panel border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-5">Portfolio</h2>
            <div className="space-y-3">
              {[
                { label: "Capital", color: "bg-primary", value: `$${(challenge?.account_size ?? 0).toLocaleString()}` },
                { label: "Balance", color: "bg-secondary", value: balance > 0 ? `$${balance.toLocaleString()}` : "—" },
                {
                  label: "Open P&L",
                  color: "bg-emerald-400",
                  value: trades.length > 0 ? `${trades.reduce((s, t) => s + (t.pnl ?? 0), 0) >= 0 ? "+" : ""}$${trades.reduce((s, t) => s + (t.pnl ?? 0), 0).toFixed(2)}` : "—",
                  colored: true,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                    <span className="text-sm text-gray-300">{row.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${row.colored ? "text-emerald-400" : "text-white"}`}>{row.value}</span>
                </div>
              ))}
            </div>
            {tradeSummary.total > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 uppercase mb-1">Trades</p>
                  <p className="text-lg font-bold text-white">{tradeSummary.total}</p>
                </div>
                <div className="text-center p-3 bg-white/[0.03] rounded-xl">
                  <p className="text-xs text-gray-500 uppercase mb-1">Win Rate</p>
                  <p className="text-lg font-bold text-emerald-400">{tradeSummary.winRate.toFixed(0)}%</p>
                </div>
              </div>
            )}
            {!dataLoading && !challenge && (
              <Link href="/#challenges" className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-all">
                <Trophy className="h-4 w-4" /> Get Started
              </Link>
            )}
          </div>
        </div>

        {/* ── Challenge Tracker ───────────────────────────────────────────── */}
        {!dataLoading && challenge && (
          <div className="mb-8 scroll-reveal" data-reveal>
            <ChallengeTracker challenge={challenge} todayPnl={0} />
          </div>
        )}

        {/* ── Countdown + Referral row ────────────────────────────────────── */}
        {!dataLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 scroll-reveal" data-reveal>
            {challenge && <ChallengeCountdown challenge={challenge} />}
            {user?.id && (
              <ReferralCard userId={user.id} />
            )}
          </div>
        )}

        {/* ── Open Positions ──────────────────────────────────────────────── */}
        <div className="mb-8 scroll-reveal" data-reveal>
          <OpenPositions trades={trades} loading={dataLoading} />
        </div>

        {/* ── Trade Journal ───────────────────────────────────────────────── */}
        <div className="mb-8 scroll-reveal" data-reveal>
          <TradeJournal trades={closedTrades} loading={dataLoading} />
        </div>

        {/* ── Payouts ─────────────────────────────────────────────────────── */}
        <div id="payouts" className="mb-8 scroll-reveal" data-reveal>
          <PayoutFlow
            payouts={payouts}
            challenge={challenge}
            userId={user?.id ?? ""}
            onNewPayout={(p) => setPayouts((prev) => [p, ...prev])}
          />
        </div>

        {/* ── Bottom CTA cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-reveal" data-reveal>
          <Link href="/#challenges" className="group rounded-xl glass-panel border border-white/5 p-6 hover:border-primary/40 transition-all hover:bg-primary/5 hover:shadow-[var(--card-glow)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/50 flex items-center justify-center transition-all">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-white">Buy a Challenge</h3>
            </div>
            <p className="text-sm text-gray-400">Start a new evaluation. Account sizes from $10K to $200K.</p>
          </Link>
          <Link href="/account" className="group rounded-xl glass-panel border border-white/5 p-6 hover:border-secondary/40 transition-all hover:bg-secondary/5 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.1),0_8px_32px_-8px_rgba(99,102,241,0.12)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 border border-secondary/20 group-hover:border-secondary/50 flex items-center justify-center transition-all">
                <Settings className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-base font-bold text-white">Account Settings</h3>
            </div>
            <p className="text-sm text-gray-400">Update your profile, payout wallet, and security settings.</p>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
