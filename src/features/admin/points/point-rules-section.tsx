"use client";

import { BookOpen, Heart, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PointRules } from "./model";

type PointRulesSectionProps = {
  initialRules: PointRules;
  onSave: (rules: PointRules) => Promise<unknown> | void;
  isSaving?: boolean;
};

export function PointRulesSection({
  initialRules,
  onSave,
  isSaving = false,
}: PointRulesSectionProps) {
  const [storyPoints, setStoryPoints] = useState<number>(initialRules.storyPoints);
  const [kindnessPoints, setKindnessPoints] = useState<number>(initialRules.kindnessPoints);
  const [teacherAward, setTeacherAward] = useState<number>(initialRules.teacherAward);
  const [seenRules, setSeenRules] = useState<PointRules>(initialRules);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (initialRules !== seenRules) {
    setSeenRules(initialRules);
    setStoryPoints(initialRules.storyPoints);
    setKindnessPoints(initialRules.kindnessPoints);
    setTeacherAward(initialRules.teacherAward);
  }

  const hasChanges =
    storyPoints !== initialRules.storyPoints ||
    kindnessPoints !== initialRules.kindnessPoints ||
    teacherAward !== initialRules.teacherAward;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await onSave({
      storyPoints: Number(storyPoints) || 0,
      kindnessPoints: Number(kindnessPoints) || 0,
      teacherAward: Number(teacherAward) || 0,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <section
      aria-label="Point Rules"
      className="rounded-2xl border border-orange-100/70 bg-[#FDFBF7] p-6 shadow-xs"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Point Rules
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
              "Save Rules"
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Story Points */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100/70 text-orange-600">
                  <BookOpen className="size-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Story Points</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Positive Points for each correct answer at the end of a chapter
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Input
                id="story-points-input"
                aria-label="Story Points per question"
                type="number"
                min={0}
                value={storyPoints}
                onChange={(e) => setStoryPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="h-12 w-28 rounded-lg border-muted bg-white text-center text-lg font-bold text-foreground"
              />
              <span className="text-xs font-medium text-muted-foreground">
                points/question
              </span>
            </div>
          </div>

          {/* Kindness Points */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100/70 text-orange-600">
                  <Heart className="size-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Kindness Points</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Kindness Points for a kind Defense Round response
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Input
                id="kindness-points-input"
                aria-label="Kindness Points per round"
                type="number"
                min={0}
                value={kindnessPoints}
                onChange={(e) =>
                  setKindnessPoints(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="h-12 w-28 rounded-lg border-muted bg-white text-center text-lg font-bold text-foreground"
              />
              <span className="text-xs font-medium text-muted-foreground">
                points/round
              </span>
            </div>
          </div>

          {/* Teacher Award */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100/70 text-orange-600">
                  <Heart className="size-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Teacher Award</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Teachers award as per positive category for the students
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Input
                id="teacher-award-input"
                aria-label="Teacher Award points"
                type="number"
                min={0}
                value={teacherAward}
                onChange={(e) => setTeacherAward(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="h-12 w-28 rounded-lg border-muted bg-white text-center text-lg font-bold text-foreground"
              />
              <span className="text-xs font-medium text-muted-foreground">points</span>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
