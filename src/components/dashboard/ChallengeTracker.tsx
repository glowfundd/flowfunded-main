"use client";

import { CheckCircle2, XCircle, AlertTriangle, Target, TrendingDown, Shield, ChevronRight } from "lucide-react";
import type { Challenge } from "@/types/database";
import { calcChallengeMetrics } from "@/lib/db";

interface ChallengeTrackerProps {
  challenge: Challenge;
  todayPnl?: number;
}

function ProgressBar({
  value,
  max,
  color,
  danger,
}: {
  value: number;
  max: number;
  color: string;
  danger?: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const isDanger = danger && pct >= 80;
  return (
    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isDanger ? "bg-red-500" : color
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function RuleRow({
  icon: Icon,
  label,
  current,
  limit,
  limitLabel,
  color,
  danger,
  violated,
}: {
  icon: React.ElementType;
  label: string;
  current: number;
  limit: number;
  limitLabel: string;
  color: string;
  danger?: boolean;
  violated?: boolean;
}) {
  const pct = Math.min((current / limit) * 100, 100);
  const isDanger = danger && pct >= 80;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      violated
        ? "bg-red-500/10 border-red-500/30"
        : isDanger
        ? "bg-yellow-500/5 border-yellow-500/20"
        : "bg-white/[0.02] border-white/5"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${violated ? "bg-red-500/20" : isDanger ? "bg-yellow-500/10" : "bg-white/5"}`}>
            <Icon className={`h-3.5 w-3.5 ${violated ? "text-red-400" : isDanger ? "text-yellow-400" : "text-gray-400"}`} />
          </div>
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {violated && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase">
              Violated
            </span>
          )}
          {isDanger && !violated && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase">
              Warning
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${violated ? "text-red-400" : isDanger ? "text-yellow-400" : "text-white"}`}>
            ${current.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-gray-500 ml-1">/ {limitLabel}</span>
        </div>
      </div>
      <ProgressBar value={current} max={limit} color={color} danger={danger} />
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-600">{pct.toFixed(1)}% used</span>
        <span className="text-[10px] text-gray-600">Limit: {limitLabel}</span>
      </div>
    </div>
  );
}

export default function ChallengeTracker({ challenge, todayPnl = 0 }: ChallengeTrackerProps) {
  const {
    totalPnl,
    totalPnlPct,
    drawdown,
    profitProgress,
    profitTargetAmt,
    maxDrawdownAmt,
    dailyLossAmt,
    isViolated,
  } = calcChallengeMetrics(challenge);

  const phase2ProfitTarget = challenge.starting_balance * 0.05;
  const isPhase1Passed = totalPnl >= profitTargetAmt && !isViolated;
  const isPhase2Passed = challenge.phase === 2 && totalPnl >= phase2ProfitTarget && !isViolated;

  const todayLoss = Math.abs(Math.min(todayPnl, 0));
  const drawdownAmt = challenge.peak_balance - challenge.current_balance;

  const phases = [
    {
      num: 1,
      label: "Evaluation",
      target: `${(challenge.profit_target * 100).toFixed(0)}% profit`,
      passed: isPhase1Passed || challenge.phase > 1,
      active: challenge.phase === 1,
    },
    {
      num: 2,
      label: "Verification",
      target: "5% profit",
      passed: isPhase2Passed || challenge.phase > 2,
      active: challenge.phase === 2,
    },
    {
      num: 3,
      label: "Funded",
      target: "Trade & earn",
      passed: challenge.phase === 3 && challenge.status === "funded",
      active: challenge.phase === 3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Phase Progress */}
      <div className="rounded-xl glass-panel border border-white/5 p-6">
        <h2 className="text-lg font-bold text-white mb-5">Challenge Progress</h2>

        <div className="flex items-center gap-2 mb-6">
          {phases.map((phase, idx) => (
            <div key={phase.num} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                phase.passed
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : phase.active
                  ? "border-primary/30 bg-primary/5"
                  : "border-white/5 bg-white/[0.02]"
              }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                  phase.passed
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : phase.active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-gray-600"
                }`}>
                  {phase.passed ? <CheckCircle2 className="h-4 w-4" /> : phase.num}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${phase.active ? "text-white" : phase.passed ? "text-emerald-400" : "text-gray-600"}`}>
                    {phase.label}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{phase.target}</p>
                </div>
              </div>
              {idx < phases.length - 1 && (
                <ChevronRight className={`h-4 w-4 flex-shrink-0 ${
                  phases[idx + 1].passed || phases[idx + 1].active ? "text-primary/60" : "text-gray-700"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Profit Target Progress */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-gray-300">
                Phase {challenge.phase} Profit Target
              </span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                / ${profitTargetAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
              style={{ width: `${Math.max(0, profitProgress)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-gray-500">{Math.max(0, profitProgress).toFixed(1)}% complete</span>
            <span className={`text-[10px] font-semibold ${
              totalPnlPct >= 0 ? "text-emerald-400" : "text-red-400"
            }`}>
              {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}% total gain
            </span>
          </div>
        </div>
      </div>

      {/* Rule Monitoring */}
      <div className="rounded-xl glass-panel border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-bold text-white">Rule Monitoring</h2>
          {isViolated && (
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Rule Violation
            </span>
          )}
          {!isViolated && (
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All rules met
            </span>
          )}
        </div>

        <div className="space-y-3">
          <RuleRow
            icon={TrendingDown}
            label="Max Drawdown"
            current={drawdownAmt}
            limit={maxDrawdownAmt}
            limitLabel={`$${maxDrawdownAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${(challenge.max_drawdown * 100).toFixed(0)}%)`}
            color="bg-blue-500"
            danger
            violated={isViolated}
          />
          <RuleRow
            icon={AlertTriangle}
            label="Today's Loss"
            current={todayLoss}
            limit={dailyLossAmt}
            limitLabel={`$${dailyLossAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${(challenge.daily_loss_limit * 100).toFixed(0)}%)`}
            color="bg-orange-500"
            danger
            violated={todayLoss >= dailyLossAmt}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Account Size</p>
            <p className="text-sm font-bold text-white">${(challenge.account_size / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Platform</p>
            <p className="text-sm font-bold text-white">{challenge.platform}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Min Days</p>
            <p className="text-sm font-bold text-white">None</p>
          </div>
        </div>
      </div>
    </div>
  );
}
