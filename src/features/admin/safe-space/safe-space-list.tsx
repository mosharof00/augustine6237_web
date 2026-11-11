"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { ErrorState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { cn } from "@/lib/utils";
import { getAdminReports } from "./api";
import {
  calculateSummary,
  CONCERN_CATEGORIES,
  formatReportDate,
  reportStatusVariant,
  SAMPLE_REPORTS,
  type ReportStatus,
  type SafeSpaceReport,
} from "./model";
import { SafeSpaceSummarySection } from "./safe-space-summary";

const STATUS_TABS: { label: string; value: ReportStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Reviewing", value: "REVIEWING" },
  { label: "Addressed", value: "ADDRESSED" },
];

const columns: ColumnDef<DataTableFeatures, SafeSpaceReport>[] = [
  {
    accessorKey: "publicRef",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.publicRef || row.original.id.slice(0, 8)}
      </span>
    ),
  },
  {
    accessorKey: "studentName",
    header: "Student",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.studentName}
      </span>
    ),
  },
  {
    accessorKey: "className",
    header: "Class",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.className || "—"}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Concern Category",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.category}
      </span>
    ),
  },
  {
    accessorKey: "feelSafe",
    header: "Feel Safe",
    cell: ({ row }) =>
      row.original.feelSafe ? (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          Yes
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
          No
        </span>
      ),
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatReportDate(row.original.submittedAt || row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge variant={reportStatusVariant(row.original.status)} />
    ),
  },
];

export function SafeSpaceList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawStatus = searchParams.get("status");
  const activeStatus: ReportStatus | "ALL" =
    rawStatus === "NEW" || rawStatus === "REVIEWING" || rawStatus === "ADDRESSED"
      ? rawStatus
      : "ALL";

  const search = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [dateRange, setDateRange] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const reportsQuery = useQuery({
    queryKey: ["admin-safe-space-reports", activeStatus, page],
    queryFn: () =>
      getAdminReports({
        status: activeStatus === "ALL" ? undefined : activeStatus,
        page,
        perPage: 12,
      }),
    retry: false,
  });

  const allReportsQuery = useQuery({
    queryKey: ["admin-safe-space-all"],
    queryFn: () => getAdminReports({ perPage: 100 }),
    retry: false,
  });

  // Determine items: real backend data if present, otherwise sample fallback
  const dataset: SafeSpaceReport[] = useMemo(() => {
    const rawItems = reportsQuery.data?.items;
    if (rawItems && rawItems.length > 0) {
      return rawItems;
    }
    // Filter sample items if in fallback mode
    if (activeStatus === "ALL") return SAMPLE_REPORTS;
    return SAMPLE_REPORTS.filter((r) => r.status === activeStatus);
  }, [reportsQuery.data?.items, activeStatus]);

  // Compute summary metrics from all reports or sample data
  const summary = useMemo(() => {
    const allItems = allReportsQuery.data?.items;
    if (allItems && allItems.length > 0) {
      return calculateSummary(allItems);
    }
    return calculateSummary(SAMPLE_REPORTS);
  }, [allReportsQuery.data?.items]);

  // Client-side filtering for search & extra filters
  const filteredRows = useMemo(() => {
    const queryTerm = search.trim().toLowerCase();
    return dataset.filter((r) => {
      const matchesSearch =
        !queryTerm ||
        r.studentName.toLowerCase().includes(queryTerm) ||
        (r.studentNickname?.toLowerCase() ?? "").includes(queryTerm) ||
        r.publicRef.toLowerCase().includes(queryTerm) ||
        r.category.toLowerCase().includes(queryTerm) ||
        (r.className?.toLowerCase() ?? "").includes(queryTerm);

      const matchesCategory =
        !categoryFilter || r.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesClass =
        !classFilter ||
        (r.className?.toLowerCase() ?? "").includes(classFilter.toLowerCase());

      return matchesSearch && matchesCategory && matchesClass;
    });
  }, [dataset, search, categoryFilter, classFilter]);

  function replaceQuery(next: { status?: ReportStatus | "ALL"; q?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.status !== undefined) {
      if (next.status !== "ALL") params.set("status", next.status);
      else params.delete("status");
      params.delete("page");
    }
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
      params.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }
    const queryString = params.toString();
    router.replace(queryString ? `/admin/safe-space?${queryString}` : "/admin/safe-space");
  }

  // Derive unique classes for filter dropdown
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of SAMPLE_REPORTS) {
      if (r.className) set.add(r.className);
    }
    return Array.from(set);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Safe Space Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confidential reports from students. Open a report to review and follow up.
        </p>
      </div>

      {/* Summary Cards */}
      <SafeSpaceSummarySection summary={summary} />

      {/* All Reports Section */}
      <section
        aria-label="All student safe space reports"
        className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs"
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            All Reports
          </h2>
          <p className="text-xs text-muted-foreground">Find all student reports</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-4 flex items-center gap-6 border-b border-border/60 text-sm">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => replaceQuery({ status: tab.value })}
                className={cn(
                  "pb-3 font-medium transition-colors",
                  isActive
                    ? "border-b-2 border-primary font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {reportsQuery.isError ? (
          <ErrorState
            message={
              reportsQuery.error instanceof ApiError
                ? reportsQuery.error.message
                : "Could not load safe space reports."
            }
            onRetry={() => void reportsQuery.refetch()}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredRows}
            search={search}
            onSearchChange={(value) => replaceQuery({ q: value })}
            searchPlaceholder="Search by student, category"
            page={reportsQuery.data?.page ?? page}
            perPage={reportsQuery.data?.perPage ?? 12}
            total={reportsQuery.data?.total ?? filteredRows.length}
            lastPage={reportsQuery.data?.lastPage ?? 1}
            onPageChange={(nextPage) => replaceQuery({ page: nextPage })}
            isLoading={reportsQuery.isPending}
            empty="No reports found."
            getRowId={(row) => row.id}
            rowAction={(row) => (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`View report ${row.publicRef || row.id}`}
                render={<Link href={`/admin/safe-space/${row.id}`} />}
              >
                <Eye className="size-4" />
              </Button>
            )}
            filters={
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Date Range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="h-10 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Date Range</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>

                <select
                  aria-label="All classes"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="h-10 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All classes</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="All Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Category</option>
                  {CONCERN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            }
          />
        )}
      </section>
    </div>
  );
}
