import { Trophy, TrendingUp, Award, Activity } from "lucide-react";

interface LeaderboardTrader {
  rank: number;
  name: string;
  profit: string;
  gain: string;
  accountSize: string;
  platform: string;
  country: string;
  flag: string;
  daysActive: number;
}

const topTraders: LeaderboardTrader[] = [
  { rank: 1, name: "Alexander K.", profit: "$32,450.80", gain: "+16.22%", accountSize: "$200,000", platform: "MT5", country: "Germany", flag: "🇩🇪", daysActive: 28 },
  { rank: 2, name: "Sophia W.", profit: "$24,190.50", gain: "+12.09%", accountSize: "$200,000", platform: "DXTrade", country: "Canada", flag: "🇨🇦", daysActive: 19 },
  { rank: 3, name: "Yuki T.", profit: "$18,920.00", gain: "+18.92%", accountSize: "$100,000", platform: "MT4", country: "Japan", flag: "🇯🇵", daysActive: 14 },
  { rank: 4, name: "Michael S.", profit: "$15,430.20", gain: "+7.71%", accountSize: "$200,000", platform: "MT5", country: "United States", flag: "🇺🇸", daysActive: 34 },
  { rank: 5, name: "Mateo R.", profit: "$12,890.10", gain: "+12.89%", accountSize: "$100,000", platform: "cTrader", country: "Spain", flag: "🇪🇸", daysActive: 22 },
  { rank: 6, name: "Amara N.", profit: "$11,400.00", gain: "+22.80%", accountSize: "$50,000", platform: "DXTrade", country: "Nigeria", flag: "🇳🇬", daysActive: 12 },
  { rank: 7, name: "Liam O.", profit: "$9,850.40", gain: "+9.85%", accountSize: "$100,000", platform: "MT5", country: "United Kingdom", flag: "🇬🇧", daysActive: 15 },
  { rank: 8, name: "Emma V.", profit: "$8,910.60", gain: "+8.91%", accountSize: "$100,000", platform: "MT5", country: "Netherlands", flag: "🇳🇱", daysActive: 25 },
  { rank: 9, name: "Felipe S.", profit: "$7,650.00", gain: "+15.30%", accountSize: "$50,000", platform: "MT4", country: "Brazil", flag: "🇧🇷", daysActive: 8 },
  { rank: 10, name: "Ji-Hun P.", profit: "$6,820.20", gain: "+6.82%", accountSize: "$100,000", platform: "cTrader", country: "South Korea", flag: "🇰🇷", daysActive: 17 },
];

export default function LeaderboardPage() {
  const podiumTraders = [
    topTraders[1], // 2nd place
    topTraders[0], // 1st place
    topTraders[2], // 3rd place
  ];

  return (
    <div className="relative min-h-screen bg-background pt-16 pb-24">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-4">
            <Trophy className="h-4.5 w-4.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Elite Performers</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Live Trader Leaderboard
          </h1>
          <p className="text-gray-400 mt-4">
            View the top-performing funded partners on our platform. Statistics reset bi-weekly.
          </p>
        </div>

        {/* Podium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto mb-20 px-4">
          {/* Second Place */}
          <div className="order-2 md:order-1 rounded-2xl glass-panel p-6 text-center border border-white/5 relative h-[320px] flex flex-col justify-between">
            <div className="absolute top-4 left-4 text-xs font-bold text-gray-500">#2</div>
            <div className="mt-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-500/10 border-2 border-gray-400 flex items-center justify-center text-xl font-bold text-white relative">
                {podiumTraders[0].name.split(" ")[0][0]}
                {podiumTraders[0].name.split(" ")[1][0]}
              </div>
              <h3 className="text-lg font-bold text-white mt-4">{podiumTraders[0].name}</h3>
              <p className="text-xs text-gray-500 mt-1">{podiumTraders[0].flag} {podiumTraders[0].country}</p>
            </div>
            <div className="mt-4 border-t border-white/5 pt-4">
              <span className="text-xs text-gray-400 block uppercase font-semibold">Simulated Profit</span>
              <span className="text-xl font-extrabold text-white mt-1 block">{podiumTraders[0].profit}</span>
              <span className="text-xs text-primary font-semibold mt-1 block">{podiumTraders[0].gain} Gain</span>
            </div>
          </div>

          {/* First Place */}
          <div className="order-1 md:order-2 rounded-2xl border-2 border-primary bg-primary/[0.03] p-8 text-center relative h-[370px] flex flex-col justify-between shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            <div className="absolute top-4 left-4 text-sm font-extrabold text-primary flex items-center gap-1">
              <Trophy className="h-4.5 w-4.5" /> #1
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold uppercase py-1 px-4 rounded-full border border-background shadow-lg">
              Champion
            </div>
            <div className="mt-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-white relative shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                {podiumTraders[1].name.split(" ")[0][0]}
                {podiumTraders[1].name.split(" ")[1][0]}
              </div>
              <h3 className="text-xl font-extrabold text-white mt-4">{podiumTraders[1].name}</h3>
              <p className="text-xs text-gray-500 mt-1">{podiumTraders[1].flag} {podiumTraders[1].country}</p>
            </div>
            <div className="mt-4 border-t border-white/5 pt-4">
              <span className="text-xs text-gray-400 block uppercase font-semibold">Simulated Profit</span>
              <span className="text-2xl font-extrabold text-primary text-neon-glow mt-1 block">{podiumTraders[1].profit}</span>
              <span className="text-sm text-primary font-semibold mt-1 block">{podiumTraders[1].gain} Gain</span>
            </div>
          </div>

          {/* Third Place */}
          <div className="order-3 rounded-2xl glass-panel p-6 text-center border border-white/5 relative h-[290px] flex flex-col justify-between">
            <div className="absolute top-4 left-4 text-xs font-bold text-amber-600">#3</div>
            <div className="mt-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-amber-600/10 border-2 border-amber-600/50 flex items-center justify-center text-lg font-bold text-white relative">
                {podiumTraders[2].name.split(" ")[0][0]}
                {podiumTraders[2].name.split(" ")[1][0]}
              </div>
              <h3 className="text-base font-bold text-white mt-4">{podiumTraders[2].name}</h3>
              <p className="text-xs text-gray-500 mt-1">{podiumTraders[2].flag} {podiumTraders[2].country}</p>
            </div>
            <div className="mt-4 border-t border-white/5 pt-4">
              <span className="text-xs text-gray-400 block uppercase font-semibold">Simulated Profit</span>
              <span className="text-lg font-extrabold text-white mt-block">{podiumTraders[2].profit}</span>
              <span className="text-xs text-primary font-semibold mt-1 block">{podiumTraders[2].gain} Gain</span>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden max-w-5xl mx-auto">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Rankings Summary
            </h2>
            <span className="text-xs text-gray-500">Updated: Just Now</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                  <th className="py-4 px-6 text-center font-semibold">Rank</th>
                  <th className="py-4 px-6 font-semibold">Trader</th>
                  <th className="py-4 px-6 font-semibold">Simulated Profit</th>
                  <th className="py-4 px-6 font-semibold text-center">Gain %</th>
                  <th className="py-4 px-6 font-semibold">Account Size</th>
                  <th className="py-4 px-6 font-semibold">Platform</th>
                  <th className="py-4 px-6 font-semibold text-center">Days Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {topTraders.map((trader) => (
                  <tr key={trader.rank} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 text-center font-bold">
                      {trader.rank <= 3 ? (
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          trader.rank === 1 ? "bg-primary text-black" :
                          trader.rank === 2 ? "bg-gray-400 text-black" :
                          "bg-amber-600 text-white"
                        }`}>
                          {trader.rank}
                        </span>
                      ) : (
                        <span className="text-gray-500">{trader.rank}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <span>{trader.name}</span>
                        <span className="text-xs text-gray-500">{trader.flag} {trader.country}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-white font-semibold">
                      {trader.profit}
                    </td>
                    <td className="py-4 px-6 font-mono text-center text-primary font-bold">
                      {trader.gain}
                    </td>
                    <td className="py-4 px-6">
                      {trader.accountSize}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                        {trader.platform}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-400">
                      {trader.daysActive} Days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
