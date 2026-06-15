"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2, RefreshCw, ExternalLink, Hash, MessageSquare } from "lucide-react";

interface DepositRow {
  id: string;
  user_id: string;
  account_size: string;
  fee: string;
  coin: string;
  tx_hash: string;
  amount_claimed: number;
  status: string;
  admin_note?: string;
  created_at: string;
  confirmed_at?: string;
  user_email?: string;
  user_name?: string;
}

const COIN_EXPLORER: Record<string, (hash: string) => string> = {
  USDT_TRC20: (h) => `https://tronscan.org/#/transaction/${h}`,
  USDT_ERC20: (h) => `https://etherscan.io/tx/${h}`,
  BTC: (h) => `https://mempool.space/tx/${h}`,
  ETH: (h) => `https://etherscan.io/tx/${h}`,
};

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"pending" | "confirmed" | "rejected" | "all">("pending");

  const load = async () => {
    setLoading(true);
    try {
      const { data: deps } = await supabase.from("deposits").select("*").order("created_at", { ascending: false });
      if (!deps) { setDeposits([]); return; }
      const userIds = [...new Set(deps.map((d: DepositRow) => d.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email, full_name").in("id", userIds);
      const pm: Record<string, { email: string; full_name: string }> = {};
      (profiles ?? []).forEach((p: { id: string; email: string; full_name: string }) => { pm[p.id] = p; });
      setDeposits(deps.map((d: DepositRow) => ({ ...d, user_email: pm[d.user_id]?.email ?? "—", user_name: pm[d.user_id]?.full_name ?? "—" })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (dep: DepositRow, action: "confirm" | "reject") => {
    setActionId(dep.id);
    try {
      const newStatus = action === "confirm" ? "confirmed" : "rejected";
      const adminNote = notes[dep.id] ?? dep.admin_note ?? "";
      await supabase.from("deposits").update({
        status: newStatus,
        admin_note: adminNote,
        confirmed_at: action === "confirm" ? new Date().toISOString() : null,
      }).eq("id", dep.id);

      // Auto-create challenge on confirm
      if (action === "confirm") {
        const sizeNum = parseFloat(dep.account_size.replace(/[$,]/g, ""));
        await supabase.from("challenges").insert({
          user_id: dep.user_id,
          account_size: sizeNum,
          phase: 1,
          status: "active",
          profit_target: 0.08,
          max_drawdown: 0.10,
          daily_loss_limit: 0.05,
          starting_balance: sizeNum,
          current_balance: sizeNum,
          peak_balance: sizeNum,
          platform: "FlowFunded MT5",
        });
      }

      setDeposits((prev) => prev.map((d) => d.id === dep.id ? { ...d, status: newStatus, admin_note: adminNote } : d));
    } finally {
      setActionId(null);
    }
  };

  const coinLabel: Record<string, string> = {
    USDT_TRC20: "USDT TRC20", USDT_ERC20: "USDT ERC20", BTC: "Bitcoin", ETH: "Ethereum",
  };

  const filtered = filter === "all" ? deposits : deposits.filter((d) => d.status === filter);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Deposits</h1>
          <p className="text-sm text-gray-400 mt-0.5">{deposits.filter(d => d.status === "pending").length} pending confirmation</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-all">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "confirmed", "rejected", "all"] as const).map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all border ${filter === tab ? "bg-primary/10 text-primary border-primary/30" : "bg-white/[0.03] text-gray-500 border-white/10 hover:text-gray-300"}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dep) => {
            const explorerUrl = COIN_EXPLORER[dep.coin]?.(dep.tx_hash);
            const statusStyle = {
              pending: "border-yellow-500/30 bg-yellow-500/5",
              confirmed: "border-emerald-500/20",
              rejected: "border-red-500/20",
            }[dep.status] ?? "border-white/5";

            const badgeStyle = {
              pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
              confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              rejected: "bg-red-500/10 text-red-400 border-red-500/20",
            }[dep.status] ?? "bg-white/5 text-gray-400 border-white/10";

            return (
              <div key={dep.id} className={`rounded-xl glass-panel border p-5 transition-all ${statusStyle}`}>
                {/* Top */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-white">{dep.user_name} <span className="text-gray-500 font-normal text-sm">· {dep.user_email}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(dep.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${badgeStyle}`}>{dep.status}</span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Account", val: dep.account_size },
                    { label: "Fee", val: dep.fee },
                    { label: "Coin", val: coinLabel[dep.coin] ?? dep.coin },
                    { label: "Amount Claimed", val: `$${dep.amount_claimed}` },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/[0.03] rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* TX Hash */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                  <Hash className="h-4 w-4 text-gray-500 shrink-0" />
                  <p className="text-xs font-mono text-gray-300 truncate flex-1">{dep.tx_hash}</p>
                  {explorerUrl && (
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                      Verify <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Admin Note + Actions (pending only) */}
                {dep.status === "pending" && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 mt-2.5 shrink-0" />
                      <textarea
                        placeholder="Admin note (optional — reason for rejection etc)"
                        rows={2}
                        value={notes[dep.id] ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [dep.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-primary/40 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(dep, "confirm")} disabled={actionId === dep.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                        {actionId === dep.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Confirm & Activate Challenge
                      </button>
                      <button onClick={() => handleAction(dep, "reject")} disabled={actionId === dep.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50">
                        {actionId === dep.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmed note */}
                {dep.admin_note && dep.status !== "pending" && (
                  <p className="mt-3 text-xs text-gray-500 italic border-t border-white/5 pt-3">Note: {dep.admin_note}</p>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">No {filter === "all" ? "" : filter} deposits.</div>
          )}
        </div>
      )}
    </div>
  );
}
