import Link from "next/link";
import { Activity, Mail, Music, Disc as Discord, Share2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-background text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          {/* Logo & Slogan Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Activity className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Flow<span className="text-primary">Funded</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Empowering global traders with institutional scale capital. Trade up to $2,000,000, keep up to 90% profits.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="hover:text-primary transition-colors duration-200" aria-label="Mail">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors duration-200" aria-label="Discord">
                <Discord className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors duration-200" aria-label="YouTube">
                <Music className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors duration-200" aria-label="Telegram">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Challenges */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Programs</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#challenges" className="hover:text-white transition-colors duration-200">
                  Evaluation Challenge
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-white transition-colors duration-200">
                  Trading Rules
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Scaling Plan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Affiliate Program
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors duration-200">
                  Frequently Asked Qs
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors duration-200">
                  Top Trader Leaderboard
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Blog & Insights
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Payout Proofs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="text-sm text-gray-500">
                Email: <a href="mailto:support@flowfunded.com" className="text-gray-400 hover:text-white transition-colors">support@flowfunded.com</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimers & Copyright */}
        <div className="border-t border-white/5 pt-8 text-xs text-gray-600 flex flex-col gap-6">
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> FlowFunded offers educational and evaluation services. All activities on the platform are simulated and take place within a virtual environment. No real funds are managed or deposited into brokerage markets. Evaluation challenges, verifications, and scaling targets do not represent actual market trading accounts, and references to capital size reflect hypothetical parameters. Profit splits are paid based on performance within virtual environments.
          </p>
          <p className="leading-relaxed">
            Hypothetical or simulated performance results have certain limitations. Unlike an actual performance record, simulated results do not represent actual trading. Also, since the trades have not been executed, the results may have under-or-over compensated for the impact, if any, of certain market factors, such as lack of liquidity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-2">
            <span className="text-gray-500">
              &copy; {currentYear} FlowFunded. All rights reserved. Built for elite traders.
            </span>
            <div className="flex gap-6 text-gray-500">
              <span>Risk Warning</span>
              <span>Cookies Policy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
