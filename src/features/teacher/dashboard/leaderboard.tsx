"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeaderboardStudent, TeacherClass } from "./model";

export function LeaderboardWidget({
  students,
  classes,
  selectedClassId,
  onSelectClass,
}: {
  students: LeaderboardStudent[];
  classes: TeacherClass[];
  selectedClassId?: string;
  onSelectClass?: (classId: string) => void;
}) {
  const top1 = students.find((s) => s.rank === 1) ?? students[0];
  const top2 = students.find((s) => s.rank === 2) ?? students[1];
  const top3 = students.find((s) => s.rank === 3) ?? students[2];
  const rest = students.filter(
    (s) => s !== top1 && s !== top2 && s !== top3,
  );

  return (
    <article className="flex flex-col justify-between rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground">Leaderboard</h3>
        {classes.length > 1 ? (
          <div className="relative">
            <select
              aria-label="Select class"
              value={selectedClassId ?? ""}
              onChange={(e) => onSelectClass?.(e.target.value)}
              className="h-8 appearance-none rounded-lg border bg-background py-1 pr-7 pl-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        ) : classes.length === 1 ? (
          <span className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
            {classes[0]?.name}
          </span>
        ) : null}
      </div>

      {students.length === 0 ? (
        <div className="my-auto py-8">
          <EmptyState
            title="No leaderboard data"
            description="Students earning kindness points will appear here."
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col justify-end">
          {/* Podium for top 3 students (decision 5: avatars & names, not hero characters) */}
          <div className="grid grid-cols-3 items-end gap-2 pt-4 pb-2 text-center">
            {/* Rank 2 (Left) */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <>
                  <Avatar className="size-12 ring-2 ring-purple-400">
                    {top2.avatarUrl ? (
                      <AvatarImage src={top2.avatarUrl} alt={top2.nickname} />
                    ) : null}
                    <AvatarFallback className="bg-purple-100 text-sm font-semibold text-purple-700">
                      {top2.nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-1.5 max-w-full truncate text-xs font-medium text-foreground">
                    {top2.nickname}
                  </p>
                  <p className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                    <Sparkles className="size-2.5" />
                    {top2.kindnessPoints.toLocaleString()}
                  </p>
                  <div className="mt-2 flex h-20 w-full items-center justify-center rounded-t-xl bg-purple-100 text-lg font-bold text-purple-700">
                    2
                  </div>
                </>
              ) : (
                <div className="h-32 w-full rounded-t-xl bg-muted/40" />
              )}
            </div>

            {/* Rank 1 (Center) */}
            <div className="flex flex-col items-center">
              {top1 ? (
                <>
                  <Avatar className="size-14 ring-2 ring-emerald-500 shadow-sm">
                    {top1.avatarUrl ? (
                      <AvatarImage src={top1.avatarUrl} alt={top1.nickname} />
                    ) : null}
                    <AvatarFallback className="bg-emerald-100 text-base font-semibold text-emerald-700">
                      {top1.nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-1.5 max-w-full truncate text-xs font-semibold text-foreground">
                    {top1.nickname}
                  </p>
                  <p className="flex items-center gap-0.5 text-xs font-bold text-primary">
                    <Sparkles className="size-3" />
                    {top1.kindnessPoints.toLocaleString()}
                  </p>
                  <div className="mt-2 flex h-28 w-full items-center justify-center rounded-t-xl bg-emerald-500 text-2xl font-black text-white shadow-xs">
                    1
                  </div>
                </>
              ) : (
                <div className="h-40 w-full rounded-t-xl bg-muted/40" />
              )}
            </div>

            {/* Rank 3 (Right) */}
            <div className="flex flex-col items-center">
              {top3 ? (
                <>
                  <Avatar className="size-11 ring-2 ring-sky-400">
                    {top3.avatarUrl ? (
                      <AvatarImage src={top3.avatarUrl} alt={top3.nickname} />
                    ) : null}
                    <AvatarFallback className="bg-sky-100 text-xs font-semibold text-sky-700">
                      {top3.nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-1.5 max-w-full truncate text-xs font-medium text-foreground">
                    {top3.nickname}
                  </p>
                  <p className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                    <Sparkles className="size-2.5" />
                    {top3.kindnessPoints.toLocaleString()}
                  </p>
                  <div className="mt-2 flex h-14 w-full items-center justify-center rounded-t-xl bg-sky-100 text-base font-bold text-sky-700">
                    3
                  </div>
                </>
              ) : (
                <div className="h-24 w-full rounded-t-xl bg-muted/40" />
              )}
            </div>
          </div>

          {/* Additional ranks if any */}
          {rest.length > 0 ? (
            <ul className="mt-3 divide-y border-t pt-2 text-xs">
              {rest.slice(0, 2).map((st) => (
                <li
                  key={st.userId}
                  className="flex items-center justify-between py-1.5 text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      #{st.rank}
                    </span>
                    <span className="font-medium text-foreground">
                      {st.nickname}
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    {st.kindnessPoints} pts
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </article>
  );
}
