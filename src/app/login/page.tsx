"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) {
        // Check if admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push(redirect);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-all duration-300">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-white">Flow<span className="text-primary">Funded</span></span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Sign In</h1>
          <p className="text-gray-400">Access your FlowFunded trading account</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl glass-panel p-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-200" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-200" />
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full relative inline-flex items-center justify-center px-8 py-3 text-base font-bold text-black bg-primary rounded-full hover:bg-primary/95 disabled:bg-primary/50 transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]">
            {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Signing in...</> : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
