import { AlertCircle, ArrowUpRight, Award, Clock3, FileText } from "lucide-react";
import Link from "next/link";
import { formatCount, type TeacherDashboard } from "./model";

export function MetricCards({ data }: { data: TeacherDashboard }) {
  const safeReportsCount =
    data.safeSpaceReports.new + data.safeSpaceReports.reviewing;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. Safe Reports */}
      <article className="relative rounded-2xl border bg-card p-5 transition-shadow hover:shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <Link
            href="/teacher/safe-space"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open Safe Space reports"
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Safe Reports
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatCount(safeReportsCount)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          A little attention matters
        </p>
      </article>

      {/* 2. Flagged Responses */}
      <article className="relative rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <AlertCircle className="size-5" />
          </div>
          <span className="p-1 text-muted-foreground/40" aria-hidden="true">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Flagged Responses
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatCount(data.flaggedResponses.count)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.flaggedResponses.caption}
        </p>
      </article>

      {/* 3. Pending Student */}
      <article className="relative rounded-2xl border bg-card p-5 transition-shadow hover:shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock3 className="size-5" />
          </div>
          <Link
            href="/teacher/classes"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open class join queue"
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Pending Student
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatCount(data.pendingStudents)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Awaiting approval
        </p>
      </article>

      {/* 4. Game Eligible Students */}
      <article className="relative rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="size-5" />
          </div>
          <span className="p-1 text-muted-foreground/40" aria-hidden="true">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Game Eligible Students
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatCount(data.eligibleStudents)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Criteria not configured
        </p>
      </article>
    </div>
  );
}
