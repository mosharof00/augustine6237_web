"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { cn } from "@/lib/utils";
import { ClassSwitcher } from "@/features/teacher/classes/class-switcher";
import { getTeacherClassesList, getTeacherSafeSpaceReports } from "./api";
import {
  formatFeelSafe,
  formatReportDate,
  reportStatusVariant,
  SAMPLE_TEACHER_REPORTS,
  STATUS_TABS,
  type ReportStatus,
  type SafeSpaceReportItem,
} from "./model";
import { SafeSpacePreviewModal } from "./safe-space-preview-modal";

export function SafeSpaceList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawStatus = searchParams.get("status")?.toUpperCase();
  const activeStatus: ReportStatus | "ALL" =
    rawStatus === "NEW" || rawStatus === "REVIEWING" || rawStatus === "ADDRESSED"
      ? rawStatus
      : "ALL";

  const classFilter = searchParams.get("classId") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const perPage = 10;

  const [selectedReport, setSelectedReport] = useState<SafeSpaceReportItem | null>(null);

  // Load teacher's classes for switcher
  const classesQuery = useQuery({
    queryKey: ["teacher-safe-space-classes"],
    queryFn: getTeacherClassesList,
    retry: false,
  });

  // Load safe space reports
  const reportsQuery = useQuery({
    queryKey: ["teacher-safe-space-reports", activeStatus, page],
    queryFn: () =>
      getTeacherSafeSpaceReports({
        status: activeStatus === "ALL" ? undefined : activeStatus,
        page,
        perPage,
      }),
    retry: false,
  });

  function updateQuery(next: { status?: string; classId?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.status !== undefined) {
      if (next.status && next.status !== "ALL") params.set("status", next.status);
      else params.delete("status");
      params.delete("page");
    }
    if (next.classId !== undefined) {
      if (next.classId) params.set("classId", next.classId);
      else params.delete("classId");
      params.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }
    const qStr = params.toString();
    router.replace(qStr ? `/teacher/safe-space?${qStr}` : "/teacher/safe-space");
  }

  const classes = classesQuery.data ?? [];

  // Determine source reports (from API or sample fallback if API data is undefined)
  const baseReports = useMemo(() => {
    if (reportsQuery.data) {
      return reportsQuery.data.items;
    }
    // Fallback when query is idle/testing without backend
    if (activeStatus === "ALL") return SAMPLE_TEACHER_REPORTS;
    return SAMPLE_TEACHER_REPORTS.filter((r) => r.status === activeStatus);
  }, [reportsQuery.data, activeStatus]);

  // Filter reports by selected class
  const filteredReports = useMemo(() => {
    let list = baseReports;
    if (classFilter) {
      list = list.filter(
        (r) =>
          r.classId === classFilter ||
          r.className.toLowerCase().includes(classFilter.toLowerCase()),
      );
    }
    if (activeStatus !== "ALL") {
      list = list.filter((r) => r.status === activeStatus);
    }
    return list;
  }, [baseReports, classFilter, activeStatus]);

  const totalReports = reportsQuery.data?.total ?? filteredReports.length;
  const lastPage = reportsQuery.data?.lastPage ?? Math.max(1, Math.ceil(totalReports / perPage));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Safe Space reports
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Confidential reports from students. Open a report to review and follow up.
          </p>
        </div>
        {classes.length > 0 && (
          <div className="flex items-center gap-3">
            <ClassSwitcher
              classes={classes}
              selectedClassId={classFilter}
              onSelectClass={(id) => updateQuery({ classId: id ?? "" })}
            />
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div
        role="note"
        aria-label="Privacy notice"
        className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-[#FFF7EE] px-4 py-3 text-xs font-medium text-[#C2410C] dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
      >
        <Lock className="size-4 shrink-0 text-[#EA580C] dark:text-amber-400" />
        <span>
          List rows show reference, class and status only. Report content opens on the detail page.
        </span>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-border">
        <nav
          className="-mb-px flex space-x-8"
          aria-label="Filter reports by status"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateQuery({ status: tab.value })}
                className={cn(
                  "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      {reportsQuery.isPending && !reportsQuery.data ? (
        <LoadingState count={4} />
      ) : reportsQuery.isError ? (
        <ErrorState
          message={
            reportsQuery.error instanceof ApiError
              ? reportsQuery.error.message
              : "Could not load Safe Space reports. Please try again."
          }
          onRetry={() => reportsQuery.refetch()}
        />
      ) : (
        <article className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-base font-semibold text-foreground">
              Reports and approvals
            </h2>
            {totalReports > perPage && (
              <span className="text-xs text-muted-foreground">
                Showing {filteredReports.length} of {totalReports} reports
              </span>
            )}
          </div>

          {filteredReports.length === 0 ? (
            <div className="py-10">
              <EmptyState
                title="No Safe Space reports"
                description={
                  activeStatus !== "ALL"
                    ? `No reports found with status "${activeStatus.toLowerCase()}".`
                    : classFilter
                      ? "No reports found for the selected class."
                      : "Safe Space reports from your students will appear here."
                }
              />
            </div>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-medium text-muted-foreground">
                    <th className="pb-3 pr-4 font-normal">Reference</th>
                    <th className="pb-3 pr-4 font-normal">Student</th>
                    <th className="pb-3 pr-4 font-normal">Class</th>
                    <th className="pb-3 pr-4 font-normal">Category</th>
                    <th className="pb-3 pr-4 font-normal">Feel Safe</th>
                    <th className="pb-3 pr-4 font-normal">Submitted</th>
                    <th className="pb-3 pr-4 font-normal">Status</th>
                    <th className="pb-3 text-right font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {filteredReports.map((report) => {
                    const feelSafeInfo = formatFeelSafe(report.feelSafe);
                    return (
                      <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 pr-4 font-medium text-foreground">
                          {report.publicRef}
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-7 ring-1 ring-border/40">
                              {report.avatarUrl ? (
                                <AvatarImage src={report.avatarUrl} alt={report.studentName} />
                              ) : null}
                              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                                {report.studentName.slice(0, 2).toUpperCase() || (
                                  <User className="size-3" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {report.studentName}
                              </p>
                              {report.studentNickname ? (
                                <p className="text-[11px] text-muted-foreground">
                                  @{report.studentNickname}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-muted-foreground">
                          {report.className || "—"}
                        </td>
                        <td className="py-3.5 pr-4 text-muted-foreground">
                          {report.category}
                        </td>
                        <td className="py-3.5 pr-4">
                          {report.feelSafe ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <ShieldCheck className="size-3 shrink-0" />
                              {feelSafeInfo.shortLabel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                              <ShieldAlert className="size-3 shrink-0" />
                              {feelSafeInfo.shortLabel}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">
                          {formatReportDate(report.submittedAt || report.createdAt)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <StatusBadge variant={reportStatusVariant(report.status)} />
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedReport(report)}
                            aria-label={`View report ${report.publicRef}`}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination controls when multiple pages exist */}
              {lastPage > 1 && (
                <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>
                    Page {page} of {lastPage}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => updateQuery({ page: page - 1 })}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronLeft className="size-3.5 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= lastPage}
                      onClick={() => updateQuery({ page: page + 1 })}
                      className="h-7 px-2 text-xs"
                    >
                      Next
                      <ChevronRight className="size-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </article>
      )}

      {/* Confidential Report Preview Modal (In-page preview without detail route) */}
      <SafeSpacePreviewModal
        report={selectedReport}
        open={selectedReport !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedReport(null);
        }}
      />
    </div>
  );
}
