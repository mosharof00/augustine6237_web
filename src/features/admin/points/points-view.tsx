"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toastSuccess } from "@/components/feedback/toast";
import {
  getBadges,
  getPointRules,
  getPointsHistory,
  updateBadges,
  updatePointRules,
} from "./api";
import { BadgesSection } from "./badges-section";
import {
  DEFAULT_POINT_RULES,
  DEFAULT_SUMMARY,
  HISTORY_PER_PAGE,
  type PointRules,
} from "./model";
import { PointRulesSection } from "./point-rules-section";
import { PointsHistoryTable } from "./points-history-table";
import { PointsSummary } from "./points-summary";

export function PointsView() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();

  const search = params.get("q") ?? "";
  const classId = params.get("classId") ?? "";
  const dateRange = params.get("dateRange") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  function replaceQuery(next: {
    q?: string;
    classId?: string;
    dateRange?: string;
    page?: number;
  }) {
    const value = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) value.set("q", next.q);
      else value.delete("q");
      value.delete("page");
    }
    if (next.classId !== undefined) {
      if (next.classId) value.set("classId", next.classId);
      else value.delete("classId");
      value.delete("page");
    }
    if (next.dateRange !== undefined) {
      if (next.dateRange) value.set("dateRange", next.dateRange);
      else value.delete("dateRange");
      value.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) value.set("page", String(next.page));
      else value.delete("page");
    }
    const queryString = value.toString();
    router.replace(queryString ? `/admin/points?${queryString}` : "/admin/points");
  }

  const rulesQuery = useQuery({
    queryKey: ["admin-point-rules"],
    queryFn: getPointRules,
  });

  const badgesQuery = useQuery({
    queryKey: ["admin-badges"],
    queryFn: getBadges,
  });

  const historyQuery = useQuery({
    queryKey: ["admin-points-history", page, search, classId, dateRange],
    queryFn: () =>
      getPointsHistory({
        page,
        perPage: HISTORY_PER_PAGE,
        q: search,
        classId,
        dateRange,
      }),
  });

  const rulesMutation = useMutation({
    mutationFn: (nextRules: PointRules) => updatePointRules(nextRules),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-point-rules"], data);
      toastSuccess({
        title: "Point rules updated",
        description: "New point values have been saved.",
      });
    },
  });

  const badgesMutation = useMutation({
    mutationFn: (updates: { code: string; threshold: number }[]) =>
      updateBadges(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-badges"], data);
      toastSuccess({
        title: "Badges updated",
        description: "Badge thresholds have been saved.",
      });
    },
  });

  const summary = rulesQuery.data?.summary ?? DEFAULT_SUMMARY;
  const rules = rulesQuery.data?.rules ?? DEFAULT_POINT_RULES;
  const badges = badgesQuery.data ?? [];
  const historyData = historyQuery.data ?? {
    items: [],
    total: 0,
    page: 1,
    perPage: HISTORY_PER_PAGE,
    lastPage: 1,
    classOptions: [],
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Badges &amp; Points
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage point categories, student point history, and badge criteria
        </p>
      </div>

      {/* Summary Cards */}
      <PointsSummary summary={summary} />

      {/* Point Rules */}
      <PointRulesSection
        initialRules={rules}
        onSave={async (updated) => {
          await rulesMutation.mutateAsync(updated);
        }}
        isSaving={rulesMutation.isPending}
      />

      {/* Badges */}
      <BadgesSection
        badges={badges}
        onSaveBadges={async (updates) => {
          await badgesMutation.mutateAsync(updates);
        }}
        isSaving={badgesMutation.isPending}
      />

      {/* Points History */}
      <PointsHistoryTable
        data={historyData}
        search={search}
        onSearchChange={(q) => replaceQuery({ q })}
        dateRange={dateRange}
        onDateRangeChange={(r) => replaceQuery({ dateRange: r })}
        classId={classId}
        onClassIdChange={(c) => replaceQuery({ classId: c })}
        page={page}
        onPageChange={(p) => replaceQuery({ page: p })}
        isLoading={historyQuery.isLoading}
        classOptions={historyData.classOptions}
      />
    </div>
  );
}
