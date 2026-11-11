"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBetByInviteCode, joinBetByInviteCode } from "@/lib/api/bets";
import type { Bet } from "@/lib/api/types";
import {
  KeyRound,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  User,
  Users,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InviteViewProps {
  code: string;
}

export function InviteView({ code }: InviteViewProps) {
  const queryClient = useQueryClient();
  const [selectedSide, setSelectedSide] = useState<"BACK" | "OPPOSE">("BACK");
  const [stakeAmount, setStakeAmount] = useState<number>(50);
  const [isJoining, setIsJoining] = useState(false);

  const {
    data: bet,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Bet>({
    queryKey: ["bet-invite", code],
    queryFn: () => getBetByInviteCode(code),
    enabled: Boolean(code),
  });

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!bet) return;
    if (stakeAmount <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    try {
      setIsJoining(true);
      await joinBetByInviteCode(code, {
        side: selectedSide,
        stake: stakeAmount,
      });

      toast.success(
        `Successfully joined! Locked $${stakeAmount} on ${selectedSide}.`,
      );
      refetch();
      queryClient.invalidateQueries({ queryKey: ["public-bets"] });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to join private challenge",
      );
    } finally {
      setIsJoining(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-sky-400" />
        <p className="mt-3 text-xs text-slate-400">Resolving invite link {code}...</p>
      </div>
    );
  }

  if (isError || !bet) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle className="mx-auto size-12 text-rose-400" />
        <h2 className="mt-3 text-lg font-bold text-slate-100">
          Invalid or Expired Invite Link
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {error instanceof Error
            ? error.message
            : `The invite code "${code}" could not be found or has ended.`}
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="outline" className="border-slate-700 text-xs">
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Public Markets
          </Button>
        </Link>
      </div>
    );
  }

  const total = parseFloat(bet.total_pool) || 0;
  const back = parseFloat(bet.back_pool) || 0;
  const oppose = parseFloat(bet.oppose_pool) || 0;
  const backPct = total > 0 ? Math.round((back / total) * 100) : 50;
  const opposePct = total > 0 ? 100 - backPct : 50;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-300 transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        <span>Explore Other Markets</span>
      </Link>

      <div className="rounded-2xl border border-[#233044] bg-[#162032] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#233044]">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 uppercase tracking-wider">
              {bet.category}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-200">
              <KeyRound className="size-3 text-amber-400" />
              {bet.invite_code || code}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="size-3.5" />
            <span>Private P2P Challenge</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-xl font-black text-slate-100">
            {bet.title}
          </h1>
          {bet.description && (
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {bet.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span>Created by:</span>
            <span className="font-semibold text-slate-200">
              {bet.creator?.name || "Bettor"}
            </span>
            {bet.creator?.username && (
              <span className="text-slate-500">(@{bet.creator.username})</span>
            )}
          </div>
        </div>

        {/* Ratio Meter */}
        <div className="space-y-2 rounded-xl bg-[#0B1222] p-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1 text-[#0EA5E9]">
              <TrendingUp className="size-3.5" />
              BACK ({backPct}%) — ${back.toFixed(2)}
            </span>
            <span className="flex items-center gap-1 text-[#F43F5E]">
              ${oppose.toFixed(2)} — OPPOSE ({opposePct}%)
              <TrendingDown className="size-3.5" />
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 flex">
            <div
              style={{ width: `${backPct}%` }}
              className="bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
            />
            <div
              style={{ width: `${opposePct}%` }}
              className="bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
            />
          </div>

          <div className="text-center pt-1 text-[11px] text-slate-400">
            Total Locked Escrow Pool: <span className="font-bold text-slate-200">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Participant Roster */}
        {bet.participants && bet.participants.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#233044]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="size-3.5 text-sky-400" />
              Active Bettor Roster ({bet.participants.length})
            </h3>

            <div className="space-y-2">
              {bet.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-[#233044] bg-[#0B1222]/60 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                      <User className="size-3" />
                    </div>
                    <span className="font-semibold text-slate-200">
                      {p.user?.name || "Participant"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold ${
                        p.side === "BACK" ? "text-sky-400" : "text-rose-400"
                      }`}
                    >
                      {p.side}
                    </span>
                    <span className="font-bold text-slate-100">
                      ${parseFloat(p.stake).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staking Form */}
        <form onSubmit={handleJoin} className="space-y-4 pt-2 border-t border-[#233044]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Take Your Stance
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedSide("BACK")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                selectedSide === "BACK"
                  ? "bg-[#0EA5E9] text-white shadow-lg shadow-sky-500/20"
                  : "bg-[#0B1222] text-slate-400 border border-[#233044] hover:text-slate-200"
              }`}
            >
              <TrendingUp className="size-4" />
              BACK (Yes)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSide("OPPOSE")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                selectedSide === "OPPOSE"
                  ? "bg-[#F43F5E] text-white shadow-lg shadow-rose-500/20"
                  : "bg-[#0B1222] text-slate-400 border border-[#233044] hover:text-slate-200"
              }`}
            >
              <TrendingDown className="size-4" />
              OPPOSE (No)
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block">
              Stake Amount ($)
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">$</span>
              <input
                type="number"
                min={1}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-[#233044] bg-[#0B1222] pl-8 pr-3 py-2 text-sm font-bold text-slate-100 focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div className="mt-2 flex gap-2">
              {[20, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStakeAmount(amt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    stakeAmount === amt
                      ? "bg-slate-700 text-sky-400 border-sky-400/40"
                      : "bg-[#0B1222] text-slate-400 border-[#233044] hover:text-slate-200"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isJoining}
            className={`w-full py-3 text-white font-bold text-xs shadow-xl flex items-center justify-center gap-2 ${
              selectedSide === "BACK"
                ? "bg-[#0EA5E9] hover:bg-[#0284C7]"
                : "bg-[#F43F5E] hover:bg-[#E11D48]"
            }`}
          >
            {isJoining ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            <span>
              Commit ${stakeAmount} Stake & Lock Escrow ({selectedSide})
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
