"use client";

import {
  Award,
  Compass,
  Crown,
  HandHeart,
  MessageCircle,
  Star,
  Check,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Badge } from "./model";

type BadgesSectionProps = {
  badges: Badge[];
  onSaveBadges: (updated: { code: string; threshold: number }[]) => Promise<unknown> | void;
  isSaving?: boolean;
};

export function BadgesSection({
  badges,
  onSaveBadges,
  isSaving = false,
}: BadgesSectionProps) {
  const [localBadges, setLocalBadges] = useState<Badge[]>(badges);
  const [seenBadges, setSeenBadges] = useState<Badge[]>(badges);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (badges !== seenBadges) {
    setSeenBadges(badges);
    setLocalBadges(badges);
  }

  const handleThresholdChange = (code: string, value: number) => {
    setLocalBadges((prev) =>
      prev.map((b) => (b.code === code ? { ...b, threshold: value } : b)),
    );
  };

  const hasChanges = localBadges.some((b) => {
    const original = badges.find((orig) => orig.code === b.code);
    return original && b.threshold !== original.threshold;
  });

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updates = localBadges
      .filter((b) => typeof b.threshold === "number")
      .map((b) => ({ code: b.code, threshold: b.threshold as number }));

    await onSaveBadges(updates);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  function renderBadgeIcon(code: string) {
    switch (code) {
      case "KINDNESS_CHAMPION":
        return (
          <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <Award className="size-5" />
          </div>
        );
      case "STORY_EXPLORER":
        return (
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Compass className="size-5" />
          </div>
        );
      case "GAME_SHOW_READY":
        return (
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-100 text-red-500">
            <Star className="size-5" />
          </div>
        );
      case "HELPING_HAND":
        return (
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <HandHeart className="size-5" />
          </div>
        );
      case "SPEAK_UP":
        return (
          <div className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <MessageCircle className="size-5" />
          </div>
        );
      case "POSITIVE_LEADER":
        return (
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Crown className="size-5" />
          </div>
        );
      default:
        return (
          <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Award className="size-5" />
          </div>
        );
    }
  }

  return (
    <section
      aria-label="Badges"
      className="rounded-2xl border border-orange-100/70 bg-[#FDFBF7] p-6 shadow-xs"
    >
      <form onSubmit={handleSave}>
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Badges
          </h2>
          <Button
            type="submit"
            size="sm"
            disabled={isSaving || !hasChanges}
            className="rounded-full bg-orange-500 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isSaving ? (
              "Saving..."
            ) : savedSuccess ? (
              <span className="flex items-center gap-1.5">
                <Check className="size-4" /> Saved
              </span>
            ) : (
              "Save Badges"
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {localBadges.map((badge) => {
            const isEditable = typeof badge.threshold === "number";

            return (
              <div
                key={badge.code}
                className="flex flex-col justify-between rounded-xl border border-border bg-white p-5 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-3">
                    {renderBadgeIcon(badge.code)}
                    <h3 className="text-base font-semibold text-foreground">
                      {badge.name}
                    </h3>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {badge.howToEarn}
                  </p>

                  <div className="mt-3">
                    {isEditable ? (
                      <div className="flex h-14 items-center gap-2 rounded-xl border border-border bg-background px-3">
                        <span className="text-xs font-medium text-foreground">
                          {badge.code === "KINDNESS_CHAMPION" ? "Reach" : "Finish"}
                        </span>
                        <Input
                          aria-label={`${badge.name} threshold`}
                          type="number"
                          min={1}
                          value={badge.threshold ?? ""}
                          onChange={(e) =>
                            handleThresholdChange(
                              badge.code,
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                          className="h-9 w-24 rounded-lg border-muted bg-white text-center text-base font-bold text-foreground"
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {badge.thresholdUnit}
                        </span>
                      </div>
                    ) : (
                      <div className="flex min-h-[56px] items-center rounded-xl border border-border bg-background px-3 py-2 text-xs leading-relaxed text-foreground">
                        {badge.criteriaDescription}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-semibold text-foreground">
                    {badge.earnedCount} of {badge.totalStudents} earned
                  </span>
                  <span className="text-xs font-medium text-amber-600">
                    {badge.awardType === "AUTOMATIC" ? "Automatic" : "Given by Teacher"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </section>
  );
}
