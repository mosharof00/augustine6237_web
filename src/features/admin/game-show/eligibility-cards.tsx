"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EligibilityConfig } from "./model";

export function EligibilityCards({
  config,
  onEdit,
}: {
  config: EligibilityConfig;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Game Show Rules
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage students game show eligibility
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="inline-flex items-center gap-2 self-start rounded-xl font-medium sm:self-auto"
        >
          <Pencil className="size-4" />
          Edit Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Required Stories */}
        <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/50 p-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Required Stories</h3>
            <p className="text-xs text-muted-foreground">
              Total no. of stories that needed to completed
            </p>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-4xl font-extrabold tracking-tight text-foreground">
              {config.requiredStories}
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              Story completed
            </p>
          </div>
        </div>

        {/* Required Chapters */}
        <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/50 p-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Required Chapters</h3>
            <p className="text-xs text-muted-foreground">
              Total no. of chapters that needed to completed
            </p>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-4xl font-extrabold tracking-tight text-foreground">
              {config.requiredChapters}
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              Chapters completes
            </p>
          </div>
        </div>

        {/* Minimum Comprehension */}
        <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/50 p-5 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">
              Minimum Comprehension %
            </h3>
            <p className="text-xs text-muted-foreground">
              Minimum score needed to completed
            </p>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-4xl font-extrabold tracking-tight text-foreground">
              {config.minQuizPercent}
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              % average quiz score
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
