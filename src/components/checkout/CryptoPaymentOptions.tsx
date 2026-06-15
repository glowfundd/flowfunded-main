"use client";

import { useState } from "react";
import { Check, Copy, Wallet } from "lucide-react";

interface PaymentOption {
  id: string;
  label: string;
  network: string;
  address?: string;
}

function isConfigured(address?: string) {
  return Boolean(address && !address.startsWith("YOUR_"));
}

export default function CryptoPaymentOptions({ options }: { options: PaymentOption[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyAddress(option: PaymentOption) {
    if (!isConfigured(option.address)) return;

    await navigator.clipboard.writeText(option.address ?? "");
    setCopiedId(option.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const configured = isConfigured(option.address);
        const copied = copiedId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => copyAddress(option)}
            disabled={!configured}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.network}</p>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-300">
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {configured ? (copied ? "Copied" : "Copy") : "Not configured"}
                  </span>
                </div>

                <p className="mt-3 truncate rounded-lg border border-white/5 bg-black/20 px-3 py-2 font-mono text-xs text-gray-400">
                  {configured ? option.address : "Add this wallet address in .env.local"}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
