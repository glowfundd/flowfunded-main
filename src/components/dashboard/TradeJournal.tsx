"use client";

import { TrendingUp, TrendingDown, BookOpen, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Trade } from "@/types/database";

interface TradeJournalProps {
  trades: Trade[];
  loading?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TradeJournal({ trades, loading }: TradeJournalProps) {
  // Summary stats
  const closed = trades.filter((t) => t.status === "closed");
  const winners = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losers = closed.filter((t) => (t.pnl ?? 0) < 0);
  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate = closed.length > 0 ? (winners.length / closed.length) * 100 : 0;
  const avgWin =
    winners.length > 0
      ? winners.reduce((s, t) => s + (t.pnl ?? 0), 0) / winners.length
      : 0;
  const avgLoss =
    losers.length > 0
      ? losers.reduce((s, t) => s + (t.pnl ?? 0), 0) / losers.length
      : 0;

  return (
    <div className="rounded-xl glass-panel border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Trade Journal</h2>
          {closed.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[10px] font-semibold">
              {closed.length} trades
            </span>
          )}
        </div>
        {closed.length > 0 && (
          <span
            className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {/* Summary strip */}
      {closed.length > 0 && (
        <div className="grid grid-cols-4 border-b border-white/5">
          {[
            { label: "Win Rate", value: `${winRate.toFixed(1)}%`, color: "text-emerald-400" },
            { label: "Avg Win", value: `+$${avgWin.toFixed(2)}`, color: "text-emerald-400" },
            { label: "Avg Loss", value: `$${avgLoss.toFixed(2)}`, color: "text-red-400" },
            {
              label: "Profit Factor",
              value:
                Math.abs(avgLoss) > 0
                  ? (avgWin / Math.abs(avgLoss)).toFixed(2)
                  : "∞",
              color: "text-white",
            },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center border-r border-white/5 last:border-r-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Symbol", "Side", "Entry", "Exit", "Lots", "P&L", "Closed"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                </td>
              </tr>
            ) : closed.length > 0 ? (
              closed.map((trade) => {
                const isPositive = (trade.pnl ?? 0) >= 0;
                return (
                  <tr
                    key={trade.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-white text-sm">{trade.symbol}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          trade.direction === "buy"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {trade.direction === "buy" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {trade.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">
                      {trade.entry_price}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">
                      {trade.exit_price ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">{trade.lot_size}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-sm font-bold ${
                          isPositive ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}$
                        {(trade.pnl ?? 0).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {trade.closed_at ? formatDate(trade.closed_at) : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <TrendingUp className="h-9 w-9 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No closed trades yet</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Your trade history will appear here once you close your first position
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
