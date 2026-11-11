"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { ErrorState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
import { UserManagementTabs } from "@/features/admin/staff/user-tabs";
import { ApiError } from "@/lib/api/envelope";
import { approveStudent, getStudents, updateStudentStatus } from "./api";
import {
  studentListQuery,
  studentStatusVariant,
  type StudentRow,
} from "./model";
import { StudentActions } from "./student-actions";

const columns: ColumnDef<DataTableFeatures, StudentRow>[] = [
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
          {row.original.name.slice(0, 1)}
        </span>
        <span>
          <span className="block font-medium">{row.original.name}</span>
          <span className="block text-xs text-muted-foreground">@{row.original.handle}</span>
        </span>
      </span>
    ),
  },
  { accessorKey: "studentCode", header: "ID" },
  { accessorKey: "className", header: "Class" },
  { accessorKey: "positivePoints", header: "Positive Points" },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => <ProgressMeter percent={row.original.progressPercent} />,
  },
  { accessorKey: "reportCount", header: "Reports" },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge variant={studentStatusVariant(row.original.status)} />
    ),
  },
];

function ProgressMeter({ percent }: { percent: number }) {
  const width = Math.min(100, Math.max(0, percent));
  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-24 overflow-hidden rounded-full bg-primary/15">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </span>
      <span className="text-sm text-muted-foreground">{percent}%</span>
    </span>
  );
}

export function StudentList({ pending = false }: { pending?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const search = params.get("q") ?? "";
  const classId = params.get("classId") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const path = pending ? "/admin/users/pending" : "/admin/users/students";

  const query = useQuery({
    queryKey: ["admin-students", pending, page, search, classId],
    queryFn: () => getStudents(studentListQuery({ page, q: search, classId, pending })),
    retry: false,
  });

  function replaceQuery(next: { q?: string; classId?: string; page?: number }) {
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
    if (next.page !== undefined) {
      if (next.page > 1) value.set("page", String(next.page));
      else value.delete("page");
    }
    const queryString = value.toString();
    router.replace(queryString ? `${path}?${queryString}` : path);
  }

  async function onReview(student: StudentRow) {
    try {
      await approveStudent(student.id);
      toastSuccess({
        title: "Student approved",
        description: `${student.name} is active.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not approve this student.");
    }
  }

  async function onReactivate(student: StudentRow) {
    try {
      await updateStudentStatus(student.id, "ACTIVE");
      toastSuccess({
        title: "Account reactivated",
        description: `${student.name} is active.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not reactivate this student.");
    }
  }

  const options = query.data?.classOptions ?? [];

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Students</h2>
        <p className="text-sm text-muted-foreground">Find any student across your classes.</p>
      </div>
      <UserManagementTabs current={pending ? "pending" : "students"} />
      {query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiError
              ? query.error.message
              : "Could not load students."
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={query.data?.items ?? []}
          search={search}
          onSearchChange={(value) => replaceQuery({ q: value })}
          searchPlaceholder="Search by name or username"
          filters={
            <select
              aria-label="Class"
              value={classId}
              onChange={(event) => replaceQuery({ classId: event.target.value })}
              className="h-10 rounded-full border bg-background px-3 text-sm"
            >
              <option value="">All classes</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          }
          page={query.data?.page ?? page}
          perPage={studentListQuery({ page }).perPage}
          total={query.data?.total ?? 0}
          lastPage={query.data?.lastPage ?? 1}
          onPageChange={(nextPage) => replaceQuery({ page: nextPage })}
          isLoading={query.isPending}
          empty={pending ? "No students are waiting for approval." : undefined}
          getRowId={(row) => row.id}
          rowAction={(row) => (
            <StudentActions
              student={row}
              onReview={(student) => void onReview(student)}
              onReactivate={(student) => void onReactivate(student)}
            />
          )}
        />
      )}
    </div>
  );
}
