"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Clock, Eye, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { getTeacherClasses } from "./api";
import { ClassSwitcher } from "./class-switcher";
import {
  CLASS_PER_PAGE,
  formatClassCode,
  formatClassName,
  pendingBannerText,
  type TeacherClassRow,
} from "./model";

const columns: ColumnDef<DataTableFeatures, TeacherClassRow>[] = [
  {
    accessorKey: "name",
    header: "Class",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {formatClassName(row.original.name, row.original.gradeLabel)}
      </span>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {formatClassCode(row.original.code)}
      </span>
    ),
  },
  {
    accessorKey: "studentCount",
    header: "Students",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 text-foreground">
        <Users className="size-3.5 text-muted-foreground" />
        <span>{row.original.studentCount}</span>
      </span>
    ),
  },
  {
    accessorKey: "pendingCount",
    header: "Pending",
    cell: ({ row }) => {
      const count = row.original.pendingCount;
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            count > 0
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Clock className="size-3" />
          <span>{count} pending</span>
        </span>
      );
    },
  },
  {
    accessorKey: "progressPercent",
    header: "Progress",
    cell: ({ row }) => {
      const pct = Math.min(100, Math.max(0, row.original.progressPercent));
      return (
        <div className="flex items-center gap-3 min-w-32">
          <div className="relative h-2 w-24 overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastActivity",
    header: "Last activity",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.lastActivity}</span>
    ),
  },
];

export function TeacherClassesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const classFilter = searchParams.get("classId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const query = useQuery({
    queryKey: ["teacher-classes", page],
    queryFn: () => getTeacherClasses({ page, perPage: CLASS_PER_PAGE }),
    retry: false,
  });

  function updateQuery(next: { q?: string; page?: number; classId?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
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
    router.replace(qStr ? `/teacher/classes?${qStr}` : "/teacher/classes");
  }

  const allItems = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  // Client-side filtering when search or class filter is active
  const filteredItems = useMemo(() => {
    let list = allItems;
    if (classFilter) {
      list = list.filter((cls) => cls.id === classFilter);
    }
    if (search.trim()) {
      const lower = search.toLowerCase().trim();
      list = list.filter(
        (cls) =>
          cls.name.toLowerCase().includes(lower) ||
          (cls.gradeLabel && cls.gradeLabel.toLowerCase().includes(lower)) ||
          cls.code.toLowerCase().includes(lower),
      );
    }
    return list;
  }, [allItems, classFilter, search]);

  const totalPending = allItems.reduce((acc, curr) => acc + curr.pendingCount, 0);

  if (query.isPending) {
    return <LoadingState count={3} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={
          query.error instanceof ApiError
            ? query.error.message
            : "Could not load your classes."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-6">
      {/* Header and Class Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Classes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your classes, join codes, and student enrollment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClassSwitcher
            classes={allItems}
            selectedClassId={classFilter}
            onSelectClass={(id) => updateQuery({ classId: id })}
          />
        </div>
      </div>

      {/* Pending requests banner */}
      {totalPending > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              <Clock className="size-4" />
            </span>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              {pendingBannerText(totalPending)}
            </p>
          </div>
          {allItems.find((c) => c.pendingCount > 0) ? (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200"
              render={
                <Link
                  href={`/teacher/classes/${allItems.find((c) => c.pendingCount > 0)?.id}?tab=students`}
                />
              }
            >
              Review Requests
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        search={search}
        onSearchChange={(value) => updateQuery({ q: value })}
        searchPlaceholder="Search classes by name, grade, or code…"
        page={query.data?.page ?? page}
        perPage={CLASS_PER_PAGE}
        total={search || classFilter ? filteredItems.length : (query.data?.total ?? filteredItems.length)}
        lastPage={query.data?.lastPage ?? 1}
        onPageChange={(nextPage) => updateQuery({ page: nextPage })}
        isLoading={query.isPending}
        getRowId={(row) => row.id}
        rowAction={(row) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View ${formatClassName(row.name, row.gradeLabel)}`}
            render={<Link href={`/teacher/classes/${row.id}`} />}
          >
            <Eye className="size-4" />
          </Button>
        )}
      />
    </div>
  );
}
