"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Ban, CheckCircle, Loader2, User, RefreshCw } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  full_name?: string;
  country?: string;
  role: string;
  is_banned: boolean;
  created_at: string;
  challenge_count?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, country, role, is_banned, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get challenge counts per user
      const { data: challenges } = await supabase
        .from("challenges")
        .select("user_id");

      const countMap: Record<string, number> = {};
      (challenges ?? []).forEach((c: { user_id: string }) => {
        countMap[c.user_id] = (countMap[c.user_id] ?? 0) + 1;
      });

      setUsers((data ?? []).map((u: UserRow) => ({ ...u, challenge_count: countMap[u.id] ?? 0 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleBan = async (userId: string, currentBan: boolean) => {
    setActionId(userId);
    try {
      await supabase.from("profiles").update({ is_banned: !currentBan }).eq("id", userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: !currentBan } : u));
    } finally {
      setActionId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} registered traders</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-all">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
      ) : (
        <div className="rounded-xl glass-panel border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Trader</th>
                  <th className="text-left px-5 py-3 font-semibold">Country</th>
                  <th className="text-left px-5 py-3 font-semibold">Challenges</th>
                  <th className="text-left px-5 py-3 font-semibold">Role</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Joined</th>
                  <th className="text-left px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.full_name || "—"}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{u.country || "—"}</td>
                    <td className="px-5 py-4 text-gray-300 font-medium">{u.challenge_count}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === "admin" ? "bg-primary/10 text-primary border border-primary/20" : "bg-white/5 text-gray-400 border border-white/10"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.is_banned ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                        {u.is_banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => toggleBan(u.id, u.is_banned)}
                          disabled={actionId === u.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${u.is_banned ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"} disabled:opacity-50`}
                        >
                          {actionId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : u.is_banned ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                          {u.is_banned ? "Unban" : "Ban"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
