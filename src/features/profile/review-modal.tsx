"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { createUserReview } from "@/lib/api/profile";
import { toast } from "sonner";

interface ReviewModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({
  userId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createUserReview(userId, {
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Review posted successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-[#162032] p-6 shadow-2xl text-foreground">
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <h3 className="text-lg font-semibold">Rate & Review Bettor</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Rating stars */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Select Rating</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-amber-400">
              {rating === 5
                ? "Excellent (5/5)"
                : rating === 4
                  ? "Good (4/5)"
                  : rating === 3
                    ? "Average (3/5)"
                    : rating === 2
                      ? "Below Average (2/5)"
                      : "Poor (1/5)"}
            </span>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label
              htmlFor="review-comment"
              className="text-xs font-medium text-muted-foreground"
            >
              Review Comment (Optional)
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about matched bets, reliability, payout speed..."
              className="w-full rounded-xl border border-border/40 bg-[#0B1222] p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border/40 text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-sky-500 text-sm font-semibold text-white hover:bg-sky-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

