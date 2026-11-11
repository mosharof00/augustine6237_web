"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getBetByInviteCode, joinBetByInviteCode } from "@/lib/api/bets";
import type { Bet } from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface JoinInviteModalProps {
  initialCode?: string;
  trigger?: React.ReactNode;
  onJoined?: () => void;
}

export function JoinInviteModal({
  initialCode = "",
  trigger,
  onJoined,
}: JoinInviteModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Resolved Bet & Staking State
  const [resolvedBet, setResolvedBet] = useState<Bet | null>(null);
  const [selectedSide, setSelectedSide] = useState<"BACK" | "OPPOSE">("BACK");
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<number>(25);

  async function handleFindBet(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a valid invite code");
      return;
    }

    try {
      setIsSearching(true);
      const bet = await getBetByInviteCode(cleanCode);
      setResolvedBet(bet);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Invite code not found or expired",
      );
      setResolvedBet(null);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleConfirmJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedBet) return;
    if (stakeAmount <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    const isCustom =
      resolvedBet.bet_type === "CUSTOM" && resolvedBet.outcomes?.length;

    try {
      setIsJoining(true);
      await joinBetByInviteCode(code.trim().toUpperCase(), {
        side: isCustom ? undefined : selectedSide,
        outcome_id: isCustom
          ? selectedOutcomeId || resolvedBet.outcomes?.[0]?.id
          : undefined,
        stake: stakeAmount,
      });

      toast.success(
        `Successfully joined! Placed $${stakeAmount} on this prediction. Escrow locked.`,
      );
      queryClient.invalidateQueries({ queryKey: ["public-bets"] });
      onJoined?.();
      setOpen(false);
      setResolvedBet(null);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to join private bet",
      );
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button
              variant="outline"
              className="flex items-center gap-1.5 border-[#233044] bg-[#162032] text-xs font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-800"
            >
              <KeyRound className="size-3.5 text-sky-400" />
              <span>Join with Code</span>
            </Button>
          )
        }
      />

      <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-md shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sky-400">
            <KeyRound className="size-5" />
            <DialogTitle className="text-base font-bold text-slate-100">
              Join Private Prediction Market
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-400">
            Enter an exclusive invite code (e.g. BET-9K2L8X) shared by a friend.
          </p>
        </DialogHeader>

        {/* Code Input & Search */}
        <form onSubmit={handleFindBet} className="mt-2 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="BET-XXXXXX"
            className="flex-1 rounded-lg border border-[#233044] bg-[#0B1222] px-3.5 py-2 text-sm font-bold tracking-wider text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={isSearching}
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold px-4 flex items-center gap-1.5"
          >
            {isSearching ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Search className="size-3.5" />
            )}
            <span>Find</span>
          </Button>
        </form>

        {/* Preview of Resolved Bet */}
        {resolvedBet && (
          <div className="mt-4 space-y-4 rounded-xl border border-[#233044] bg-[#0B1222] p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-400">
                {resolvedBet.category}
              </span>
              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Clock className="size-3 text-amber-400" />
                <span>Private Challenge</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100">
                {resolvedBet.title}
              </h4>
              {resolvedBet.description && (
                <p className="mt-1 text-slate-400 line-clamp-2">
                  {resolvedBet.description}
                </p>
              )}
            </div>

            {/* Pools & Participants */}
            <div className="rounded-lg bg-slate-900/80 p-2.5 space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Total Escrow Pool:</span>
                <span className="font-bold text-slate-100">
                  ${parseFloat(resolvedBet.total_pool).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Back Pool: ${parseFloat(resolvedBet.back_pool).toFixed(2)}</span>
                <span>Oppose Pool: ${parseFloat(resolvedBet.oppose_pool).toFixed(2)}</span>
              </div>
              {resolvedBet.participants && resolvedBet.participants.length > 0 && (
                <div className="flex items-center gap-1 pt-1 text-[11px] text-sky-400">
                  <Users className="size-3" />
                  <span>
                    {resolvedBet.participants.length} bettor
                    {resolvedBet.participants.length > 1 ? "s" : ""} active in this wager
                  </span>
                </div>
              )}
            </div>

            {/* Staking Form */}
            <form onSubmit={handleConfirmJoin} className="space-y-3 pt-1">
              {resolvedBet.bet_type === "CUSTOM" &&
              resolvedBet.outcomes &&
              resolvedBet.outcomes.length > 0 ? (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Choose Candidate Outcome
                  </label>
                  <select
                    value={selectedOutcomeId || resolvedBet.outcomes[0]?.id}
                    onChange={(e) => setSelectedOutcomeId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#233044] bg-[#162032] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-sky-400 focus:outline-none"
                  >
                    {resolvedBet.outcomes.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} (${parseFloat(o.pool || "0").toFixed(2)} · {o.percent}%)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Choose Your Side
                  </label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSide("BACK")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedSide === "BACK"
                          ? "bg-[#0EA5E9] text-white shadow-md shadow-sky-500/20"
                          : "bg-[#162032] text-slate-400 border border-[#233044]"
                      }`}
                    >
                      <TrendingUp className="size-3.5" />
                      BACK (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSide("OPPOSE")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedSide === "OPPOSE"
                          ? "bg-[#F43F5E] text-white shadow-md shadow-rose-500/20"
                          : "bg-[#162032] text-slate-400 border border-[#233044]"
                      }`}
                    >
                      <TrendingDown className="size-3.5" />
                      OPPOSE (No)
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Your Stake Amount ($)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min={1}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#233044] bg-[#162032] pl-7 pr-3 py-1.5 text-xs font-bold text-slate-100 focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="mt-1.5 flex gap-1">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStakeAmount(amt)}
                      className={`flex-1 py-1 rounded text-[10px] font-semibold border ${
                        stakeAmount === amt
                          ? "bg-slate-700 text-sky-400 border-sky-400/40"
                          : "bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isJoining}
                  className={`w-full text-white font-semibold text-xs py-2 shadow-md flex items-center justify-center gap-1.5 ${
                    selectedSide === "BACK"
                      ? "bg-[#0EA5E9] hover:bg-[#0284C7]"
                      : "bg-[#F43F5E] hover:bg-[#E11D48]"
                  }`}
                >
                  {isJoining ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-3.5" />
                  )}
                  <span>
                    Lock Stake & Join (${stakeAmount} on {selectedSide})
                  </span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

