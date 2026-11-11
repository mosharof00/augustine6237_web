"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  HandHeart,
  MessageCircle,
  Search,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassSwitcher, type ClassSwitcherOption } from "@/features/teacher/classes/class-switcher";
import { getTeacherBadgeMonitor } from "./api";
import {
  formatShortDate,
  type BadgeDefinition,
  type BadgeMonitorData,
  type StudentBadgeMonitorRow,
} from "./model";

export interface BadgeMonitorTabProps {
  classes: ClassSwitcherOption[];
  selectedClassId?: string;
  onSelectClass: (classId: string | undefined) => void;
}

function getBadgeIcon(code: string) {
  switch (code) {
    case "KINDNESS_CHAMPION":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <Award className="size-5" />
        </div>
      );
    case "STORY_EXPLORER":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Compass className="size-5" />
        </div>
      );
    case "HELPING_HAND":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <HandHeart className="size-5" />
        </div>
      );
    case "SPEAK_UP":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <MessageCircle className="size-5" />
        </div>
      );
    case "POSITIVE_LEADER":
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Crown className="size-5" />
        </div>
      );
    case "GAME_SHOW_READY":
    default:
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <Star className="size-5" />
        </div>
      );
  }
}

export function BadgeMonitorTab({
  classes,
  selectedClassId,
  onSelectClass,
}: BadgeMonitorTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const monitorQuery = useQuery({
    queryKey: ["teacher-badge-monitor", selectedClassId, page],
    queryFn: () => getTeacherBadgeMonitor({ classId: selectedClassId, page, perPage }),
  });

  const data: BadgeMonitorData | undefined = monitorQuery.data;
  const badges: BadgeDefinition[] = useMemo(() => data?.badges ?? [], [data?.badges]);
  const rawItems: StudentBadgeMonitorRow[] = useMemo(() => data?.items ?? [], [data?.items]);

  // Filter students by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return rawItems;
    const query = searchQuery.toLowerCase();
    return rawItems.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.username?.toLowerCase().includes(query) ||
        s.nickname?.toLowerCase().includes(query) ||
        s.className?.toLowerCase().includes(query),
    );
  }, [rawItems, searchQuery]);

  // Compute earned counts per badge for top summary cards
  const badgeStats = useMemo(() => {
    const totalStudents = data?.total || rawItems.length || 1;
    return badges.map((b) => {
      let earnedCount = 0;
      rawItems.forEach((student) => {
        const hasEarned = student.badges.some(
          (sb) => (sb.code === b.code || sb.badgeId === b.id) && sb.earned,
        );
        if (hasEarned) earnedCount += 1;
      });
      return {
        ...b,
        earnedCount,
        totalStudents,
      };
    });
  }, [badges, rawItems, data?.total]);

  const totalPages = data?.lastPage ?? Math.max(1, Math.ceil((data?.total ?? 1) / perPage));

  return (
    <div className="space-y-6">
      {/* Top 6 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badgeStats.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col justify-between rounded-2xl border bg-card p-4 transition-all hover:shadow-xs"
          >
            <div className="flex items-start gap-3">
              {getBadgeIcon(badge.code)}
              <div>
                <h4 className="text-xs font-bold text-foreground">{badge.title}</h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                  {badge.description}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-2">
              <p className="text-base font-extrabold text-foreground">
                {badge.earnedCount} of {badge.totalStudents} earned
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Class Switcher Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search by name or username"
            placeholder="Search by name or username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <ClassSwitcher
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={(newClass) => {
              onSelectClass(newClass);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Matrix Grid */}
      {monitorQuery.isLoading ? (
        <div className="py-8">
          <LoadingState kind="table" count={5} columns={7} />
        </div>
      ) : monitorQuery.isError ? (
        <div className="py-8">
          <ErrorState
            message="Unable to load badge monitor data"
            onRetry={() => monitorQuery.refetch()}
          />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border bg-card py-10">
          <EmptyState
            title="No students found"
            description={
              searchQuery
                ? `No students matching "${searchQuery}"`
                : "No students enrolled in this class."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-56 text-xs font-semibold text-foreground">
                  Student
                </TableHead>
                {badges.map((b) => (
                  <TableHead
                    key={b.id}
                    className="text-center text-xs font-semibold text-foreground whitespace-nowrap"
                  >
                    {b.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/30">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0">
                        {student.avatarUrl && (
                          <AvatarImage src={student.avatarUrl} alt={student.name} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {student.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {student.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {student.className ?? "Enrolled"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {badges.map((b) => {
                    const badgeStatus = student.badges.find(
                      (sb) => sb.code === b.code || sb.badgeId === b.id,
                    );
                    const isEarned = Boolean(badgeStatus?.earned);
                    const percent = badgeStatus?.progressPercent ?? (isEarned ? 100 : 68);

                    return (
                      <TableCell key={b.id} className="text-center py-3">
                        {isEarned ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
                            title={
                              badgeStatus?.earnedAt
                                ? `Earned on ${formatShortDate(badgeStatus.earnedAt)}`
                                : "Earned"
                            }
                          >
                            ✓ Earned
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2 justify-center">
                            <div className="h-2 w-16 sm:w-20 rounded-full bg-orange-100/80 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {percent}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <div>
              Showing {filteredItems.length === 0 ? 0 : (page - 1) * perPage + 1}–
              {Math.min(page * perPage, data?.total ?? filteredItems.length)} of{" "}
              {data?.total ?? filteredItems.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="font-medium text-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
