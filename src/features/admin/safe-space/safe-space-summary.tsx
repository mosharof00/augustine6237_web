import { CheckCircle2, CircleDot, Clock, Flag } from "lucide-react";
import type { SafeSpaceSummary } from "./model";

export function SafeSpaceSummarySection({
  summary,
}: {
  summary: SafeSpaceSummary;
}) {
  return (
    <section aria-label="Safe space report summaries" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* 2x2 Left Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
        {/* New Reports */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-primary dark:bg-orange-950/50">
              <CircleDot className="size-4" />
            </span>
            <span className="text-sm font-medium">New Reports</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {summary.newReports}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Not yet reviewed</p>
          </div>
        </div>

        {/* Reviewing Reports */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50">
              <Clock className="size-4" />
            </span>
            <span className="text-sm font-medium">Reviewing Reports</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {summary.reviewingReports}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Under review</p>
          </div>
        </div>

        {/* Reports Addressed */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50">
              <CheckCircle2 className="size-4" />
            </span>
            <span className="text-sm font-medium">Reports Addressed</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {summary.addressedReports}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Followup completed</p>
          </div>
        </div>

        {/* Flagged Report */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50">
              <Flag className="size-4" />
            </span>
            <span className="text-sm font-medium">Flagged Report</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {summary.flaggedReports}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Safety issue</p>
          </div>
        </div>
      </div>

      {/* Concern Categories Right Card */}
      <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-xs lg:col-span-1">
        <h3 className="text-sm font-semibold text-foreground">Concern Categories</h3>
        <div className="mt-3 flex flex-1 flex-col justify-around gap-2">
          {summary.concernCategories.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-lg bg-orange-50/70 px-3 py-2 text-xs font-medium text-foreground dark:bg-orange-950/20"
            >
              <span className="truncate pr-2">{item.category}</span>
              <span className="font-semibold text-primary/90">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
