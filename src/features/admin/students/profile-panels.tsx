import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/feedback/status-badge";
import {
  badgeCountLabel,
  powerHeroesCount,
  powerHeroesValue,
  quizStatusLabel,
  scoreLabel,
  studentStatusVariant,
  type QuizStatus,
  type StudentDetail,
} from "./model";

export type ProfileTab = "details" | "progress" | "points" | "eligibility" | "safe-space";

export const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "progress", label: "Progress" },
  { id: "points", label: "Points & Badges" },
  { id: "eligibility", label: "Game Show Eligibility" },
  { id: "safe-space", label: "Safe Space" },
];

const quizStyles: Record<QuizStatus, string> = {
  COMPLETED: "bg-success/15 text-success",
  REMAINING: "bg-primary/15 text-primary",
  WAITING: "bg-info/15 text-info",
};

function Meter({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-primary/15">
      <span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </span>
  );
}

export function ProfilePanels({
  student,
  tab,
}: {
  student: StudentDetail;
  tab: ProfileTab;
}) {
  if (tab === "progress") return <ProgressPanel student={student} />;
  if (tab === "points") return <PointsPanel student={student} />;
  if (tab === "eligibility") return <EligibilityPanel student={student} />;
  if (tab === "safe-space") return <SafeSpacePanel student={student} />;
  return <DetailsPanel student={student} />;
}

function DetailsPanel({ student }: { student: StudentDetail }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <article className="rounded-xl border bg-card p-4">
        <h3 className="font-medium">Personal Details</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Detail label="Full name" value={student.name} />
          <Detail label="Age" value={student.ageLabel} />
          <Detail label="Username" value={`@${student.handle}`} />
          <Detail
            label="Status"
            value={<StatusBadge variant={studentStatusVariant(student.status)} />}
          />
          <Detail label="Class" value={student.className} />
          <Detail
            label="Power Heroes"
            value={powerHeroesValue(student.powerHeroesUnlocked)}
          />
        </dl>
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Power Heroes: {powerHeroesCount(student.powerHeroesUnlocked, student.powerHeroesTotal)}
        </p>
      </article>
      <article className="rounded-xl border bg-card p-4">
        <h3 className="font-medium">Growing at their own pace</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sample learning snapshot. Explore Progress for chapters, quiz scores, and comprehension
          work.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat value={student.chaptersCompleted} label="Chapters completed" />
          <Stat value={student.safeSpace.reportCount} label="Safe Space reports" />
        </div>
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Profiles never display Safe Space report content.
        </p>
      </article>
    </div>
  );
}

function ProgressPanel({ student }: { student: StudentDetail }) {
  return (
    <section className="rounded-xl border bg-card">
      <h3 className="px-4 pt-4 font-medium">Every chapter is a step forward</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Story</th>
              <th className="px-4 py-2 font-medium">chapters</th>
              <th className="px-4 py-2 font-medium">Chapter progress</th>
              <th className="px-4 py-2 font-medium">Score per story</th>
              <th className="px-4 py-2 font-medium">Quiz status</th>
              <th className="px-4 py-2 font-medium">Quiz Score</th>
            </tr>
          </thead>
          <tbody>
            {student.progress.map((row, index) => (
              <tr key={`${row.story}-${index}`} className="border-t">
                <td className="px-4 py-3">{row.story}</td>
                <td className="px-4 py-3">{row.chapters}</td>
                <td className="px-4 py-3">
                  {row.completed} / {row.total} completed
                  <Meter value={row.completed} total={row.total} />
                </td>
                <td className="px-4 py-3">{scoreLabel(row.score)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${quizStyles[row.quizStatus]}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                    {quizStatusLabel(row.quizStatus)}
                  </span>
                </td>
                <td className="px-4 py-3">{scoreLabel(row.quizScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PointsPanel({ student }: { student: StudentDetail }) {
  const achievement = student.classAchievement;
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Summary
          title="Positive points"
          value={String(student.positivePoints)}
          caption="Positive points earned by the student."
        />
        <Summary
          title="Kindness points"
          value={String(student.kindnessPoints)}
          caption="Kindness point earned by the students."
        />
        <Summary
          title="Badges"
          value={badgeCountLabel(student.badgeCount)}
          caption="Number of badges earned by the student."
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border bg-card p-4">
          <h3 className="font-medium">Positive points overview</h3>
          <ul className="mt-3 grid gap-2">
            {student.storyPoints.map((item) => (
              <li key={item.story} className="flex justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                <span>{item.story}</span>
                <span>{item.points}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-medium">Points history</h3>
          <ul className="mt-3 grid gap-2">
            {student.history.map((item) => (
              <li key={`${item.title}-${item.at}`} className="rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="flex justify-between gap-3">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-success">+{item.amount}</span>
                </span>
                <span className="block text-xs text-muted-foreground">
                  {item.at} · {item.detail}
                </span>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-medium">Badge earning progress</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Earned Badges: {badgeCountLabel(student.badgeCount)}
          </p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {student.badges.map((badge) => (
              <li
                key={badge.name}
                className={badge.earned ? "text-sm" : "text-sm text-muted-foreground"}
              >
                {badge.name}
              </li>
            ))}
          </ul>
        </article>
        <div className="grid gap-4">
          <article className="rounded-xl border bg-card p-4">
            <h3 className="font-medium">Positive categories</h3>
            <ul className="mt-3 grid gap-2">
              {student.categories.map((item) => (
                <li
                  key={item.label}
                  className="flex justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm"
                >
                  <span>{item.label}</span>
                  <span>{item.points}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Class-wise achievement overview</h3>
              <StatusBadge variant={studentStatusVariant(achievement.status)} />
            </div>
            <p className="mt-2 text-sm">{achievement.className}</p>
            <dl className="mt-3 grid gap-2 text-sm">
              <Detail
                label="Completed chapters"
                value={`${achievement.completedChapters} / ${achievement.completedChapterTotal}`}
              />
              <Detail label="Positive points" value={String(achievement.positivePoints)} />
              <Detail label="Kindness points" value={String(achievement.kindnessPoints)} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Achievements are shown only for this student&apos;s class.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}

function EligibilityPanel({ student }: { student: StudentDetail }) {
  const eligibility = student.eligibility;
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-xl border bg-card p-4">
        <h3 className="font-medium">Game Show Eligibility</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Student&apos;s current Game Show access and qualification status.
        </p>
        <div className="mt-4 rounded-xl bg-primary/10 p-3">
          <h4 className="text-sm font-medium">Eligibility progress</h4>
          <EligibilityRow
            label="Story Completed"
            value={`${eligibility.storiesCompleted}/${eligibility.storiesTotal}`}
            current={eligibility.storiesCompleted}
            total={eligibility.storiesTotal}
          />
          <EligibilityRow
            label="Chapters Completed"
            value={`${eligibility.chaptersCompleted}/${eligibility.chaptersTotal}`}
            current={eligibility.chaptersCompleted}
            total={eligibility.chaptersTotal}
          />
          <EligibilityRow
            label="Overall Score"
            value={`${eligibility.scorePercent}% / ${eligibility.scoreRequired}%`}
            current={eligibility.scorePercent}
            total={100}
          />
        </div>
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Progress calculation · Eligibility is defined by the admin
        </p>
      </article>
      <article className="rounded-xl border bg-card p-4">
        <h3 className="font-medium">Defense round</h3>
        <dl className="mt-3 grid gap-2 text-sm">
          <Detail label="Response" value={eligibility.defenseResponse} />
          <Detail label="Kindness result" value={eligibility.defenseKindness} />
        </dl>
        <p className="mt-3 text-sm text-muted-foreground">
          Defense round criteria and results will appear here when defined.
        </p>
      </article>
    </div>
  );
}

function SafeSpacePanel({ student }: { student: StudentDetail }) {
  const reports = student.safeSpace;
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-xl border bg-card p-4">
        <h3 className="font-medium">Safe Space overview</h3>
        <p className="mt-3 text-3xl font-semibold">{reports.reportCount}</p>
        <p className="text-sm text-muted-foreground">report</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Report count and status summary only. No student messages or report content are shown
          here.
        </p>
      </article>
      <article className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">Report status summary</h3>
          <Link href="/admin/safe-space" className="text-sm text-primary">
            Open Report →
          </Link>
        </div>
        <ul className="mt-3 grid gap-2 text-sm">
          <li className="flex justify-between">
            <span>New</span>
            <span>{reports.newCount}</span>
          </li>
          <li className="flex justify-between">
            <span>Reviewing</span>
            <span>{reports.reviewingCount}</span>
          </li>
          <li className="flex justify-between">
            <span>Addressed</span>
            <span>{reports.addressedCount}</span>
          </li>
        </ul>
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Details are restricted to authorized teachers or counselors.
        </p>
      </article>
    </div>
  );
}

function EligibilityRow({
  label,
  value,
  current,
  total,
}: {
  label: string;
  value: string;
  current: number;
  total: number;
}) {
  return (
    <div className="mt-3 rounded-lg bg-card px-3 py-2 text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span>{value}</span>
      </span>
      <Meter value={current} total={total} />
    </div>
  );
}

function Summary({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
    </article>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-primary/10 px-3 py-4 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
