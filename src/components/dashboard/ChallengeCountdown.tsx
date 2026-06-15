"use client";

import { useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Challenge } from "@/types/database";

interface ChallengeCountdownProps {
  challenge: Challenge;
}

const PHASE_DAYS: Record<number, number> = {
  1: 30,
  2: 60,
  3: 0, // funded — no deadline
};

function CircleProgress({ pct, color }: { pct: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - Math.min(pct, 1));

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      {/* Track */}
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
      {/* Progress */}
      <circle
        cx="48" cy="48" r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        className="transition-all duration-700"
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
    </svg>
  );
}

export default function ChallengeCountdown({ challenge }: ChallengeCountdownProps) {
  const { daysElapsed, daysTotal, daysRemaining, urgency, label } = useMemo(() => {
    const totalDays = PHASE_DAYS[challenge.phase] ?? 30;
    const start = new Date(challenge.created_at);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, totalDays - elapsed);
    const pct = totalDays > 0 ? elapsed / totalDays : 1;

    let urgency: "safe" | "warning" | "danger" = "safe";
    if (pct >= 0.85) urgency = "danger";
    else if (pct >= 0.65) urgency = "warning";

    const label =
      challenge.phase === 3
        ? "Funded — no deadline"
        : remaining === 0
        ? "Deadline reached"
        : `${remaining} day${remaining !== 1 ? "s" : ""} left`;

    return { daysElapsed: elapsed, daysTotal: totalDays, daysRemaining: remaining, urgency, label };
  }, [challenge]);

  const isFunded = challenge.phase === 3 && challenge.status === "funded";

  const colorMap = {
    safe: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  };
  const color = isFunded ? "#00f0ff" : colorMap[urgency];

  const bgMap = {
    safe: "border-emerald-500/20 bg-emerald-500/5",
    warning: "border-yellow-500/20 bg-yellow-500/5",
    danger: "border-red-500/20 bg-red-500/10",
  };
  const bgCls = isFunded ? "border-primary/20 bg-primary/5" : bgMap[urgency];

  const pct = daysTotal > 0 ? daysElapsed / daysTotal : 0;

  return (
    <div className={`rounded-xl glass-panel border p-6 ${bgCls} transition-all`}>
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-4 w-4 text-gray-400" />
        <h2 className="text-base font-bold text-white">Challenge Deadline</h2>
        {urgency === "danger" && !isFunded && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase">
            <AlertTriangle className="h-3 w-3" /> Urgent
          </span>
        )}
        {isFunded && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold uppercase">
            <CheckCircle2 className="h-3 w-3" /> Funded
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Circle */}
        <div className="relative shrink-0">
          <CircleProgress pct={pct} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-white leading-none">
              {isFunded ? "∞" : daysRemaining}
            </span>
            {!isFunded && <span className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">days</span>}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{label}</p>
          {!isFunded && daysTotal > 0 && (
            <>
              <p className="text-xs text-gray-500 mt-1">
                Day {Math.min(daysElapsed, daysTotal)} of {daysTotal}
              </p>
              {/* Timeline bar */}
              <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct * 100, 100)}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-600">Start</span>
                <span className="text-[10px] text-gray-600">
                  Phase {challenge.phase} Deadline
                </span>
              </div>
            </>
          )}
          {isFunded && (
            <p className="text-xs text-gray-500 mt-1">Trade your funded account — no time pressure.</p>
          )}
        </div>
      </div>
    </div>
  );
}
