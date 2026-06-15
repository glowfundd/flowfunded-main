import Link from "next/link";
import { ArrowRight, Clock, Target, ShieldCheck, Award, Sparkles, Activity, BarChart3, ChevronRight, CheckCircle2 } from "lucide-react";
import ChallengeConfigurator from "@/components/ChallengeConfigurator";
import LivePayoutFeed from "@/components/LivePayoutFeed";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 -z-10 h-[450px] w-[450px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline Announcement */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6 hover:border-primary/40 transition-colors cursor-pointer group">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">Now Live: Bi-Weekly Automated Payouts</span>
            <ChevronRight className="h-3 w-3 text-primary/80 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Trade Up To <span className="bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent text-neon-glow">$2M Capital</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-400 sm:text-lg md:text-xl">
            Pass the evaluation. Prove your consistency. Get funded with simulated accounts up to $2,000,000 and keep up to 90% of the profits.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#challenges"
              className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black bg-primary rounded-full hover:bg-primary/95 transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] group"
              id="hero-cta-start-challenge"
            >
              Start Challenge
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/rules"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              View Trading Rules
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 border-t border-white/5 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-gray-500">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest text-gray-600">Simulated Broker</span>
              <span className="text-sm font-bold text-white mt-1">FlowBroker Pro</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest text-gray-600">Platform Support</span>
              <span className="text-sm font-bold text-white mt-1">MT4 / MT5 / DXTrade</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest text-gray-600">Average Payout Time</span>
              <span className="text-sm font-bold text-primary text-neon-glow mt-1">Under 8 Hours</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest text-gray-600">Client Rating</span>
              <span className="text-sm font-bold text-white mt-1">★ 4.9 TrustPilot</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Payouts Marquee */}
      <LivePayoutFeed />

      {/* Statistics Section */}
      <section className="py-16 md:py-24 border-b border-white/5 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { val: "$12M+", desc: "Total Paid Out" },
              { val: "20,000+", desc: "Active Traders" },
              { val: "180+", desc: "Countries Supported" },
              { val: "90%", desc: "Profit Split Ratio" },
            ].map((stat) => (
              <div key={stat.desc} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="block text-4xl sm:text-5xl font-extrabold text-white tracking-tight">{stat.val}</span>
                <span className="block text-xs sm:text-sm text-gray-400 mt-2 font-medium uppercase tracking-widest">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges Configurator Section */}
      <section id="challenges" className="py-20 md:py-28 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Choose Your evaluation model
            </h2>
            <p className="text-gray-400 mt-4">
              Select an account size that fits your risk tolerance and management style. All fees are 100% refundable upon first profit split.
            </p>
          </div>

          <ChallengeConfigurator />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 border-t border-white/5 bg-black/20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              The Path To Funded Trading
            </h2>
            <p className="text-gray-400 mt-4">
              Our evaluation program is designed to reward skilled, consistent, and disciplined traders. Follow our simple process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {[
              {
                step: "01",
                title: "Purchase Challenge",
                desc: "Choose an account size and make a payment. Receive your login credentials instantly.",
                icon: Clock,
              },
              {
                step: "02",
                title: "Pass Evaluation",
                desc: "Hit the 8% profit target with disciplined risk management. No time limits.",
                icon: Target,
              },
              {
                step: "03",
                title: "Get Verified",
                desc: "Prove your consistency in Stage 2 with a lower 5% target and low-risk parameters.",
                icon: ShieldCheck,
              },
              {
                step: "04",
                title: "Receive Funding",
                desc: "Become a FlowFunded partner. Trade with simulated capital and scale up to $2M.",
                icon: Award,
              },
            ].map((step, idx) => (
              <div key={step.step} className="rounded-2xl glass-panel glass-panel-hover p-6 flex flex-col justify-between relative h-72">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-4xl font-extrabold text-primary/10 tracking-tight">{step.step}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout Security & Testimonial Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 mb-6">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span className="text-xs font-semibold text-secondary">Secured Infrastructure</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl leading-tight">
                Reliable Payouts, Every Single Bi-Week
              </h2>
              <p className="text-gray-400 mt-6 leading-relaxed">
                At FlowFunded, we know that nothing is more important to a trader than receiving payouts on time. We have built an automated processing system that triggers crypto and wire payouts immediately when you qualify.
              </p>
              
              <ul className="mt-8 space-y-4 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                  <span>Request payouts directly from the dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                  <span>Choose between Crypto (USDT, BTC) or Bank Wire</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                  <span>Automatic processing in under 8 hours</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl glass-panel p-8 relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity className="h-48 w-48 text-primary" />
              </div>
              <p className="text-base text-gray-300 italic relative z-10">
                &ldquo;FlowFunded completely changed my trading journey. The dashboard has some of the cleanest metrics I have ever seen, and my first payout of $8,450 was processed and sent to my crypto wallet in less than two hours. Scaling rules are simple and fair.&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-white">
                  MK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus K.</h4>
                  <p className="text-xs text-gray-500">Funded Partner • Germany 🇩🇪</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA section */}
      <section className="py-20 border-t border-white/5 bg-black/40 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-extrabold text-white">Have questions about rules?</h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto">
            Find details on daily loss calculations, news trading, weekend holding, and refund rules.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/faq"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              Browse FAQ
            </Link>
            <Link
              href="/rules"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-black bg-primary rounded-full hover:bg-primary/95 transition-colors"
            >
              View Trading Rules
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
