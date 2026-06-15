"use client";

import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";
import type { Trade } from "@/types/database";

interface OpenPositionsProps {
  trades: Trade[];
  loading?: boolean;
}

export default function OpenPositions({ trades, loading }: OpenPositionsProps) {
  const totalOpenPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const isPnlPositive = totalOpenPnl >= 0;
  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-xl glass-panel border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Open Positions</h2>
        <div className="flex items-center gap-3">
          {trades.length > 0 && (
            <span className={`text-sm font-bold ${isPnlPositive ? "text-emerald-400" : "text-red-400"}`}>
              {isPnlPositive ? "+" : ""}${totalOpenPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} open P&L
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Symbol", "Side", "Entry", "Lots", "P&L", "Status"].map((h) => (
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
                <td colSpan={6} className="px-5 py-10 text-center">
                  <div className="flex justify-center">
                    <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : trades.length > 0 ? (
              <>
                {trades.map((trade) => {
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
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {trade.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">{trade.entry_price}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{trade.lot_size}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                          {isPositive ? "+" : ""}$
                          {(trade.pnl ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Open
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* Footer summary row */}
                <tr className="border-t border-white/5 bg-white/[0.015]">
                  <td colSpan={4} className="px-5 py-3 text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Updated {now}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-bold ${isPnlPositive ? "text-emerald-400" : "text-red-400"}`}>
                      {isPnlPositive ? "+" : ""}${totalOpenPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{trades.length} open</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Activity className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No open positions</p>
                  <p className="text-gray-600 text-xs mt-1">Your active trades will appear here</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
