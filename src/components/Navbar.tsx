"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, Activity, ChevronRight, User, LogOut,
  TrendingUp, ArrowUpRight, ArrowDownRight, Award,
  BookOpen, Zap, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Home", href: user ? "/dashboard" : "/" },
    { name: "Challenges", href: "/#challenges" },
    { name: "Rules", href: "/rules" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  const quickActions = [
    { label: "Trade", icon: TrendingUp, color: "text-primary", bg: "hover:bg-primary/10" },
    { label: "Withdraw", icon: ArrowUpRight, color: "text-orange-400", bg: "hover:bg-orange-500/10" },
    { label: "Deposit", icon: ArrowDownRight, color: "text-emerald-400", bg: "hover:bg-emerald-500/10" },
    { label: "Certificate", icon: Award, color: "text-yellow-400", bg: "hover:bg-yellow-500/10" },
    { label: "Academy", icon: BookOpen, color: "text-purple-400", bg: "hover:bg-purple-500/10" },
    { label: "Competition", icon: Zap, color: "text-pink-400", bg: "hover:bg-pink-500/10" },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-all duration-300">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Flow<span className="text-primary text-neon-glow">Funded</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href.startsWith("/#") && pathname === "/");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                      isActive ? "text-primary text-neon-glow" : "text-gray-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                >
                  <User className="h-4 w-4 text-primary" />
                  Account
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0a0f1e]/95 border border-white/10 shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden animate-fade-in-down">
                    {/* Quick Actions */}
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 px-2 mb-2">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-1">
                        {quickActions.map(({ label, icon: Icon, color, bg }) => (
                          <button
                            key={label}
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${color} ${bg} transition-all duration-150`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-white/5 mx-3 my-2" />

                    {/* Account links */}
                    <div className="px-3 pb-3 space-y-1">
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <User className="h-4 w-4" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/#challenges"
                  className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-black bg-primary rounded-full hover:bg-primary/95 transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] group overflow-hidden"
                  id="cta-nav-start-challenge"
                >
                  <span className="relative z-10 flex items-center gap-1">
                    Start Challenge <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-900 hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-white/5 bg-background/95 backdrop-blur-lg" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-400 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="pt-2 pb-1 px-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Quick Actions</p>
                  <div className="grid grid-cols-3 gap-2">
                    {quickActions.map(({ label, icon: Icon, color }) => (
                      <button
                        key={label}
                        onClick={() => setIsOpen(false)}
                        className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-medium ${color} transition-all`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-900 hover:text-white transition-colors duration-200"
                >
                  <User className="h-4 w-4" /> Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-900 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/#challenges"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-semibold text-black bg-primary hover:bg-primary/95 transition-all duration-200 mt-2"
                >
                  Start Challenge
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
