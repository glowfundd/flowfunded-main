"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Edit2, Save, X, Loader2, RefreshCw, ChevronDown } from "lucide-react";

interface ChallengeRow {
  id: string;
  user_id: string;
  account_size: number;
  phase: number;
  status: string;
  current_balance: number;
  starting_balance: number;
  peak_balance: number;
  admin_note?: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const STATUS_OPTIONS = ["active", "passed", "failed", "funded"];

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ChallengeRow>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: ch } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ch) { setChallenges([]); return; }

      // Get profiles for emails
      const userIds = [...new Set(ch.map((c: ChallengeRow) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      const profileMap: Record<string, { email: string; full_name: string }> = {};
      (profiles ?? []).forEach((p: { id: string; email: string; full_name: string }) => { profileMap[p.id] = p; });

      setChallenges(ch.map((c: ChallengeRow) => ({
        ...c,
        user_email: profileMap[c.user_id]?.email ?? "—",
        user_name: profileMap[c.user_id]?.full_name ?? "—",
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (c: ChallengeRow) => {
    setEditingId(c.id);
    setEditData({ phase: c.phase, status: c.status, current_balance: c.current_balance, admin_note: c.admin_note ?? "" });
  };

  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await supabase.from("challenges").update(editData).eq("id", id);
      setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, ...editData } : c));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s: string) => ({
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    passed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    funded: "bg-primary/10 text-primary border-primary/20",
  }[s] ?? "bg-white/5 text-gray-400 border-white/10");

  const filtered = challenges.filter(
    (c) =>
      c.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      c.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Challenges</h1>
          <p className="text-sm text-gray-400 mt-0.5">{challenges.length} total challenges</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-all">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by trader name, email, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const isEditing = editingId === c.id;
            const pnl = c.current_balance - c.starting_balance;
            const pnlPct = c.starting_balance > 0 ? ((pnl / c.starting_balance) * 100).toFixed(2) : "0";

            return (
              <div key={c.id} className={`rounded-xl glass-panel border p-5 transition-all ${isEditing ? "border-primary/40" : "border-white/5 hover:border-white/10"}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-white">{c.user_name} <span className="text-gray-500 font-normal text-sm">· {c.user_email}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">${c.account_size.toLocaleString()} Account · Created {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button onClick={() => startEdit(c)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition-all">
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    ) : (
                      <>
                        <button onClick={() => saveEdit(c.id)} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-all disabled:opacity-50">
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                        </button>
                        <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition-all">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Phase</p>
                    {isEditing ? (
                      <select value={editData.phase} onChange={(e) => setEditData({ ...editData, phase: Number(e.target.value) as 1|2|3 })}
                        className="bg-transparent text-white text-sm font-bold w-full focus:outline-none">
                        {[1,2,3].map(n => <option key={n} value={n} className="bg-background">Phase {n}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-white">Phase {c.phase}</p>
                    )}
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Status</p>
                    {isEditing ? (
                      <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="bg-transparent text-white text-sm font-bold w-full focus:outline-none capitalize">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-background capitalize">{s}</option>)}
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor(c.status)}`}>{c.status}</span>
                    )}
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Balance</p>
                    {isEditing ? (
                      <input type="number" value={editData.current_balance} onChange={(e) => setEditData({ ...editData, current_balance: Number(e.target.value) })}
                        className="bg-transparent text-white text-sm font-bold w-full focus:outline-none" />
                    ) : (
                      <p className="text-sm font-bold text-white">${c.current_balance.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">P&L</p>
                    <p className={`text-sm font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toLocaleString()} ({pnlPct}%)
                    </p>
                  </div>
                </div>

                {/* Admin note */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1.5">Admin Note</p>
                  {isEditing ? (
                    <textarea
                      value={editData.admin_note ?? ""}
                      onChange={(e) => setEditData({ ...editData, admin_note: e.target.value })}
                      rows={2}
                      placeholder="Add a note about this change..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/40 resize-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">{c.admin_note || <span className="text-gray-600 italic">No notes</span>}</p>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">No challenges found.</div>
          )}
        </div>
      )}
    </div>
  );
}
