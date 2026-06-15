"use client";

import { useState } from "react";
import {
  DollarSign,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Bitcoin,
  Building2,
  Coins,
} from "lucide-react";
import type { Payout, Challenge } from "@/types/database";
import { requestPayout } from "@/lib/db";

// ─── Payout Request Modal ─────────────────────────────────────────────────────

interface PayoutModalProps {
  challenge: Challenge;
  userId: string;
  onClose: () => void;
  onSuccess: (payout: Payout) => void;
}

const methodConfig = {
  crypto_usdt: { label: "USDT (TRC-20)", icon: Coins, placeholder: "TRC-20 wallet address" },
  crypto_btc: { label: "Bitcoin (BTC)", icon: Bitcoin, placeholder: "BTC wallet address" },
  bank_wire: { label: "Bank Wire", icon: Building2, placeholder: "IBAN / Account number" },
} as const;

function PayoutModal({ challenge, userId, onClose, onSuccess }: PayoutModalProps) {
  const [method, setMethod] = useState<Payout["method"]>("crypto_usdt");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profitSplit = challenge.phase >= 3 ? 0.9 : challenge.account_size >= 100000 ? 0.85 : 0.8;
  const grossProfit = Math.max(0, challenge.current_balance - challenge.starting_balance);
  const payoutAmount = grossProfit * profitSplit;

  const handleSubmit = async () => {
    if (!wallet.trim()) {
      setError("Please enter your wallet or account address.");
      return;
    }
    if (grossProfit <= 0) {
      setError("No profit available to withdraw.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payout = await requestPayout({
        user_id: userId,
        challenge_id: challenge.id,
        gross_profit: grossProfit,
        profit_split: profitSplit,
        method,
        wallet_address: wallet.trim(),
      });
      onSuccess(payout);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl glass-panel border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Request Payout</h3>
            <p className="text-xs text-gray-500 mt-0.5">Processed within 8 hours</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Summary */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Gross Profit</span>
            <span className="text-sm font-semibold text-white">${grossProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Your Split ({(profitSplit * 100).toFixed(0)}%)</span>
            <span className="text-sm font-semibold text-primary">×{profitSplit}</span>
          </div>
          <div className="border-t border-white/5 pt-2 mt-2 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">You Receive</span>
            <span className="text-xl font-extrabold text-primary text-neon-glow">
              ${payoutAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Method Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(methodConfig) as Array<[Payout["method"], typeof methodConfig[keyof typeof methodConfig]]>).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    method === key
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {methodConfig[method].placeholder}
          </label>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder={methodConfig[method].placeholder}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-mono"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || grossProfit <= 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-black bg-primary rounded-xl hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)]"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            <><ArrowUpRight className="h-4 w-4" /> Submit Payout Request</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  processing: { icon: Loader2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  completed: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  rejected: { icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
} as const;

// ─── Payout Flow Page Component ───────────────────────────────────────────────

interface PayoutFlowProps {
  payouts: Payout[];
  challenge: Challenge | null;
  userId: string;
  onNewPayout: (p: Payout) => void;
}

export default function PayoutFlow({ payouts, challenge, userId, onNewPayout }: PayoutFlowProps) {
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSuccess = (payout: Payout) => {
    onNewPayout(payout);
    setShowModal(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  const totalPaid = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      {showModal && challenge && (
        <PayoutModal
          challenge={challenge}
          userId={userId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="rounded-xl glass-panel border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Payouts</h2>
            {totalPaid > 0 && (
              <p className="text-xs text-emerald-400 mt-0.5">
                ${totalPaid.toLocaleString()} total earned
              </p>
            )}
          </div>
          {challenge && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition-all"
            >
              <DollarSign className="h-4 w-4" />
              Request
            </button>
          )}
        </div>

        {success && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Payout request submitted — processing within 8 hours.
          </div>
        )}

        {/* History Table */}
        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Date", "Amount", "Method", "Status", "Tx"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const cfg = statusConfig[payout.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={payout.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-300">
                        {new Date(payout.requested_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-emerald-400">
                          +${payout.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400 capitalize">
                        {payout.method.replace("_", " ")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
                          <Icon className={`h-3 w-3 ${payout.status === "processing" ? "animate-spin" : ""}`} />
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 font-mono">
                        {payout.tx_hash ? (
                          <span className="text-primary/60">{payout.tx_hash.slice(0, 10)}…</span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <DollarSign className="h-8 w-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No payouts yet</p>
            <p className="text-gray-600 text-xs mt-1">
              {challenge
                ? "Meet your profit target to request your first payout"
                : "Start a challenge to unlock payouts"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
