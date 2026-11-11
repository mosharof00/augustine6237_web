"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBet } from "@/lib/api/bets";
import type { Bet, CreateBetInput } from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Sparkles, TrendingUp, TrendingDown, Lock } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "SPORTS",
  "POLITICS",
  "CRYPTO",
  "ENTERTAINMENT",
  "PUBLIC_ISSUES",
  "OTHER",
];

interface CreateBetModalProps {
  onBetCreated?: (newBet: Bet) => void;
  trigger?: React.ReactNode;
}

export function CreateBetModal({ onBetCreated, trigger }: CreateBetModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("SPORTS");
  const [betType, setBetType] = useState<"BINARY" | "CUSTOM">("BINARY");
  const [customOutcomes, setCustomOutcomes] = useState<string[]>([
    "Option 1",
    "Option 2",
  ]);
  const [initialOutcome, setInitialOutcome] = useState("Option 1");
  const [description, setDescription] = useState("");
  const [initialStake, setInitialStake] = useState<number>(10);
  const [initialSide, setInitialSide] = useState<"BACK" | "OPPOSE">("BACK");
  const [isPrivate, setIsPrivate] = useState(false);
  const [deadline, setDeadline] = useState("");

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      const defaultDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);
      setDeadline(defaultDeadline);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a prediction title");
      return;
    }

    if (!deadline) {
      toast.error("Please select a closing deadline");
      return;
    }

    const isCustom = betType === "CUSTOM";
    const validOutcomes = isCustom
      ? customOutcomes.map((o) => o.trim()).filter(Boolean)
      : undefined;

    if (isCustom && (!validOutcomes || validOutcomes.length < 2)) {
      toast.error(
        "Please provide at least 2 options for a multi-outcome prediction",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateBetInput = {
        title: title.trim(),
        category,
        bet_type: betType,
        outcomes: validOutcomes,
        initial_outcome: isCustom
          ? initialOutcome || validOutcomes?.[0]
          : undefined,
        description: description.trim() || undefined,
        deadline: new Date(deadline).toISOString(),
        is_private: isPrivate,
        initial_stake: initialStake > 0 ? initialStake : undefined,
        initial_side: isCustom ? undefined : initialSide,
      };

      const newBet = await createBet(payload);

      if (newBet.is_private && newBet.invite_code) {
        toast.success(
          `Private bet created! Invite Code: ${newBet.invite_code} (Copied to clipboard)`,
        );
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(newBet.invite_code);
        }
      } else {
        toast.success("Public bet created successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ["public-bets"] });
      onBetCreated?.(newBet);

      // Reset
      setTitle("");
      setDescription("");
      setBetType("BINARY");
      setCustomOutcomes(["Option 1", "Option 2"]);
      setInitialStake(10);
      setInitialSide("BACK");
      setIsPrivate(false);
      setOpen(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create bet",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button className="flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium shadow-md">
              <PlusCircle className="size-4" />
              <span>Create Bet</span>
            </Button>
          )
        }
      />

      <DialogContent className="border border-[#233044] bg-[#162032] text-slate-100 sm:max-w-lg shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sky-400">
            <Sparkles className="size-5" />
            <DialogTitle className="text-lg font-bold text-slate-100">
              Create Public Prediction Bet
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-400">
            Publish a prediction market for sports, politics, crypto, or public events.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Bet Type Switcher */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Market Prediction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#0B1222] border border-[#233044]">
              <button
                type="button"
                onClick={() => setBetType("BINARY")}
                className={`py-1.5 rounded-md text-xs font-bold transition-all ${
                  betType === "BINARY"
                    ? "bg-[#0EA5E9] text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                YES / NO (Binary)
              </button>
              <button
                type="button"
                onClick={() => setBetType("CUSTOM")}
                className={`py-1.5 rounded-md text-xs font-bold transition-all ${
                  betType === "CUSTOM"
                    ? "bg-[#0EA5E9] text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Multi-Outcome (Custom)
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Prediction Title / Question *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                betType === "CUSTOM"
                  ? "e.g. Who will win the Premier League 2026/27?"
                  : "e.g. Will Arsenal win tonight?"
              }
              required
              className="mt-1.5 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {/* Custom Candidates Outcomes */}
          {betType === "CUSTOM" && (
            <div className="rounded-lg border border-[#233044] bg-[#0B1222]/80 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Candidate Outcomes (Min 2)
                </label>
                {customOutcomes.length < 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = customOutcomes.length + 1;
                      setCustomOutcomes([...customOutcomes, `Option ${nextNum}`]);
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    + Add Option
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {customOutcomes.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...customOutcomes];
                        copy[idx] = e.target.value;
                        setCustomOutcomes(copy);
                        if (initialOutcome === opt) {
                          setInitialOutcome(e.target.value);
                        }
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 rounded-lg border border-[#233044] bg-[#162032] px-3 py-1.5 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                    />
                    {customOutcomes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const copy = customOutcomes.filter((_, i) => i !== idx);
                          setCustomOutcomes(copy);
                          if (initialOutcome === opt) {
                            setInitialOutcome(copy[0] || "");
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Bet Deadline *
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-[#233044] bg-[#0B1222] px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Resolution Criteria & Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clarify winning conditions, official source of truth, or match rules..."
              className="mt-1.5 w-full resize-none rounded-lg border border-[#233044] bg-[#0B1222] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {/* Initial Seed Stake & Stance */}
          <div className="rounded-lg border border-[#233044] bg-[#0B1222]/80 p-3.5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Initial Seed Stake
            </span>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[11px] text-slate-400">Stake Amount ($)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={initialStake}
                    onChange={(e) => setInitialStake(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#233044] bg-[#162032] pl-7 pr-3 py-1.5 text-sm font-semibold text-slate-100 focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">
                  {betType === "CUSTOM" ? "Your Candidate Pick" : "Your Initial Side"}
                </label>
                {betType === "CUSTOM" ? (
                  <select
                    value={initialOutcome}
                    onChange={(e) => setInitialOutcome(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#162032] px-3 py-1.5 text-xs font-semibold text-slate-100 focus:border-sky-400 focus:outline-none"
                  >
                    {customOutcomes.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt || `Option ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInitialSide("BACK")}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        initialSide === "BACK"
                          ? "bg-[#0EA5E9] text-white shadow"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <TrendingUp className="size-3" />
                      BACK (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInitialSide("OPPOSE")}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        initialSide === "OPPOSE"
                          ? "bg-[#F43F5E] text-white shadow"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <TrendingDown className="size-3" />
                      OPPOSE (No)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Private Bet Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-[#233044] bg-[#0B1222]/80 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-sky-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Private Bet (Friends & Family)
                </span>
                <span className="text-[11px] text-slate-400">
                  Hidden from public feed. Generates an exclusive invite code.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="size-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-xs px-5 shadow-lg flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Bet Market</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
