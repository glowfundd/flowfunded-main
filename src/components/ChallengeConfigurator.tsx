"use client";

import { useState } from "react";
import { Check, ShieldAlert, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ChallengeOption {
  size: string;
  fee: string;
  profitTarget: string;
  maxLoss: string;
  dailyLoss: string;
  leverage: string;
  split: string;
  popular?: boolean;
}

const challengeData: ChallengeOption[] = [
  { size: "$10,000", fee: "$99", profitTarget: "8% ($800)", maxLoss: "10% ($1,000)", dailyLoss: "5% ($500)", leverage: "1:100", split: "80% (up to 90%)" },
  { size: "$25,000", fee: "$199", profitTarget: "8% ($2,000)", maxLoss: "10% ($2,500)", dailyLoss: "5% ($1,250)", leverage: "1:100", split: "80% (up to 90%)" },
  { size: "$50,000", fee: "$299", profitTarget: "8% ($4,000)", maxLoss: "10% ($5,000)", dailyLoss: "5% ($2,500)", leverage: "1:100", split: "85% (up to 90%)", popular: true },
  { size: "$100,000", fee: "$499", profitTarget: "8% ($8,000)", maxLoss: "10% ($10,000)", dailyLoss: "5% ($5,000)", leverage: "1:100", split: "85% (up to 90%)" },
  { size: "$200,000", fee: "$899", profitTarget: "8% ($16,000)", maxLoss: "10% ($20,000)", dailyLoss: "5% ($10,000)", leverage: "1:100", split: "90% (Max)" },
];

export default function ChallengeConfigurator() {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const router = useRouter();
  const { user } = useAuth();
  const activeChallenge = challengeData[selectedIndex];

  const handleStartChallenge = () => {
    const checkoutUrl = `/checkout?account=${encodeURIComponent(activeChallenge.size)}`;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
    } else {
      router.push(checkoutUrl);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      {/* Selection Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-10">
        {challengeData.map((challenge, idx) => (
          <button
            key={challenge.size}
            onClick={() => setSelectedIndex(idx)}
            className={`relative rounded-full px-5 py-3 text-sm font-semibold tracking-wide cursor-pointer transition-all duration-300 ${
              selectedIndex === idx
                ? "text-black bg-primary shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                : "text-gray-400 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            {challenge.size}
            {challenge.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-secondary text-white border border-secondary/20 shadow-md">
                Popular
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary Cards */}
        <div className="lg:col-span-2 flex flex-col justify-between rounded-2xl glass-panel p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-6">
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-widest">Selected Capital</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{activeChallenge.size} Account</h3>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-widest">Refundable Fee</p>
                <h3 className="text-3xl font-extrabold text-primary text-neon-glow mt-1">{activeChallenge.fee}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-3">
              {[
                { label: "Profit Target", val: activeChallenge.profitTarget },
                { label: "Max Drawdown", val: activeChallenge.maxLoss },
                { label: "Daily Loss Limit", val: activeChallenge.dailyLoss },
                { label: "Profit Split", val: activeChallenge.split, accent: true },
                { label: "Leverage", val: activeChallenge.leverage },
                { label: "Minimum Days", val: "0 Days (No limit)" },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-xs text-gray-500 font-medium">{row.label}</p>
                  <p className={`text-lg font-bold mt-1 ${row.accent ? "text-primary" : "text-white"}`}>{row.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 flex items-center gap-3 text-xs text-gray-500">
            <ShieldAlert className="h-4 w-4 text-secondary flex-shrink-0" />
            <span>Rules are fully scaling-friendly. 100% refundable upon your first payout as a funded trader.</span>
          </div>
        </div>

        {/* Right Side: Features & CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col justify-between relative">
          <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold uppercase py-1 px-2.5 rounded-full border border-primary/20 flex items-center gap-1">
            <Zap className="h-3 w-3" /> Best Value
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">What is included:</h4>
            <p className="text-xs text-gray-400 mb-6">Gain access to the FlowFunded elite simulator and challenge suite.</p>
            <ul className="space-y-4">
              {[
                "Evaluation stage access",
                "Bi-weekly payouts",
                "Scaling up to $2,000,000",
                "Advanced trader dashboard",
                "24/7 Priority Discord Support",
                "Refundable registration fee",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <button
              onClick={handleStartChallenge}
              className="w-full relative inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-black bg-primary rounded-xl hover:bg-primary/95 transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              Start {activeChallenge.size} Challenge
            </button>
            <p className="text-[11px] text-gray-500 text-center mt-3">
              Pay with USDT, BTC, or ETH. Fee is 100% refundable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
