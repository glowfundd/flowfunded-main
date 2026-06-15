"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, DollarSign, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReferralCardProps {
  userId: string;
}

interface ReferralStats {
  count: number;
  earned: number;
}

export default function ReferralCard({ userId }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({ count: 0, earned: 0 });

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${userId.slice(0, 8)}`
      : `https://flowfunded.com/signup?ref=${userId.slice(0, 8)}`;

  useEffect(() => {
    // Gracefully attempt to fetch referral data — fails silently if table doesn't exist
    (async () => {
      try {
        const { data } = await supabase
          .from("referrals")
          .select("id, bonus_amount")
          .eq("referrer_id", userId);
        if (data) {
          setStats({
            count: data.length,
            earned: data.reduce((s: number, r: { bonus_amount?: number }) => s + (r.bonus_amount ?? 0), 0),
          });
        }
      } catch {
        // Table may not exist yet — just show zeros
      }
    })();
  }, [userId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="rounded-xl glass-panel border border-white/5 p-6 hover:border-white/10 transition-all">
      <div className="flex items-center gap-2 mb-5">
        <Users className="h-4 w-4 text-secondary" />
        <h2 className="text-base font-bold text-white">Referral Program</h2>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase">
          Earn 10%
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-3.5 w-3.5 text-secondary" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Referrals</span>
          </div>
          <p className="text-xl font-extrabold text-white">{stats.count}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Earned</span>
          </div>
          <p className="text-xl font-extrabold text-emerald-400">
            ${stats.earned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Link + copy */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden">
          <ExternalLink className="h-3.5 w-3.5 text-gray-600 shrink-0" />
          <span className="text-xs text-gray-400 truncate font-mono">{referralLink}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            copied
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-gray-600 mt-3">
        Earn 10% of every challenge fee paid by your referrals. Paid out in USDT.
      </p>
    </div>
  );
}
