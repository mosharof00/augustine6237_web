"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  GraduationCap,
  School,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ErrorState, LoadingState, EmptyState } from "@/components/feedback/states";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { useSession } from "@/lib/auth/session";
import { getAdminDashboard } from "./api";
import { LearningChart, StudentDonut } from "./charts";
import {
  activityTime,
  attentionLine,
  classRequestLine,
  donutSegments,
  greeting,
  pendingCountLabel,
  reviewHrefs,
  safeSpaceLine,
  studentApprovalLine,
  type AdminDashboard,
} from "./model";

export function dashboardErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Could not load the dashboard.";
}

export function AdminDashboard() {
  const session = useSession();
  const query = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    retry: false,
  });

  if (query.isPending) return <LoadingState count={4} />;
  if (query.isError) {
    return (
      <ErrorState
        message={dashboardErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const name =
    session.user?.name?.trim() ||
    query.data.greetingName?.trim() ||
    "there";

  return (
    <AdminDashboardView
      data={query.data}
      greetingText={greeting(name, new Date().getHours())}
    />
  );
}

export function AdminDashboardView({
  data,
  greetingText,
}: {
  data: AdminDashboard;
  greetingText: string;
}) {
  const segments = donutSegments(data.students);
  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{greetingText}</h2>
        <p className="text-sm text-muted-foreground">
          {attentionLine(data.attentionCount)}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<Users />}
          label="Total Students"
          value={String(data.totalStudents)}
          detail="All registered students"
          href="/admin/users/students"
        />
        <KpiCard
          icon={<GraduationCap />}
          label="Total Teachers"
          value={String(data.totalTeachers)}
          detail="Registered teachers"
          href="/admin/users/staff"
        />
        <KpiCard
          icon={<School />}
          label="Total Classes"
          value={String(data.totalClasses)}
          detail="Active classrooms"
          href="/admin/classes"
        />
        <KpiCard
          icon={<Clock3 />}
          label="Pending Student"
          value={pendingCountLabel(data.pendingStudents)}
          detail="Awaiting admin approval"
          href={reviewHrefs.studentApprovals}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <section className="grid gap-4">
          <article className="rounded-xl border bg-card p-4">
            <h3 className="font-medium text-foreground">Learning Overview</h3>
            <LearningChart week={data.week} />
          </article>
          <div className="grid gap-4 sm:grid-cols-2">
            <PercentCard label="Story completion" percent={data.storyCompletionPercent} />
            <PercentCard label="Quiz Completion" percent={data.quizCompletionPercent} />
          </div>
        </section>
        <section className="grid content-start gap-4">
          <article className="rounded-xl border bg-card p-4">
            <h3 className="font-medium text-foreground">Story Overview</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StoryCount label="Published" value={data.stories.published} />
              <StoryCount label="Drafts" value={data.stories.drafts} />
              <StoryCount label="Archived" value={data.stories.archived} />
            </div>
            <div className="mt-4 flex justify-center">
              <Link
                href={reviewHrefs.stories}
                className={buttonVariants()}
              >
                Manage Stories
              </Link>
            </div>
          </article>
          <article className="rounded-xl border bg-card p-4">
            <h3 className="font-medium text-foreground">Need Attention</h3>
            <div className="mt-3 grid gap-3">
              <AttentionRow
                title="Pending Class Requests"
                detail={classRequestLine(data.attention.classRequests)}
                href={reviewHrefs.classRequests}
                label="Review class requests"
              />
              <AttentionRow
                title="Pending Student Approvals"
                detail={studentApprovalLine(data.attention.studentApprovals)}
                href={reviewHrefs.studentApprovals}
                label="Review student approvals"
              />
              <AttentionRow
                title="Safe Space Reports"
                detail={safeSpaceLine(
                  data.attention.safeSpaceNew,
                  data.attention.safeSpaceFollowUp,
                )}
                href={reviewHrefs.safeSpace}
                label="Review Safe Space reports"
              />
            </div>
          </article>
        </section>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border bg-card p-4">
          <h3 className="font-medium text-foreground">Top Students</h3>
          {data.topStudents.length === 0 ? (
            <EmptyState
              title="No top students"
              description="Students with kindness points will appear here."
            />
          ) : (
            <ul className="mt-3 grid gap-3">
              {data.topStudents.map((student) => (
                <li key={`${student.name}-${student.grade}`} className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                    {student.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{student.name}</span>
                    <span className="block text-xs text-muted-foreground">{student.grade}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-medium text-primary">
                      {student.points} points
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {student.kindness} Kindness
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="rounded-xl border bg-card p-4">
          <h3 className="font-medium text-foreground">Students</h3>
          <StudentDonut total={data.students.total} segments={segments} />
          {segments.length > 0 ? (
            <ul className="flex flex-wrap justify-center gap-4 text-sm">
              {segments.map((segment, index) => (
                <li key={segment.label} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: index % 2 === 0 ? "#e87532" : "#9060f8" }}
                  />
                  {segment.label} {segment.percent}%
                </li>
              ))}
            </ul>
          ) : null}
        </article>
        <article className="rounded-xl border bg-card p-4">
          <h3 className="font-medium text-foreground">Recent Activity</h3>
          {data.activity.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="New enrollments, stories, and reports will appear here."
            />
          ) : (
            <ul className="mt-3 grid gap-4">
              {data.activity.map((item) => (
                <li key={`${item.actor}-${item.at}`} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {item.actor.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-sm text-foreground">
                      <span className="font-medium">{item.actor}</span> {item.sentence}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {activityTime(item.at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  detail,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  href: string;
}) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <Link href={href} aria-label={label} className="text-muted-foreground">
          <ArrowUpRight />
        </Link>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}

function StoryCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-primary/10 px-2 py-3 text-center">
      <BookOpen className="mx-auto text-primary" />
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function PercentCard({ label, percent }: { label: string; percent: number }) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <article className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <p className="mt-3 text-2xl font-semibold">{percent}%</p>
      <div className="mt-3 h-2 rounded-full bg-primary/15">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${width}%` }}
        />
      </div>
    </article>
  );
}

function AttentionRow({
  title,
  detail,
  href,
  label,
}: {
  title: string;
  detail: string;
  href: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-3">
      <div>
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <Link
        href={href}
        aria-label={label}
        className={buttonVariants({ variant: "outline" })}
      >
        Review
      </Link>
    </div>
  );
}
