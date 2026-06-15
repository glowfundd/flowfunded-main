"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Clock, ShieldCheck, Copy, Check, Loader2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Coin = "USDT_TRC20" | "USDT_ERC20" | "BTC" | "ETH";

interface Props {
  account: string;
  fee: string;
  feeNum: number;
  userId: string;
  wallets: Record<Coin, string>;
}

const COINS: { id: Coin; label: string; network: string; color: string }[] = [
  { id: "USDT_TRC20", label: "USDT", network: "TRC20 (Tron)", color: "text-emerald-400" },
  { id: "USDT_ERC20", label: "USDT", network: "ERC20 (Ethereum)", color: "text-blue-400" },
  { id: "BTC", label: "Bitcoin", network: "BTC Network", color: "text-orange-400" },
  { id: "ETH", label: "Ethereum", network: "ETH Network", color: "text-purple-400" },
];

export default function CheckoutClient({ account, fee, feeNum, userId, wallets }: Props) {
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState<Coin>("USDT_TRC20");
  const [txHash, setTxHash] = useState("");
  const [amountClaimed, setAmountClaimed] = useState(feeNum.toString());
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const address = wallets[selectedCoin];

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) { setError("Please enter your transaction hash."); return; }
    setError("");
    setSubmitting(true);
    try {
      const { error: dbErr } = await supabase.from("deposits").insert({
        user_id: userId,
        account_size: account,
        fee,
        coin: selectedCoin,
        tx_hash: txHash.trim(),
        amount_claimed: parseFloat(amountClaimed) || feeNum,
        status: "pending",
      });
      if (dbErr) throw dbErr;
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard?payment=pending"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Payment Submitted!</h2>
          <p className="text-gray-400 text-sm">Your transaction is under review. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to challenges
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left — Info */}
          <section className="rounded-xl glass-panel border border-white/5 p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Crypto Checkout</p>
              <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Start your {account} challenge
              </h1>
              <p className="mt-4 text-sm leading-6 text-gray-400">
                Send the refundable registration fee to the wallet address below. Then paste your transaction hash and we&apos;ll activate your account after verification.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {[
                { icon: ShieldCheck, title: "Manual Review", desc: "We verify every payment on-chain before activation." },
                { icon: Clock, title: "Fast Activation", desc: "Accounts activated within a few hours of confirmation." },
                { icon: BadgeCheck, title: "Refundable Fee", desc: "Fee is refunded on your first successful payout." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <item.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Coin Selection */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">1. Select payment method</p>
              <div className="grid grid-cols-2 gap-2">
                {COINS.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      selectedCoin === coin.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <p className={`text-sm font-bold ${selectedCoin === coin.id ? "text-primary" : "text-white"}`}>{coin.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{coin.network}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">2. Send exactly <span className="text-primary">{fee}</span> to this address</p>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs text-gray-300 break-all flex-1">{address}</p>
                  <button
                    onClick={copyAddress}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:border-white/20 transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-yellow-400/80 mt-2">⚠ Only send {selectedCoin.startsWith("USDT") ? "USDT" : selectedCoin} on the {COINS.find(c => c.id === selectedCoin)?.network} network. Wrong-network sends may be unrecoverable.</p>
            </div>

            {/* TX Hash Submission */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm font-semibold text-gray-300">3. Submit your transaction hash</p>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Transaction Hash / TXID</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste your transaction hash here..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 font-mono text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Amount Sent (USD equivalent)</label>
                <input
                  type="number"
                  value={amountClaimed}
                  onChange={(e) => setAmountClaimed(e.target.value)}
                  step="0.01"
                  min="1"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !txHash.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-black bg-primary rounded-xl hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
              >
                {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="h-5 w-5" /> Submit Payment</>}
              </button>
            </form>
          </section>

          {/* Right — Order Summary */}
          <aside className="rounded-xl glass-panel border border-white/5 p-6 sm:p-8 h-fit lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Order Summary</p>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <p className="text-sm text-gray-400">Challenge account</p>
                <p className="mt-1 text-2xl font-extrabold text-white">{account}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Amount due</p>
                <p className="mt-1 text-2xl font-extrabold text-primary text-neon-glow">{fee}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "Profit Target", val: "8%" },
                { label: "Max Drawdown", val: "10%" },
                { label: "Daily Loss Limit", val: "5%" },
                { label: "Leverage", val: "1:100" },
                { label: "Profit Split", val: "Up to 90%" },
                { label: "Time Limit", val: "None" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="text-white font-medium">{row.val}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-gray-400 leading-5">
              <span className="text-primary font-semibold">Fee is 100% refundable</span> — it will be returned to you on your first successful profit split as a funded trader.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
