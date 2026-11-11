"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { ErrorState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { getClasses } from "./api";
import { ClassesChrome } from "./classes-chrome";
import {
  classListQuery,
  classStatusVariant,
  requestBanner,
  type SchoolClass,
} from "./model";

const columns: ColumnDef<DataTableFeatures, SchoolClass>[] = [
  { accessorKey: "name", header: "Class" },
  { accessorKey: "grade", header: "Grade" },
  { accessorKey: "ageGroup", header: "Age Group" },
  {
    id: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        {row.original.code}
        {row.original.codeExpired ? <StatusBadge variant="expired" /> : null}
      </span>
    ),
  },
  { accessorKey: "teacherName", header: "Assigned Teacher" },
  { accessorKey: "studentCount", header: "Students" },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge variant={classStatusVariant(row.original.status)} />,
  },
  { accessorKey: "createdAt", header: "Class Created" },
];

export function ClassList() {
  const router = useRouter();
  const params = useSearchParams();
  const search = params.get("q") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const query = useQuery({
    queryKey: ["admin-classes", page, search],
    queryFn: () => getClasses(classListQuery({ page, q: search })),
    retry: false,
  });

  function replaceQuery(next: { q?: string; page?: number }) {
    const value = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) value.set("q", next.q);
      else value.delete("q");
      value.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) value.set("page", String(next.page));
      else value.delete("page");
    }
    const queryString = value.toString();
    router.replace(queryString ? `/admin/classes?${queryString}` : "/admin/classes");
  }

  const pending = query.data?.pendingRequestCount ?? 0;

  return (
    <ClassesChrome
      current="classes"
      classCount={query.data?.total}
      requestCount={query.data ? pending : undefined}
    >
      {pending > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary/10 px-4 py-3">
          <p className="text-sm text-primary">{requestBanner(pending)}</p>
          <Button variant="outline" render={<Link href="/admin/classes/requests" />}>
            Review Requests
          </Button>
        </div>
      ) : null}
      {query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiError ? query.error.message : "Could not load classes."
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={query.data?.items ?? []}
          search={search}
          onSearchChange={(value) => replaceQuery({ q: value })}
          searchPlaceholder="Search by class or play mode"
          page={query.data?.page ?? page}
          perPage={classListQuery({ page }).perPage}
          total={query.data?.total ?? 0}
          lastPage={query.data?.lastPage ?? 1}
          onPageChange={(nextPage) => replaceQuery({ page: nextPage })}
          isLoading={query.isPending}
          getRowId={(row) => row.id}
          rowAction={(row) => (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`View ${row.name}`}
              render={<Link href={`/admin/classes/${row.id}`} />}
            >
              <Eye />
            </Button>
          )}
        />
      )}
    </ClassesChrome>
  );
}
