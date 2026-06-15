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

interface PerformanceChartProps {
  snapshots: EquitySnapshot[];
  startingBalance: number;
}

type Range = "7D" | "14D" | "30D" | "ALL";

function generateDemoData(startingBalance: number, days: number): EquitySnapshot[] {
  const data: EquitySnapshot[] = [];
  let balance = startingBalance;
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dailyPnl = (Math.random() - 0.38) * startingBalance * 0.006;
    balance = Math.max(balance + dailyPnl, startingBalance * 0.92);
    data.push({
      id: String(i),
      challenge_id: "demo",
      user_id: "demo",
      date: d.toISOString().split("T")[0],
      balance: Math.round(balance * 100) / 100,
      equity: Math.round((balance + (Math.random() - 0.5) * 200) * 100) / 100,
      daily_pnl: Math.round(dailyPnl * 100) / 100,
      created_at: d.toISOString(),
    });
  }
  return data;
}

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

  const rawData =
    snapshots.length > 0 ? snapshots : generateDemoData(startingBalance, 30);

  const filtered = rawData.slice(-rangeDays[range]);

  const chartData = filtered.map((s) => ({
    date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    balance: s.balance,
    equity: s.equity,
  }));

  const lastBalance = chartData[chartData.length - 1]?.balance ?? startingBalance;
  const pnl = lastBalance - startingBalance;
  const isPositive = pnl >= 0;
  const minVal = Math.min(...chartData.map((d) => d.balance), startingBalance) * 0.998;
  const maxVal = Math.max(...chartData.map((d) => d.balance), startingBalance) * 1.002;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Performance</h2>
          {snapshots.length === 0 && (
            <p className="text-xs text-gray-600 mt-0.5">Demo data — connect your trading account</p>
          )}
        </div>
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
      </div>

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
    </div>
  );
}
