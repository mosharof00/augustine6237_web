"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/session";
import {
  getBetComments,
  createBetComment,
  deleteBetComment,
} from "@/lib/api/bets";
import type { BetComment } from "@/lib/api/types";
import {
  MessageSquare,
  Send,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface BetDiscussionThreadProps {
  betId: string;
  betTitle?: string;
}

export function BetDiscussionThread({
  betId,
  betTitle,
}: BetDiscussionThreadProps) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useSession();

  const [content, setContent] = useState("");
  const [stance, setStance] = useState<"BACK" | "OPPOSE" | "SPECTATOR">("BACK");
  const [filterStance, setFilterStance] = useState<
    "ALL" | "BACK" | "OPPOSE" | "SPECTATOR"
  >("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: comments = [],
    isLoading,
    refetch,
  } = useQuery<BetComment[]>({
    queryKey: ["bet-comments", betId],
    queryFn: () => getBetComments(betId),
    enabled: Boolean(betId),
  });

  const filteredComments =
    filterStance === "ALL"
      ? comments
      : comments.filter((c) => c.stance === filterStance);

  async function handleSendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      const newComment = await createBetComment(betId, {
        content: content.trim(),
        stance,
      });

      queryClient.setQueryData<BetComment[]>(
        ["bet-comments", betId],
        (prev = []) => [...prev, newComment],
      );

      setContent("");
      toast.success("Comment posted to bet thread");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to post comment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const prev = comments;
    queryClient.setQueryData<BetComment[]>(
      ["bet-comments", betId],
      comments.filter((c) => c.id !== commentId),
    );

    try {
      await deleteBetComment(betId, commentId);
      toast.success("Comment deleted");
    } catch (err: unknown) {
      queryClient.setQueryData(["bet-comments", betId], prev);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete comment",
      );
    }
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm flex flex-col h-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/30">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            Bettor Discussion ({comments.length})
          </h3>
          {betTitle && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {betTitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          title="Refresh discussion"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 py-3 border-b border-border/20 text-xs">
        <span className="text-muted-foreground font-medium mr-1">Filter:</span>
        <button
          type="button"
          onClick={() => setFilterStance("ALL")}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            filterStance === "ALL"
              ? "bg-white/10 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({comments.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStance("BACK")}
          className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
            filterStance === "BACK"
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          Backers (
          {comments.filter((c) => c.stance === "BACK").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStance("OPPOSE")}
          className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
            filterStance === "OPPOSE"
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingDown className="w-3 h-3" />
          Opposers (
          {comments.filter((c) => c.stance === "OPPOSE").length})
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[240px] max-h-[460px]">
        {filteredComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Users className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium">No comments in this thread</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Be the first bettor to state your position!
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isOwn =
              Boolean(currentUser?.id) && currentUser?.id === comment.author?.id;
            const isBack = comment.stance === "BACK";
            const isOppose = comment.stance === "OPPOSE";

            return (
              <div
                key={comment.id}
                className="p-3.5 rounded-xl border border-border/20 bg-surface-subtle/50 text-foreground space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                      {comment.author?.name
                        ? comment.author.name[0].toUpperCase()
                        : "B"}
                    </div>
                    <span className="text-xs font-semibold">
                      {comment.author?.name ?? "Bettor"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isBack
                          ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                          : isOppose
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-white/10 text-muted-foreground"
                      }`}
                    >
                      {comment.stance}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground/60">
                      {new Date(comment.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isOwn && (
                      <button
                        type="button"
                        onClick={() => void handleDeleteComment(comment.id)}
                        className="text-muted-foreground/50 hover:text-rose-400 transition-colors p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-foreground/90 pl-9 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSendComment}
        className="pt-3 border-t border-border/30 space-y-2.5"
      >
        {/* Stance Choice */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            Your Stance:
          </span>
          <button
            type="button"
            onClick={() => setStance("BACK")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              stance === "BACK"
                ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            Back (Yes)
          </button>
          <button
            type="button"
            onClick={() => setStance("OPPOSE")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              stance === "OPPOSE"
                ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            Oppose (No)
          </button>
          <button
            type="button"
            onClick={() => setStance("SPECTATOR")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              stance === "SPECTATOR"
                ? "bg-white/20 text-foreground"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            Neutral
          </button>
        </div>

        {/* Text Field and Send */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share analysis, odds evaluation, or game predictions..."
            className="flex-1 rounded-xl border border-border/40 bg-[#0B1222] px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-sky-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 disabled:opacity-40 transition-colors shadow-sm shadow-sky-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

