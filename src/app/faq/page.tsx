"use client";

import { useState } from "react";
import { Search, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General
  {
    category: "General",
    question: "What is FlowFunded?",
    answer: "FlowFunded is a premier proprietary trading firm evaluation platform. We identify talented traders and provide them with simulated credentials, analytics, and scaling opportunities up to $2,000,000 in simulated capital. Consistent traders are rewarded with profit splits of up to 90% of virtual gains.",
  },
  {
    category: "General",
    question: "What assets can I trade?",
    answer: "You can trade over 100+ simulated instruments including major and minor Forex pairs, Crypto (BTC, ETH, etc.), Indices (US30, NAS100, DAX, etc.), and Commodities (Gold, Silver, Oil).",
  },
  {
    category: "General",
    question: "What trading platforms do you support?",
    answer: "We support industry-leading trading platforms including MetaTrader 4 (MT4), MetaTrader 5 (MT5), DXTrade, and cTrader. Credentials are sent immediately after purchase.",
  },
  {
    category: "General",
    question: "What leverage is provided?",
    answer: "We offer up to 1:100 leverage for Forex, 1:50 for Gold and Commodities, 1:20 for Indices, and 1:2 for Cryptocurrencies. Leverage remains static across all evaluation stages.",
  },
  {
    category: "General",
    question: "What is the minimum age requirement?",
    answer: "You must be at least 18 years old and possess valid government-issued identification to sign up for FlowFunded challenges and pass KYC checks.",
  },

  // Evaluation
  {
    category: "Evaluation",
    question: "How does the evaluation process work?",
    answer: "Our evaluation program consists of a 2-Stage challenge. Stage 1 (Evaluation) requires reaching an 8% profit target with strict adherence to daily (5%) and total (10%) drawdown rules. Stage 2 (Verification) requires reaching a 5% profit target under the same drawdown rules. After passing both, you become a funded trader.",
  },
  {
    category: "Evaluation",
    question: "Is there a time limit to pass the challenge?",
    answer: "No! There are absolutely no maximum or minimum trading day requirements. You can take as long as you need to pass, or finish in a single day if you hit the target and manage risk properly.",
  },
  {
    category: "Evaluation",
    question: "Can I run multiple challenges simultaneously?",
    answer: "Yes, you can purchase and trade multiple challenges at the same time. However, the maximum aggregate capital size allowed per trader is capped at $400,000. Under our scaling program, a single account can grow up to $2,000,000.",
  },
  {
    category: "Evaluation",
    question: "What happens after I pass Stage 2?",
    answer: "Once Stage 2 is verified, your dashboard will display a certificate of success. You will then complete a quick identity check (KYC) and sign the simulated trading agreement. Your Funded credentials will be delivered within 24-48 hours.",
  },

  // Rules & Risk
  {
    category: "Rules & Risk",
    question: "What are the daily and maximum loss limits?",
    answer: "The daily loss limit is 5% of the account's starting balance or equity (whichever is higher at midnight UTC). The maximum overall loss limit is 10% of the initial account balance. Exceeding these limits immediately terminates the challenge credentials.",
  },
  {
    category: "Rules & Risk",
    question: "How is the daily drawdown calculated?",
    answer: "Daily drawdown resets at 00:00 UTC. It is calculated as: midnight_balance_or_equity - (midnight_balance_or_equity * 0.05). If your equity falls below this daily limit at any time during the day, a violation occurs.",
  },
  {
    category: "Rules & Risk",
    question: "What happens if I violate a rule?",
    answer: "If you exceed a drawdown limit, your current challenge account is closed. However, we offer discount reset fees on your dashboard if you want to retry the challenge.",
  },
  {
    category: "Rules & Risk",
    question: "Are EAs (Expert Advisors) permitted?",
    answer: "Yes, you are permitted to use automated expert advisors, copy-traders, and indicators. The EA must be configured to manage risk according to our drawdown rules. Latency arbitrage and tick-scalping bots are prohibited.",
  },
  {
    category: "Rules & Risk",
    question: "Do you allow news trading?",
    answer: "Yes. News trading is fully allowed during both evaluation stages and on funded accounts. We do not restrict your trading during major economic releases.",
  },
  {
    category: "Rules & Risk",
    question: "Can I hold positions over the weekend?",
    answer: "Yes, you can hold positions over the weekend without penalty. Weekend market gaps can affect drawdown, so make sure to manage your risk accordingly.",
  },

  // Payments & Payouts
  {
    category: "Payments",
    question: "Is the registration fee refundable?",
    answer: "Yes! The initial registration fee is 100% refundable. It will be added to your first profit split payout once you pass the evaluation stages and qualify as a funded trader.",
  },
  {
    category: "Payments",
    question: "What is the profit split ratio?",
    answer: "Traders start with an 80% profit split (you keep 80% of virtual gains). If you qualify for our scaling plan, your split increases to 90%.",
  },
  {
    category: "Payments",
    question: "How often can I request a payout?",
    answer: "Payouts can be requested bi-weekly (every 14 days) from the date of your first executed trade on the Funded account. Payout requests are audited and processed within 8 hours.",
  },
  {
    category: "Payments",
    question: "What payment methods are supported?",
    answer: "We support Stripe (Visa, Mastercard, Apple Pay, Google Pay) and Paystack. Payouts are sent via Bank Wire Transfer or cryptocurrency (USDT, BTC, ETH).",
  },
  {
    category: "Payments",
    question: "Do I need to perform KYC verification?",
    answer: "Yes. KYC verification is mandatory before starting simulated trading on a funded account. It involves submitting a government ID and proof of address.",
  },

  // Scaling & Other
  {
    category: "Scaling",
    question: "How does the scaling plan work?",
    answer: "To scale your account, you must achieve a total return of 10% (or more) within a 4-month period, with at least 2 successful payouts. We will increase your account balance by 25% up to a maximum of $2,000,000.",
  },
  {
    category: "Scaling",
    question: "What is the consistency rule?",
    answer: "We require traders to follow standard, consistent trade sizing and risk. Opening disproportionately large lots (gambling) to pass the challenge quickly is subject to verification audit.",
  },
  {
    category: "Scaling",
    question: "Can I get a discount for resetting an account?",
    answer: "Yes. If you fail an evaluation stage, you can purchase a reset for the same account size directly from your dashboard with a 15% discount.",
  },
  {
    category: "Scaling",
    question: "Are taxes handled by FlowFunded?",
    answer: "No. As an independent contractor, you are responsible for paying any taxes on your profit splits in accordance with your local tax laws. We issue tax statements upon request.",
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categories = ["All", "General", "Evaluation", "Rules & Risk", "Payments", "Scaling"];

  // Filter FAQ items
  const filteredFAQs = faqData.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="relative min-h-screen bg-background pt-16 pb-24">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 mt-4">
            Everything you need to know about our challenges, rules, payout systems, and scaling plan.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search FAQs (e.g. drawdown, payout, EA)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setExpandedIndex(null);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-black"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-base font-bold text-white flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      {faq.question}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-primary transition-transform duration-300 rotate-180" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/5 text-sm leading-relaxed text-gray-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-500">No results found for &ldquo;{searchTerm}&rdquo;.</p>
          </div>
        )}
      </div>
    </div>
  );
}
