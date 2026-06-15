import { DollarSign, CheckCircle2, TrendingUp } from "lucide-react";

interface PayoutEvent {
  id: string;
  name: string;
  amount: string;
  method: string;
  country: string;
  flag: string;
  timeAgo: string;
}

const recentPayouts: PayoutEvent[] = [
  { id: "1", name: "David K.", amount: "$8,450", method: "Crypto (USDT)", country: "United States", flag: "🇺🇸", timeAgo: "4 mins ago" },
  { id: "2", name: "Hiroshi T.", amount: "$14,120", method: "Crypto (BTC)", country: "Japan", flag: "🇯🇵", timeAgo: "12 mins ago" },
  { id: "3", name: "Amélie L.", amount: "$5,890", method: "Bank Transfer", country: "France", flag: "🇫🇷", timeAgo: "18 mins ago" },
  { id: "4", name: "Stefan M.", amount: "$22,600", method: "Bank Transfer", country: "Germany", flag: "🇩🇪", timeAgo: "25 mins ago" },
  { id: "5", name: "Alex B.", amount: "$3,410", method: "Crypto (USDT)", country: "United Kingdom", flag: "🇬🇧", timeAgo: "34 mins ago" },
  { id: "6", name: "Carlos R.", amount: "$7,980", method: "Bank Transfer", country: "Spain", flag: "🇪🇸", timeAgo: "41 mins ago" },
  { id: "7", name: "Suresh P.", amount: "$11,250", method: "Crypto (ETH)", country: "India", flag: "🇮🇳", timeAgo: "52 mins ago" },
  { id: "8", name: "Jin-Woo S.", amount: "$9,340", method: "Crypto (USDT)", country: "South Korea", flag: "🇰🇷", timeAgo: "1 hour ago" },
];

export default function LivePayoutFeed() {
  // Duplicate array to make seamless scroll loop
  const displayPayouts = [...recentPayouts, ...recentPayouts];

  return (
    <div className="w-full bg-black/40 border-y border-white/5 py-4 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div className="flex w-max">
        <div className="animate-marquee gap-6 flex items-center pr-6">
          {displayPayouts.map((payout, idx) => (
            <div
              key={`${payout.id}-${idx}`}
              className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-5 py-2 hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">{payout.name}</span>
                  <span className="text-gray-500">{payout.flag} {payout.country}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-gray-400">
                  <span className="text-primary font-bold">{payout.amount}</span>
                  <span>•</span>
                  <span>via {payout.method}</span>
                  <span>•</span>
                  <span className="text-[10px] text-gray-500">{payout.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
