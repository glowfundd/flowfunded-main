"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, ShieldCheck, Wallet, CreditCard, TrendingUp, Loader2, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  activeChallenges: number;
  pendingDeposits: number;
  pendingPayouts: number;
  totalRevenue: number;
  challengesPassed: number;
  challengesFailed: number;
  totalChallenges: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          { count: totalUsers },
          { count: activeChallenges },
          { count: pendingDeposits },
          { count: pendingPayouts },
          { count: challengesPassed },
          { count: challengesFailed },
          { count: totalChallenges },
          { data: confirmedDeposits },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("challenges").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("payouts").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("challenges").select("*", { count: "exact", head: true }).eq("status", "passed"),
          supabase.from("challenges").select("*", { count: "exact", head: true }).eq("status", "failed"),
          supabase.from("challenges").select("*", { count: "exact", head: true }),
          supabase.from("deposits").select("amount_claimed").eq("status", "confirmed"),
        ]);

        const totalRevenue = (confirmedDeposits ?? []).reduce((s: number, d: { amount_claimed: number }) => s + (d.amount_claimed || 0), 0);

        setStats({
          totalUsers: totalUsers ?? 0,
          activeChallenges: activeChallenges ?? 0,
          pendingDeposits: pendingDeposits ?? 0,
          pendingPayouts: pendingPayouts ?? 0,
          totalRevenue,
          challengesPassed: challengesPassed ?? 0,
          challengesFailed: challengesFailed ?? 0,
          totalChallenges: totalChallenges ?? 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  const cards = [
    { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, sub: "Confirmed deposits", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Total Traders", value: stats?.totalUsers ?? 0, sub: "Registered accounts", icon: Users, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Active Challenges", value: stats?.activeChallenges ?? 0, sub: `${stats?.totalChallenges ?? 0} total challenges`, icon: ShieldCheck, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Pending Deposits", value: stats?.pendingDeposits ?? 0, sub: "Awaiting confirmation", icon: CreditCard, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", href: "/admin/deposits", urgent: (stats?.pendingDeposits ?? 0) > 0 },
    { label: "Pending Payouts", value: stats?.pendingPayouts ?? 0, sub: "Awaiting approval", icon: Wallet, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", href: "/admin/payouts", urgent: (stats?.pendingPayouts ?? 0) > 0 },
    { label: "Challenges Passed", value: stats?.challengesPassed ?? 0, sub: `${stats?.challengesFailed ?? 0} failed`, icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
  ];

  const passRate = stats && stats.totalChallenges > 0
    ? ((stats.challengesPassed / stats.totalChallenges) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Overview of FlowFunded platform activity</p>
      </div>

      {/* Urgent alerts */}
      {((stats?.pendingDeposits ?? 0) > 0 || (stats?.pendingPayouts ?? 0) > 0) && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-5 py-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-300">
            You have{" "}
            {(stats?.pendingDeposits ?? 0) > 0 && <><Link href="/admin/deposits" className="font-bold underline">{stats?.pendingDeposits} pending deposit{(stats?.pendingDeposits ?? 0) > 1 ? "s" : ""}</Link>{(stats?.pendingPayouts ?? 0) > 0 ? " and " : ""}</>}
            {(stats?.pendingPayouts ?? 0) > 0 && <Link href="/admin/payouts" className="font-bold underline">{stats?.pendingPayouts} pending payout{(stats?.pendingPayouts ?? 0) > 1 ? "s" : ""}</Link>}
            {" "}requiring your attention.
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <div className={`rounded-xl glass-panel border p-5 transition-all ${card.urgent ? "border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.08)]" : "border-white/5 hover:border-white/10"} ${card.href ? "cursor-pointer hover:scale-[1.01]" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bg} border ${card.border} p-2.5 rounded-xl`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {card.urgent && <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">Action needed</span>}
              </div>
              <p className="text-3xl font-extrabold text-white">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
              <p className={`text-sm font-semibold mt-2 ${card.color}`}>{card.label}</p>
            </div>
          );
          return card.href ? <Link key={card.label} href={card.href}>{inner}</Link> : <div key={card.label}>{inner}</div>;
        })}
      </div>

      {/* Challenge pass rate */}
      <div className="rounded-xl glass-panel border border-white/5 p-6">
        <h2 className="text-base font-bold text-white mb-4">Challenge Pass Rates</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${passRate}%` }} />
          </div>
          <span className="text-sm font-bold text-primary w-12 text-right">{passRate}%</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{stats?.challengesPassed} passed</span>
          <span>{stats?.challengesFailed} failed</span>
        </div>
      </div>
    </div>
  );
}
