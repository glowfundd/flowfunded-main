"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { EquitySnapshot } from "@/types/database";
import { TrendingUp, Link2 } from "lucide-react";

interface PerformanceChartProps {
  snapshots: EquitySnapshot[];
  startingBalance: number;
}

type Range = "7D" | "14D" | "30D" | "ALL";

const CustomTooltip = ({
  active,
  payload,
  label,
  startingBalance,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  startingBalance: number;
}) => {
  if (!active || !payload?.length) return null;
  const balance = payload[0]?.value ?? 0;
  const pnl = balance - startingBalance;
  const pnlPct = ((pnl / startingBalance) * 100).toFixed(2);
  const isPos = pnl >= 0;
  return (
    <div className="rounded-xl glass-panel px-4 py-3 border border-white/10 shadow-xl text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-base">${balance.toLocaleString()}</p>
      <p className={`text-xs font-semibold mt-0.5 ${isPos ? "text-emerald-400" : "text-red-400"}`}>
        {isPos ? "+" : ""}${pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({isPos ? "+" : ""}{pnlPct}%)
      </p>
    </div>
  );
};

export default function PerformanceChart({ snapshots, startingBalance }: PerformanceChartProps) {
  const [range, setRange] = useState<Range>("30D");

  const rangeDays: Record<Range, number> = { "7D": 7, "14D": 14, "30D": 30, ALL: 999 };
  const hasData = snapshots.length > 0;

  const filtered = snapshots.slice(-rangeDays[range]);

  const chartData = filtered.map((s) => ({
    date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    balance: s.balance,
    equity: s.equity,
  }));

  const lastBalance = chartData[chartData.length - 1]?.balance ?? startingBalance;
  const pnl = lastBalance - startingBalance;
  const pnlPct = ((pnl / startingBalance) * 100).toFixed(2);
  const isPositive = pnl >= 0;

  // Summary stats from all snapshots
  const dailyPnls = snapshots.map((s) => s.daily_pnl);
  const bestDay = dailyPnls.length > 0 ? Math.max(...dailyPnls) : 0;
  const worstDay = dailyPnls.length > 0 ? Math.min(...dailyPnls) : 0;

  const minVal = hasData
    ? Math.min(...chartData.map((d) => d.balance), startingBalance) * 0.998
    : startingBalance * 0.98;
  const maxVal = hasData
    ? Math.max(...chartData.map((d) => d.balance), startingBalance) * 1.002
    : startingBalance * 1.05;

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Performance</h2>
          {!hasData && (
            <p className="text-xs text-gray-600 mt-0.5">No trading data yet</p>
          )}
        </div>
        {hasData && (
          <div className="flex gap-1.5">
            {(["7D", "14D", "30D", "ALL"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === r
                    ? "bg-primary/15 border border-primary/30 text-primary"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* P&L Summary row */}
      {hasData && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              label: "Total Return",
              value: `${isPositive ? "+" : ""}${pnlPct}%`,
              color: isPositive ? "text-emerald-400" : "text-red-400",
            },
            {
              label: "Best Day",
              value: `+$${bestDay.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              color: "text-emerald-400",
            },
            {
              label: "Worst Day",
              value: `$${worstDay.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              color: "text-red-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart or empty state */}
      {hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minVal, maxVal]}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                content={<CustomTooltip startingBalance={startingBalance} />}
                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              />
              <ReferenceLine
                y={startingBalance}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="4 4"
                label={{ value: "Start", fill: "#6b7280", fontSize: 10, position: "insideTopRight" }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#balanceGrad)"
                dot={false}
                activeDot={{ r: 4, fill: isPositive ? "#10b981" : "#ef4444", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Empty state */
        <div className="h-64 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-4">
            <TrendingUp className="h-6 w-6 text-primary/60" />
          </div>
          <p className="text-sm font-semibold text-gray-400 mb-1">No performance data yet</p>
          <p className="text-xs text-gray-600 max-w-[220px] text-center mb-4">
            Equity snapshots will appear here once you start trading
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
            <Link2 className="h-3.5 w-3.5" />
            Connect your trading account
          </div>
        </div>
      )}
    </div>
  );
}
