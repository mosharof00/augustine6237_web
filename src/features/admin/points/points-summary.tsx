import { Award, BookOpen, Heart } from "lucide-react";
import type { PointSummary } from "./model";

export function PointsSummary({ summary }: { summary: PointSummary }) {
  const formattedBadges = String(summary.totalBadges).padStart(2, "0");

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Total Positive Points */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100/70 text-orange-600">
              <BookOpen className="size-5" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Total Positive Point Awarded
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {summary.totalPositivePoints}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Positive points given to the student.
        </p>
      </div>

      {/* Total Kindness Points */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100/70 text-orange-600">
              <Heart className="size-5" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Total Kindness points Awarded
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {summary.totalKindnessPoints}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Kindness point given to the students.
        </p>
      </div>

      {/* Total Badges */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100/70 text-orange-600">
              <Award className="size-5" />
            </div>
            <span className="text-sm font-medium text-foreground">Total Badges</span>
          </div>
          <div className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {formattedBadges}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Number of badges for the students.
        </p>
      </div>
    </div>
  );
}
