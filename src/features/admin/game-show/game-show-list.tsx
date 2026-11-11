"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { EmptyState, ErrorState, TableRowSkeleton } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { getEligibilityConfig, getMatches } from "./api";
import { EditEligibilityDialog } from "./edit-eligibility-dialog";
import { EligibilityCards } from "./eligibility-cards";
import {
  formatMatchDate,
  formatModeLabel,
  getMatchScoreDisplay,
  getWinnerLabel,
  type GameMatch,
  type MatchMode,
  type MatchPhase,
} from "./model";

const MODE_TABS: { label: string; value: "ALL" | MatchMode }[] = [
  { label: "All", value: "ALL" },
  { label: "Single Player", value: "ONE_V_ONE" },
  { label: "Multi Player", value: "FIVE_V_FIVE" },
];

const PHASE_OPTIONS: { label: string; value: "" | MatchPhase }[] = [
  { label: "All Phases", value: "" },
  { label: "Finished", value: "FINISHED" },
  { label: "Playing", value: "PLAYING" },
  { label: "Waiting", value: "WAITING" },
];

export function GameShowList() {
  const router = useRouter();
  const session = useSession();
  const params = useSearchParams();

  const search = params.get("q") ?? "";
  const modeParam = (params.get("mode") as MatchMode) || undefined;
  const phaseParam = (params.get("phase") as MatchPhase) || undefined;
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const perPage = 10;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (session.status !== "loading" && session.user?.role !== "ADMIN") {
      router.replace("/teacher");
    }
  }, [session, router]);

  const eligibilityQuery = useQuery({
    queryKey: ["admin-game-eligibility"],
    queryFn: getEligibilityConfig,
  });

  const matchesQuery = useQuery({
    queryKey: ["admin-game-matches", modeParam, phaseParam, page, search],
    queryFn: () =>
      getMatches({
        mode: modeParam,
        phase: phaseParam,
        page,
        perPage,
        search: search || undefined,
      }),
  });

  function updateQuery(next: {
    q?: string;
    mode?: string;
    phase?: string;
    page?: number;
  }) {
    const value = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) value.set("q", next.q);
      else value.delete("q");
      value.delete("page");
    }
    if (next.mode !== undefined) {
      if (next.mode && next.mode !== "ALL") value.set("mode", next.mode);
      else value.delete("mode");
      value.delete("page");
    }
    if (next.phase !== undefined) {
      if (next.phase) value.set("phase", next.phase);
      else value.delete("phase");
      value.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) value.set("page", String(next.page));
      else value.delete("page");
    }
    const queryString = value.toString();
    router.replace(
      queryString ? `/admin/game-show?${queryString}` : "/admin/game-show",
    );
  }

  const columns: ColumnDef<DataTableFeatures, GameMatch>[] = useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="font-medium text-foreground">
              {formatMatchDate(row.original.createdAt || row.original.startedAt)}
            </span>
            <div className="text-xs text-muted-foreground font-mono">
              {row.original.id}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "className",
        header: "Class",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.className || "Grade 4 • Amber"}
          </span>
        ),
      },
      {
        id: "mode",
        header: "Play Mode",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              row.original.mode === "FIVE_V_FIVE"
                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
            )}
          >
            {formatModeLabel(row.original.mode)}
          </Badge>
        ),
      },
      {
        id: "players",
        header: "Players",
        cell: ({ row }) => {
          const m = row.original;
          const p1 = m.participants?.[0];
          const p2 = m.participants?.[1];

          if (m.mode === "ONE_V_ONE" || m.mode === "SINGLE") {
            return (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Avatar className="size-6">
                    <AvatarImage src={p1?.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {p1?.nickname?.slice(0, 2).toUpperCase() || "P1"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                    {p1?.nickname || "Player 1"}
                  </span>
                </div>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  VS
                </span>
                <div className="flex items-center gap-1.5">
                  <Avatar className="size-6">
                    <AvatarImage src={p2?.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-secondary/30 text-secondary-foreground">
                      {p2?.nickname?.slice(0, 2).toUpperCase() || "P2"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                    {p2?.nickname || "Player 2"}
                  </span>
                </div>
              </div>
            );
          }

          // 5v5 Multi Player
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground">Team A</span>
              </div>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                VS
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground">Team B</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "score",
        header: "Winning Score",
        cell: ({ row }) => {
          const scores = getMatchScoreDisplay(row.original);
          return (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-foreground">
                {scores.winningScore}
              </span>
              <span className="text-xs text-muted-foreground">
                ({scores.teamA} - {scores.teamB})
              </span>
            </div>
          );
        },
      },
      {
        id: "winner",
        header: "Winner",
        cell: ({ row }) => {
          const winner = getWinnerLabel(row.original);
          return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {winner}
            </div>
          );
        },
      },
    ],
    [],
  );

  if (session.status === "loading" || session.user?.role !== "ADMIN") {
    return null;
  }

  const activeModeTab = modeParam ?? "ALL";

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Game Show Activity
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor classroom gameshow activity, scores, and configure eligibility rules
        </p>
      </div>

      {/* Eligibility Rules Section */}
      {eligibilityQuery.isLoading ? (
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <TableRowSkeleton columns={3} />
        </div>
      ) : eligibilityQuery.isError ? (
        <ErrorState
          message="Could not load game show rules."
          onRetry={() => void eligibilityQuery.refetch()}
        />
      ) : eligibilityQuery.data ? (
        <EligibilityCards
          config={eligibilityQuery.data}
          onEdit={() => setIsEditDialogOpen(true)}
        />
      ) : null}

      {/* Match History Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Match History
          </h2>
          <p className="text-sm text-muted-foreground">
            Classroom gameshow history
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Mode Tabs */}
          <div className="inline-flex rounded-xl bg-muted p-1">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateQuery({ mode: tab.value })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  activeModeTab === tab.value
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Phase Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by Phase"
              value={phaseParam ?? ""}
              onChange={(e) => updateQuery({ phase: e.target.value })}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PHASE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matches Table */}
        {matchesQuery.isError ? (
          <ErrorState
            message="Could not load match history."
            onRetry={() => void matchesQuery.refetch()}
          />
        ) : (
          <DataTable
            columns={columns}
            data={matchesQuery.data?.items ?? []}
            search={search}
            onSearchChange={(value) => updateQuery({ q: value })}
            searchPlaceholder="Search by class or play mode"
            page={matchesQuery.data?.page ?? page}
            perPage={perPage}
            total={matchesQuery.data?.total ?? 0}
            lastPage={matchesQuery.data?.lastPage ?? 1}
            onPageChange={(nextPage) => updateQuery({ page: nextPage })}
            isLoading={matchesQuery.isPending}
            getRowId={(row) => row.id}
            empty={
              <EmptyState
                title="No game matches found"
                description="There is no match history matching your current filter criteria."
              />
            }
            rowAction={(row) => (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`View details for match ${row.id}`}
                className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary"
                render={<Link href={`/admin/game-show/${row.id}`} />}
              >
                <Eye className="size-4" />
                View
              </Button>
            )}
          />
        )}
      </div>

      {/* Edit Eligibility Dialog */}
      {eligibilityQuery.data && (
        <EditEligibilityDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          config={eligibilityQuery.data}
          onSaved={() => {
            void eligibilityQuery.refetch();
          }}
        />
      )}
    </div>
  );
}
