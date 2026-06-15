import { Shield, Sparkles, Scale, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function RulesPage() {
  const rulesList = [
    {
      title: "Profit Target",
      badge: "Stage 1: 8% | Stage 2: 5%",
      desc: "To pass the evaluation stage, you must achieve a simulated profit of 8% on your initial balance. For the verification stage, the target is reduced to 5%. Once funded, there are no profit targets.",
      icon: Sparkles,
      color: "text-primary border-primary/20 bg-primary/5",
    },
    {
      title: "Daily Drawdown Limit",
      badge: "5% Limit",
      desc: "The daily loss limit is set to 5% of the starting equity of the day. The daily limit resets every day at 00:00 UTC. Going below this threshold at any point during the day violates the daily loss rule.",
      icon: Shield,
      color: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
    },
    {
      title: "Max Drawdown Limit",
      badge: "10% Limit",
      desc: "The maximum total drawdown limit is 10% of the initial account balance. Your account equity must never fall below 90% of your starting challenge balance. This is static and does not trail.",
      icon: Scale,
      color: "text-red-400 border-red-400/20 bg-red-400/5",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background pt-16 pb-24">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Trading Rules & Guidelines
          </h1>
          <p className="text-gray-400 mt-4">
            We keep our rules simple, fair, and transparent. Learn how to manage your risk and keep your account in good standing.
          </p>
        </div>

        {/* 3 Core Rules Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {rulesList.map((rule) => (
            <div key={rule.title} className="rounded-2xl glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${rule.color}`}>
                    <rule.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {rule.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{rule.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced trading styles details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Allowed practices */}
          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              Allowed Trading Practices
            </h2>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>Weekend Holding:</strong> You are allowed to hold simulated positions over the weekend. No restriction.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>News Trading:</strong> High-impact news trading is allowed during the evaluation phases and on funded status.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>Expert Advisors (EAs):</strong> Using custom indicators, automated trade managers, and personal EAs is fully permitted.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>No Minimum Days:</strong> Pass as soon as you hit the profit target. There are no minimum trading day limitations.
                </div>
              </li>
            </ul>
          </div>

          {/* Prohibited practices */}
          <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              Prohibited Activities
            </h2>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>Arbitrage Trading:</strong> Using latency arbitrage or trading on artificial price feeds is strictly prohibited.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>Grid / Martingale Abuse:</strong> High-density grid or martingale systems executed without risk management blockages.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>Account Sharing:</strong> Multiple traders accessing the same simulated credentials or copying trades across unrelated users.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <div>
                  <strong>Inactivity Rule:</strong> Accounts that show no trading activity for 30 consecutive days will be deactivated.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Detailed Drawdown Calculation Accordion Style */}
        <div className="rounded-2xl glass-panel p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            How Daily Drawdown is Calculated
          </h2>
          <div className="space-y-4 text-sm text-gray-300">
            <p>
              Daily limit is calculated at <strong>00:00 UTC</strong> using the higher of either your account <strong>Balance</strong> or <strong>Equity</strong> at that exact moment.
            </p>
            <div className="rounded-xl bg-black/40 border border-white/5 p-4 text-xs font-mono text-gray-400">
              Daily Limit = starting_day_balance_or_equity - (starting_day_balance_or_equity * 0.05)
            </div>
            <p>
              For example, if your balance at midnight UTC is $100,000, your equity must not drop below $95,000 at any point during that day. If your equity falls below $95,000, your challenge is failed. Open profit or loss impacts the live equity calculation.
            </p>
          </div>
        </div>

        {/* Start Challenge CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/#challenges"
            className="relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black bg-primary rounded-full hover:bg-primary/95 transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
          >
            Choose a Challenge
          </Link>
        </div>
      </div>
    </div>
  );
}
