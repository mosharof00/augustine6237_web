"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Bet } from "@/lib/api/types";
import {
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  User,
  ShieldAlert,
  Flame,
  Lock,
  Copy,
  CheckCircle2,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function subscribeClock(callback: () => void) {
  const id = setInterval(callback, 30000);
  return () => clearInterval(id);
}

function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => Date.now(),
    () => 0,
  );
}

export interface BetCardProps {
  bet: Bet;
  onOpenDiscussion?: (bet: Bet) => void;
  onSelectStance?: (bet: Bet, stance: "BACK" | "OPPOSE") => void;
  onSelectOutcome?: (bet: Bet, outcomeId?: string) => void;
  onOpenMatchedStatus?: (bet: Bet) => void;
  onOpenEscrow?: (bet: Bet) => void;
  onOpenCommission?: (bet: Bet) => void;
}

export function BetCard({
  bet,
  onOpenDiscussion,
  onSelectStance,
  onSelectOutcome,
  onOpenMatchedStatus,
  onOpenEscrow,
  onOpenCommission,
}: BetCardProps) {
  const now = useNow();

  const { backPercent, opposePercent, total, back, oppose } = useMemo(() => {
    const t = parseFloat(bet.total_pool) || 0;
    const b = parseFloat(bet.back_pool) || 0;
    const o = parseFloat(bet.oppose_pool) || 0;

    if (t <= 0) {
      return { backPercent: 50, opposePercent: 50, total: 0, back: 0, oppose: 0 };
    }

    const bp = Math.min(100, Math.max(0, Math.round((b / t) * 100)));
    const op = 100 - bp;

    return { backPercent: bp, opposePercent: op, total: t, back: b, oppose: o };
  }, [bet.total_pool, bet.back_pool, bet.oppose_pool]);

  const remaining = useMemo(() => {
    if (!bet.deadline) return "No deadline";
    if (now === 0) return "Calculating...";
    const diff = new Date(bet.deadline).getTime() - now;
    if (diff <= 0) return "Closed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  }, [bet.deadline, now]);

  const isClosed = remaining === "Closed" || bet.status === "CLOSED" || bet.status === "RESOLVED";

  const categoryColor = useMemo(() => {
    switch (bet.category.toUpperCase()) {
      case "SPORTS":
        return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      case "POLITICS":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "CRYPTO":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "ENTERTAINMENT":
        return "text-pink-400 bg-pink-500/10 border-pink-500/20";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  }, [bet.category]);

  return (
    <div
      data-testid={`bet-card-${bet.id}`}
      className="group flex flex-col justify-between rounded-xl border border-[#233044] bg-[#162032] p-5 shadow-lg transition-all duration-200 hover:border-slate-600 hover:shadow-cyan-950/20"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${categoryColor}`}
            >
              {bet.category}
            </span>
            {bet.is_private && bet.invite_code && (
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(bet.invite_code!);
                    toast.success(`Copied invite code: ${bet.invite_code}`);
                  }
                }}
                className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-400 hover:bg-sky-500/20 transition-colors"
                title="Click to copy invite code"
              >
                <Lock className="size-3" />
                <span>{bet.invite_code}</span>
                <Copy className="size-2.5 opacity-60" />
              </button>
            )}
            {bet.is_featured && (
              <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                <Sparkles className="size-3" />
                Featured
              </span>
            )}
            {total >= 500 && (
              <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-400">
                <Flame className="size-3" />
                Hot
              </span>
            )}
            {bet.matched_pool && parseFloat(bet.matched_pool) > 0 ? (
              <button
                type="button"
                onClick={() => onOpenMatchedStatus?.(bet)}
                className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                title="View Matched Betting Engine Status"
              >
                <CheckCircle2 className="size-3" />
                <span>${parseFloat(bet.matched_pool).toFixed(0)} Matched</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenMatchedStatus?.(bet)}
                className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
                title="View Matched Engine & Live Odds"
              >
                <Scale className="size-3 text-sky-400" />
                <span>Engine</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenEscrow?.(bet)}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                bet.status === "RESOLVED"
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
              }`}
              title="View Escrow Pool & Resolution Payouts"
            >
              {bet.status === "RESOLVED" ? (
                <>
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  <span>Settled</span>
                </>
              ) : (
                <>
                  <Lock className="size-3 text-sky-400" />
                  <span>Escrow</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onOpenCommission?.(bet)}
              className="flex items-center gap-0.5 rounded-full border border-sky-500/20 bg-sky-500/5 px-2 py-0.5 text-[11px] font-medium text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition-colors"
              title="Platform Commission Policy"
            >
              <span>{bet.commission_rate ?? "10.0"}% fee</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="size-3.5 text-slate-400" />
            <span
              className={`font-medium ${
                isClosed
                  ? "text-rose-400"
                  : remaining.includes("m left")
                    ? "text-amber-400"
                    : "text-slate-300"
              }`}
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="line-clamp-2 text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
          {bet.title}
        </h3>

        {bet.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-slate-400">
            {bet.description}
          </p>
        )}

        {/* Prediction Outcomes / Ratio Meter */}
        {bet.bet_type === "CUSTOM" && bet.outcomes && bet.outcomes.length > 0 ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Candidate Outcomes</span>
              <span>Pool & Odds</span>
            </div>
            {bet.outcomes.map((outcome) => (
              <div
                key={outcome.id}
                className="rounded-lg border border-[#233044] bg-[#0B1222]/60 p-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">
                    {outcome.title}
                  </span>
                  <span className="font-bold text-sky-400">
                    ${parseFloat(outcome.pool || "0").toFixed(2)} ({outcome.percent}%)
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, outcome.percent))}%`,
                    }}
                    className="h-full bg-sky-400 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
            <div className="text-[11px] text-right text-slate-400">
              Total Pool: ${total.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-[#0EA5E9]">
                <TrendingUp className="size-3.5" />
                BACK {backPercent}%
              </span>
              <span className="flex items-center gap-1 text-[#F43F5E]">
                OPPOSE {opposePercent}%
                <TrendingDown className="size-3.5" />
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 flex">
              <div
                style={{ width: `${backPercent}%` }}
                className="bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
              />
              <div
                style={{ width: `${opposePercent}%` }}
                className="bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
              />
            </div>

            {/* Pool Metrics */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Back: ${back.toFixed(2)} <span className="text-sky-400 font-semibold">({back > 0 && total > 0 ? (total / back).toFixed(2) : "2.00"}x)</span></span>
              <button
                type="button"
                onClick={() => onOpenMatchedStatus?.(bet)}
                className="font-semibold text-slate-200 hover:text-sky-300 transition-colors"
                title="View Matched Status & Order Book"
              >
                Total: ${total.toFixed(2)}
              </button>
              <span>Oppose: ${oppose.toFixed(2)} <span className="text-rose-400 font-semibold">({oppose > 0 && total > 0 ? (total / oppose).toFixed(2) : "2.00"}x)</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="mt-5 border-t border-[#233044] pt-3">
        <div className="flex items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300 ring-1 ring-slate-700">
              {bet.creator?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bet.creator.avatar_url}
                  alt={bet.creator.name}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <User className="size-3 text-slate-400" />
              )}
            </div>
            <span className="text-xs text-slate-300 truncate max-w-[120px]">
              {bet.creator?.name || "Bettor"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDiscussion?.(bet)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 px-2.5"
          >
            <MessageSquare className="size-3.5 text-sky-400" />
            <span>{bet.comments_count}</span>
          </Button>
        </div>

        {/* Stake Buttons */}
        {bet.bet_type === "CUSTOM" ? (
          <Button
            size="sm"
            disabled={isClosed}
            onClick={() =>
              onSelectOutcome
                ? onSelectOutcome(bet, bet.outcomes?.[0]?.id)
                : onSelectStance?.(bet, "BACK")
            }
            className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Pick Candidate & Stake
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              disabled={isClosed}
              onClick={() => onSelectStance?.(bet, "BACK")}
              className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Back (Yes)
            </Button>
            <Button
              size="sm"
              disabled={isClosed}
              onClick={() => onSelectStance?.(bet, "OPPOSE")}
              className="w-full bg-[#F43F5E] hover:bg-[#E11D48] text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Oppose (No)
            </Button>
          </div>
        )}

        {isClosed && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <ShieldAlert className="size-3 text-amber-400" />
            <span>Betting closed for this prediction</span>
          </div>
        )}
      </div>
    </div>
  );
}
