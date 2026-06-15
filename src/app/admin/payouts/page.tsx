"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2, RefreshCw, DollarSign, Hash } from "lucide-react";

interface PayoutRow {
  id: string;
  user_id: string;
  amount: number;
  profit_split: number;
  gross_profit: number;
  method: string;
  wallet_address?: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  tx_hash?: string;
  notes?: string;
  user_email?: string;
  user_name?: string;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [txInputs, setTxInputs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "rejected">("pending");

  const load = async () => {
    setLoading(true);
    try {
      const { data: p } = await supabase.from("payouts").select("*").order("requested_at", { ascending: false });
      if (!p) { setPayouts([]); return; }
      const userIds = [...new Set(p.map((x: PayoutRow) => x.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, email, full_name").in("id", userIds);
      const pm: Record<string, { email: string; full_name: string }> = {};
      (profiles ?? []).forEach((pr: { id: string; email: string; full_name: string }) => { pm[pr.id] = pr; });
      setPayouts(p.map((x: PayoutRow) => ({ ...x, user_email: pm[x.user_id]?.email ?? "—", user_name: pm[x.user_id]?.full_name ?? "—" })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionId(id);
    try {
      const updates: Record<string, unknown> = { status: action === "approve" ? "completed" : "rejected", processed_at: new Date().toISOString() };
      if (action === "approve" && txInputs[id]) updates.tx_hash = txInputs[id];
      await supabase.from("payouts").update(updates).eq("id", id);
      setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
    } finally {
      setActionId(null);
    }
  };

  const statusColor = (s: string) => ({
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  }[s] ?? "bg-white/5 text-gray-400 border-white/10");

  const filtered = filter === "all" ? payouts : payouts.filter((p) => p.status === filter);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Payouts</h1>
          <p className="text-sm text-gray-400 mt-0.5">{payouts.filter(p => p.status === "pending").length} pending approval</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-all">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "completed", "rejected", "all"] as const).map((tab) => (
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
          {filtered.map((p) => (
            <div key={p.id} className={`rounded-xl glass-panel border p-5 transition-all ${p.status === "pending" ? "border-yellow-500/20" : "border-white/5"}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-white">{p.user_name} <span className="text-gray-500 font-normal text-sm">· {p.user_email}</span></p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(p.requested_at).toLocaleString()}</span>
                    <span>·</span>
                    <span className="capitalize">{p.method?.replace("_", " ")}</span>
                    {p.wallet_address && <span className="font-mono truncate max-w-[160px]">{p.wallet_address}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-white">${p.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">of ${p.gross_profit?.toLocaleString()} gross</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColor(p.status)}`}>{p.status}</span>
                </div>
              </div>

              {/* TX Hash input + Actions (only for pending) */}
              {p.status === "pending" && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Paste transaction hash (optional)"
                      value={txInputs[p.id] ?? ""}
                      onChange={(e) => setTxInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono placeholder:text-gray-600 focus:outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(p.id, "approve")} disabled={actionId === p.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                      {actionId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve & Pay
                    </button>
                    <button onClick={() => handleAction(p.id, "reject")} disabled={actionId === p.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50">
                      {actionId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Completed: show tx hash */}
              {p.status === "completed" && p.tx_hash && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="font-mono">{p.tx_hash}</span>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">No {filter === "all" ? "" : filter} payouts.</div>
          )}
        </div>
      )}
    </div>
  );
}
