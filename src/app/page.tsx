"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/session";
import { BetsFeed } from "@/features/bets/bets-feed";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Wallet,
  User,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { user, status, logout } = useSession();

  return (
    <div className="min-h-screen bg-[#0B1222] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#233044] bg-[#0B1222]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0EA5E9] to-cyan-400 text-white shadow-lg shadow-sky-500/20">
                <Flame className="size-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white">
                  Bet<span className="text-[#0EA5E9]">Social</span>
                </span>
                <span className="ml-1.5 hidden rounded-full border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-sky-400 sm:inline-block">
                  P2P
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link
              href="/"
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Markets
            </Link>
            <Link
              href="/profile"
              className="hover:text-slate-100 transition-colors"
            >
              Community Profiles
            </Link>
          </nav>

          {/* Right Action / Auth */}
          <div className="flex items-center gap-3">
            {status === "ready" && user ? (
              <div className="flex items-center gap-3">
                {/* Balance Badge */}
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  <Wallet className="size-3.5" />
                  <span>${user.balance ?? "0.00"}</span>
                </div>

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg border border-[#233044] bg-[#162032] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 transition-colors"
                >
                  <User className="size-3.5 text-sky-400" />
                  <span className="max-w-[100px] truncate">{user.name || "My Profile"}</span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="size-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  title="Sign Out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-800" />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold shadow-md"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <BetsFeed />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#233044] bg-[#0B1222]/80 py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>BetSocial Peer-to-Peer Prediction Protocol & Escrow Lock</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Dark-first Fintech Design</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#0EA5E9]">
              <TrendingUp className="size-3" /> Back vs Oppose
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
