"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  ChevronRight,
  Clock,
  Eye,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "cn";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import {
  getTeacherClass,
  getTeacherClasses,
  getTeacherClassJoinRequests,
} from "./api";
import { ClassSwitcher } from "./class-switcher";
import { JoinRequestDialog } from "./join-request-dialog";
import {
  formatClassCode,
  formatClassName,
  formatRequestDate,
  pendingBannerText,
  type ClassStudentRow,
  type TeacherJoinRequest,
} from "./model";

export type ClassDetailTab = "overview" | "students" | "progress";

export function TeacherClassDetailView({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ClassDetailTab) || "overview";
  const [activeTab, setActiveTab] = useState<ClassDetailTab>(initialTab);
  const [selectedRequest, setSelectedRequest] = useState<TeacherJoinRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Class detail query
  const classQuery = useQuery({
    queryKey: ["teacher-class", id],
    queryFn: () => getTeacherClass(id),
    retry: false,
  });

  // All teacher classes (for class switcher)
  const classesQuery = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: () => getTeacherClasses(),
    retry: false,
  });

  // Join requests query
  const joinRequestsQuery = useQuery({
    queryKey: ["teacher-class-join-requests", id],
    queryFn: () => getTeacherClassJoinRequests(id),
    retry: false,
  });

  if (classQuery.isPending) {
    return <LoadingState count={3} />;
  }

  if (classQuery.isError || !classQuery.data) {
    return (
      <ErrorState
        message={
          classQuery.error instanceof ApiError
            ? classQuery.error.message
            : "Could not load class details."
        }
        onRetry={() => void classQuery.refetch()}
      />
    );
  }

  const cls = classQuery.data;
  const allClasses = classesQuery.data?.items ?? [];
  const pendingRequests = joinRequestsQuery.data?.items ?? [];
  const pendingCount = pendingRequests.length > 0 ? pendingRequests.length : cls.pendingCount;
  const displayName = formatClassName(cls.name, cls.gradeLabel);

  function handleReviewRequest(req: TeacherJoinRequest) {
    setSelectedRequest(req);
    setDialogOpen(true);
  }

  return (
    <div className="grid gap-6">
      {/* 1. Breadcrumbs & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/teacher/classes" className="hover:text-foreground transition-colors">
              Classes
            </Link>
            <ChevronRight className="size-3" />
            <span className="font-medium text-foreground">{displayName}</span>
          </nav>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {displayName}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Class code <span className="font-mono font-semibold text-primary">{formatClassCode(cls.code)}</span> · {cls.studentCount} students
          </p>
        </div>

        {allClasses.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Switch class:</span>
            <ClassSwitcher
              classes={allClasses}
              selectedClassId={id}
              showAllOption={false}
              onSelectClass={(newId) => {
                if (newId && newId !== id) {
                  router.push(`/teacher/classes/${newId}`);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* 2. Pending banner */}
      {pendingCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              <Clock className="size-4" />
            </span>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              {pendingBannerText(pendingCount)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("students")}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200"
          >
            Review Requests
          </Button>
        </div>
      )}

      {/* 3. Navigation Tabs */}
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
          onClick={() => setActiveTab("students")}
          className={cn(
            "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "students"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Students
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
          Learning progress
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === "overview" && (
        <OverviewTab
          cls={cls}
          pendingCount={pendingCount}
        />
      )}

      {activeTab === "students" && (
        <StudentsTab
          cls={cls}
          pendingRequests={pendingRequests}
          onReviewRequest={handleReviewRequest}
        />
      )}

      {activeTab === "progress" && (
        <ProgressTab cls={cls} />
      )}

      {/* Join Request Review Dialog */}
      <JoinRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        request={selectedRequest}
        className={cls.name}
        gradeLabel={cls.gradeLabel}
        onSuccess={() => {
          void joinRequestsQuery.refetch();
          void classQuery.refetch();
        }}
      />
    </div>
  );
}

function OverviewTab({
  cls,
  pendingCount,
}: {
  cls: ReturnType<typeof getTeacherClass> extends Promise<infer T> ? T : never;
  pendingCount: number;
}) {
  return (
    <div className="grid gap-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-primary dark:bg-orange-950/50">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Students</p>
              <p className="text-2xl font-bold text-foreground">{cls.studentCount}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Students in this class.</p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending approvals</p>
              <p className="text-2xl font-bold text-foreground">
                {String(pendingCount).padStart(2, "0")}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Requests awaiting review and approval</p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Award className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg. quiz score</p>
              <p className="text-2xl font-bold text-foreground">{cls.avgQuizScore}%</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Average score achieved by students.</p>
        </div>
      </div>

      {/* Story completion + Class progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Story completion */}
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold text-foreground">Story completion</h3>
          <div className="mt-4 grid gap-4">
            {cls.stories.map((story) => (
              <div key={story.id} className="rounded-xl bg-muted/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{story.title}</span>
                  <span className="font-semibold text-primary">{story.progressPercent}%/100%</span>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-primary/15">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${story.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class progress */}
        <div className="flex flex-col justify-between rounded-2xl border bg-card p-5">
          <h3 className="font-semibold text-foreground">Class progress</h3>
          <div className="my-auto flex flex-col items-center justify-center py-6">
            {/* Multi-arc radial gauge */}
            <div className="relative flex size-44 items-center justify-center">
              <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Outer Track & Arc (Orange) */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-orange-100 dark:stroke-orange-950/30"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-primary"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * 0.92)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Middle Track & Arc (Sky Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="34"
                  className="stroke-sky-100 dark:stroke-sky-950/30"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="34"
                  className="stroke-sky-400"
                  strokeWidth="6"
                  strokeDasharray="213"
                  strokeDashoffset={213 - (213 * 0.85)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Inner Track & Arc (Purple) */}
                <circle
                  cx="50"
                  cy="50"
                  r="26"
                  className="stroke-purple-100 dark:stroke-purple-950/30"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="26"
                  className="stroke-purple-500"
                  strokeWidth="6"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * 0.75)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-foreground">
                  {cls.readingProgressPercent}%
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  average across<br />students
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-purple-500" />
                <span>The Lantern Keeper of Marrow Bay</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-sky-400" />
                <span>Why the River Sings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span>The Seed Under the Staircase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsTab({
  cls,
  pendingRequests,
  onReviewRequest,
}: {
  cls: ReturnType<typeof getTeacherClass> extends Promise<infer T> ? T : never;
  pendingRequests: TeacherJoinRequest[];
  onReviewRequest: (req: TeacherJoinRequest) => void;
}) {
  return (
    <div className="grid gap-6">
      {/* Pending approvals section */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold text-foreground">Pending approvals</h3>
          <div className="mt-3 grid gap-3">
            {pendingRequests.map((req) => {
              const s = req.student;
              const name = s.realName || s.nickname || s.username;
              return (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      {s.avatarUrl ? <AvatarImage src={s.avatarUrl} alt={name} /> : null}
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested {formatRequestDate(req.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onReviewRequest(req)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Review
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Approved Students table */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="py-3 pr-4 pl-5 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Points</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Game show</th>
                <th className="py-3 pr-5 pl-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {cls.students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No students currently enrolled in this class.
                  </td>
                </tr>
              ) : (
                cls.students.map((st) => (
                  <StudentRowItem key={st.id} student={st} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentRowItem({ student }: { student: ClassStudentRow }) {
  const pct = Math.min(100, Math.max(0, student.progressPercent));
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="py-3.5 pr-4 pl-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            {student.avatarUrl ? (
              <AvatarImage src={student.avatarUrl} alt={student.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {student.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{student.name}</p>
            <p className="text-xs text-muted-foreground">@{student.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
        {student.studentCode}
      </td>
      <td className="px-4 py-3.5 font-semibold text-foreground">
        {student.points}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            student.gameShowEligible
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          {student.gameShowEligible ? "Yes" : "Not yet"}
        </span>
      </td>
      <td className="py-3.5 pr-5 pl-4 text-right">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`View ${student.name}`}
          render={<Link href={`/teacher/students/${student.id}`} />}
        >
          <Eye className="size-4" />
        </Button>
      </td>
    </tr>
  );
}

function ProgressTab({
  cls,
}: {
  cls: ReturnType<typeof getTeacherClass> extends Promise<infer T> ? T : never;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Story completion */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold text-foreground">Story completion</h3>
        <div className="mt-4 grid gap-4">
          {cls.stories.map((story) => (
            <div key={story.id} className="rounded-xl bg-muted/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{story.title}</span>
                <span className="font-semibold text-primary">{story.progressPercent}%/100%</span>
              </div>
              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-primary/15">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${story.progressPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students needing support */}
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold text-foreground">Students needing support</h3>
        <div className="mt-4 grid gap-4">
          {cls.studentsNeedingSupport.map((st, i) => {
            const barColors = [
              "bg-purple-500",
              "bg-sky-400",
              "bg-emerald-500",
            ];
            const color = barColors[i % barColors.length];
            return (
              <div key={st.id} className="rounded-xl bg-muted/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{st.name}</span>
                  <span className="font-semibold text-foreground">{st.progressPercent}%/100%</span>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", color)}
                    style={{ width: `${st.progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
