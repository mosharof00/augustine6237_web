"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "cn";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { getTeacherStudent } from "./api";
import {
  studentStatusVariant,
  type TeacherStudentDetail,
} from "./model";

export type StudentDetailTab = "overview" | "progress" | "points";

export function TeacherStudentDetailView({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<StudentDetailTab>("overview");

  const query = useQuery({
    queryKey: ["teacher-student", id],
    queryFn: () => getTeacherStudent(id),
    retry: false,
  });

  if (query.isPending) {
    return <LoadingState count={3} />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={
          query.error instanceof ApiError
            ? query.error.message
            : "Could not load student profile."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const student = query.data;

  return (
    <div className="grid gap-6">
      {/* 1. Breadcrumbs */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/teacher/students" className="hover:text-foreground transition-colors">
            Students
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">{student.name}</span>
        </nav>
      </div>

      {/* 2. Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 ring-2 ring-primary/20">
            {student.avatarUrl ? (
              <AvatarImage src={student.avatarUrl} alt={student.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {student.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
              <StatusBadge variant={studentStatusVariant(student.status)} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>@{student.username}</span>
              <span>·</span>
              <span className="font-medium text-foreground">{student.className}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                Joined {student.joinedDate}
              </span>
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" render={<Link href="/teacher/students" />}>
          Back to Students
        </Button>
      </div>

      {/* 3. Top Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-primary dark:bg-orange-950/50">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Kindness points</p>
              <p className="text-xl font-bold text-foreground">{student.points}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              <Award className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
              <p className="text-xl font-bold text-foreground">{student.badgeCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <BookOpen className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Chapters finished</p>
              <p className="text-xl font-bold text-foreground">{student.chaptersCompleted}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Trophy className="size-4" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Quiz average</p>
              <p className="text-xl font-bold text-foreground">{student.quizAverage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("progress")}
          className={cn(
            "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "progress"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Reading progress
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("points")}
          className={cn(
            "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "points"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Points & Badges
        </button>
      </div>

      {/* 5. Tab Panels */}
      {activeTab === "overview" && <OverviewPanel student={student} />}
      {activeTab === "progress" && <ProgressPanel student={student} />}
      {activeTab === "points" && <PointsPanel student={student} />}
    </div>
  );
}

function OverviewPanel({ student }: { student: TeacherStudentDetail }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Personal Details */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold text-foreground">Personal Details</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Full name</dt>
            <dd className="mt-1 font-medium text-foreground">
              {student.realName || student.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Username</dt>
            <dd className="mt-1 font-medium text-foreground">@{student.username}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Class</dt>
            <dd className="mt-1 font-medium text-foreground">{student.className}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <StatusBadge variant={studentStatusVariant(student.status)} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Student ID</dt>
            <dd className="mt-1 font-mono text-xs text-muted-foreground">
              {student.studentCode}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Role</dt>
            <dd className="mt-1 font-medium text-foreground">Student</dd>
          </div>
        </dl>
      </div>

      {/* Learning Snapshot */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold text-foreground">Growing at their own pace</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Learning snapshot reflecting story milestones and classroom participation.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-2xl font-bold text-foreground">{student.chaptersCompleted}</p>
            <p className="mt-1 text-xs text-muted-foreground">Chapters completed</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-2xl font-bold text-foreground">{student.reportsCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Safe Space reports</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
          <span>Profiles never display Safe Space report content.</span>
        </div>
      </div>
    </div>
  );
}

function ProgressPanel({ student }: { student: TeacherStudentDetail }) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="font-semibold text-foreground">Every chapter is a step forward</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Reading completion and quiz scores across stories.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="py-3 pr-4 pl-5 font-medium">Story</th>
              <th className="px-4 py-3 font-medium">Chapters</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Quiz score</th>
              <th className="py-3 pr-5 pl-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {student.progress.map((item) => (
              <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-3.5 pr-4 pl-5 font-medium text-foreground">
                  {item.story}
                </td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">
                  {item.chaptersCompleted} / {item.chaptersTotal}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-primary/15">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.progressPercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-foreground text-xs">
                  {item.quizScore ?? "—"}
                </td>
                <td className="py-3.5 pr-5 pl-4 text-right">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      item.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {item.status === "COMPLETED" ? "Completed" : "In progress"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PointsPanel({ student }: { student: TeacherStudentDetail }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Badges Earned */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Badges Earned</h3>
          <span className="text-xs text-muted-foreground">
            {student.badgeCount} of {student.badges.length} unlocked
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {student.badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "rounded-xl border p-3.5 transition-colors",
                badge.earned
                  ? "bg-card border-border"
                  : "bg-muted/30 border-dashed border-border/60 opacity-60",
              )}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    badge.earned
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Award className="size-4" />
                </span>
                <div>
                  <p className="font-medium text-xs text-foreground">{badge.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                    {badge.description}
                  </p>
                  {badge.earnedDate && (
                    <p className="mt-1.5 text-[10px] text-primary font-medium">
                      Earned {badge.earnedDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Kindness Points History</h3>
          <span className="font-bold text-primary">{student.points} pts total</span>
        </div>

        <div className="mt-4 divide-y divide-border/60">
          {student.pointsHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-xs text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">{item.date}</p>
              </div>
              <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                +{item.amount} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
