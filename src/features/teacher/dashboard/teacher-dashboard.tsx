"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { ApiError } from "@/lib/api/envelope";
import { useSession } from "@/lib/auth/session";
import { getTeacherClasses, getTeacherDashboard } from "./api";
import { ClassProgressDonut, QuizAverageChart } from "./charts";
import { LeaderboardWidget } from "./leaderboard";
import { MetricCards } from "./metric-cards";
import {
  attentionLine,
  greeting,
  type ClassProgressData,
  type TeacherClass,
  type TeacherDashboard as TeacherDashboardData,
} from "./model";
import { RecentAwards } from "./recent-awards";
import { ReportsTable } from "./reports-table";

export function dashboardErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Could not load the teacher dashboard.";
}

export function TeacherDashboard() {
  const session = useSession();
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(
    undefined,
  );

  const classesQuery = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: getTeacherClasses,
    retry: false,
  });

  const dashboardQuery = useQuery({
    queryKey: ["teacher-dashboard", selectedClassId],
    queryFn: () => getTeacherDashboard(selectedClassId),
    retry: false,
  });

  if (session.status !== "loading" && session.user?.role !== "TEACHER") {
    return (
      <ErrorState
        message="Teacher access only."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (dashboardQuery.isPending) {
    return <LoadingState count={4} />;
  }

  if (dashboardQuery.isError) {
    return (
      <ErrorState
        message={dashboardErrorMessage(dashboardQuery.error)}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const name = session.user?.name || "Teacher";
  const classes = classesQuery.data ?? [];

  return (
    <TeacherDashboardView
      data={dashboardQuery.data}
      classes={classes}
      teacherName={name}
      selectedClassId={selectedClassId}
      onSelectClass={setSelectedClassId}
    />
  );
}

export function TeacherDashboardView({
  data,
  classes,
  teacherName,
  selectedClassId,
  onSelectClass,
}: {
  data: TeacherDashboardData;
  classes: TeacherClass[];
  teacherName: string;
  selectedClassId?: string;
  onSelectClass?: (classId: string) => void;
}) {
  const greetingText = greeting(teacherName);
  const attentionCount =
    data.safeSpaceReports.new +
    data.safeSpaceReports.reviewing +
    data.pendingStudents;

  // Resolve class progress: either from data or inferred from teacher classes
  const classProgress: ClassProgressData =
    data.classProgress.segments.length > 0
      ? data.classProgress
      : classes.length > 0
        ? {
            total: classes.length,
            segments: classes.map((cls, idx, arr) => ({
              name: cls.name,
              share: Math.round(100 / arr.length),
            })),
          }
        : { total: 0, segments: [] };

  return (
    <div className="grid gap-6">
      {/* 1. Header & Attention banner */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {greetingText}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {attentionLine(attentionCount)}
        </p>
      </div>

      {/* 2. Top row: 4 Metric Cards + Leaderboard Widget */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
        <MetricCards data={data} />
        <LeaderboardWidget
          students={data.leaderboard}
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={onSelectClass}
        />
      </div>

      {/* 3. Middle row: Quiz Average Chart + Class Progress Donut */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
        <article className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Quiz average correct
            </h3>
            <span className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
              This week
            </span>
          </div>
          <QuizAverageChart week={data.week} />
        </article>

        <article className="rounded-2xl border bg-card p-5">
          <h3 className="mb-4 font-semibold text-foreground">
            Class wise story progress
          </h3>
          {classProgress.total === 0 ? (
            <div className="py-6">
              <EmptyState
                title="No class progress"
                description="Assigned classes will appear here."
              />
            </div>
          ) : (
            <ClassProgressDonut
              total={classProgress.total}
              segments={classProgress.segments}
            />
          )}
        </article>
      </div>

      {/* 4. Bottom row: Reports & Approvals Table + Recent Awards */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
        <ReportsTable reports={data.recentReports} />
        <RecentAwards awards={data.recentAwards} />
      </div>
    </div>
  );
}
