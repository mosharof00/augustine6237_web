import { ArrowRight, Award } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RecentAward } from "./model";

export function RecentAwards({ awards }: { awards: RecentAward[] }) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Class wise story progress</h3>
        <Link
          href="/teacher/points"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
        >
          Award points
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {awards.length === 0 ? (
        <div className="py-6">
          <EmptyState
            title="No recent awards"
            description="Student kindness and effort awards will appear here."
          />
        </div>
      ) : (
        <ul className="mt-4 divide-y">
          {awards.map((award) => (
            <li
              key={award.id}
              className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  {award.avatarUrl ? (
                    <AvatarImage src={award.avatarUrl} alt={award.student} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {award.student.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {award.student}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {award.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-xs font-semibold text-foreground">
                  {typeof award.points === "number" ? (
                    `${award.points} points`
                  ) : (
                    <>
                      <Award className="size-3 text-primary" />
                      {award.points}
                    </>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">{award.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
