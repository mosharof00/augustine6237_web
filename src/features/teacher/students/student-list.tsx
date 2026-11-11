"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { ClassSwitcher } from "@/features/teacher/classes/class-switcher";
import { getTeacherClassesList, getTeacherStudents } from "./api";
import {
  STUDENT_PER_PAGE,
  type TeacherStudentItem,
} from "./model";

const columns: ColumnDef<DataTableFeatures, TeacherStudentItem>[] = [
  {
    accessorKey: "name",
    header: "Student",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 ring-1 ring-border/50">
            {student.avatarUrl ? (
              <AvatarImage src={student.avatarUrl} alt={student.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {student.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{student.name}</p>
            <p className="text-xs text-muted-foreground">@{student.username}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "studentCode",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.studentCode}
      </span>
    ),
  },
  {
    accessorKey: "className",
    header: "Class",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {row.original.className}
      </span>
    ),
  },
  {
    accessorKey: "points",
    header: "Points",
    cell: ({ row }) => (
      <span className="font-semibold text-foreground">
        {row.original.points}
      </span>
    ),
  },
  {
    accessorKey: "progressPercent",
    header: "Progress",
    cell: ({ row }) => {
      const pct = Math.min(100, Math.max(0, row.original.progressPercent));
      return (
        <div className="flex items-center gap-2.5 min-w-28">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "reportsCount",
    header: "Reports",
    cell: ({ row }) => {
      const count = row.original.reportsCount;
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium text-xs ${
            count > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          }`}
        >
          {count > 0 && <ShieldAlert className="size-3" />}
          <span>{count}</span>
        </span>
      );
    },
  },
];

export function TeacherStudentsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const classFilter = searchParams.get("classId") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  // Load teacher's classes for the switcher
  const classesQuery = useQuery({
    queryKey: ["teacher-classes-list"],
    queryFn: getTeacherClassesList,
    retry: false,
  });

  // Load students
  const studentsQuery = useQuery({
    queryKey: ["teacher-students", page, classFilter, search],
    queryFn: () =>
      getTeacherStudents({
        page,
        perPage: STUDENT_PER_PAGE,
        classId: classFilter,
        search: search || undefined,
      }),
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
    router.replace(qStr ? `/teacher/students?${qStr}` : "/teacher/students");
  }

  const allStudents = useMemo(() => studentsQuery.data?.items ?? [], [studentsQuery.data?.items]);
  const classes = classesQuery.data ?? [];

  // Client-side search filtering fallback
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return allStudents;
    const lower = search.toLowerCase().trim();
    return allStudents.filter(
      (st) =>
        st.name.toLowerCase().includes(lower) ||
        st.username.toLowerCase().includes(lower) ||
        st.className.toLowerCase().includes(lower) ||
        st.studentCode.toLowerCase().includes(lower),
    );
  }, [allStudents, search]);

  if (studentsQuery.isPending) {
    return <LoadingState count={4} />;
  }

  if (studentsQuery.isError) {
    return (
      <ErrorState
        message={
          studentsQuery.error instanceof ApiError
            ? studentsQuery.error.message
            : "Could not load students."
        }
        onRetry={() => void studentsQuery.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-6">
      {/* Header & Class Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Students</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            View student progress, kindness points, and safe space report counts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClassSwitcher
            classes={classes}
            selectedClassId={classFilter}
            onSelectClass={(id) => updateQuery({ classId: id })}
          />
        </div>
      </div>

      {/* Roster Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        search={search}
        onSearchChange={(value) => updateQuery({ q: value })}
        searchPlaceholder="Search students by name, handle, or ID…"
        page={studentsQuery.data?.page ?? page}
        perPage={STUDENT_PER_PAGE}
        total={search ? filteredStudents.length : (studentsQuery.data?.total ?? filteredStudents.length)}
        lastPage={studentsQuery.data?.lastPage ?? 1}
        onPageChange={(nextPage) => updateQuery({ page: nextPage })}
        isLoading={studentsQuery.isPending}
        getRowId={(row) => row.id}
        rowAction={(row) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View ${row.name}`}
            render={<Link href={`/teacher/students/${row.id}`} />}
          >
            <Eye className="size-4" />
          </Button>
        )}
      />
    </div>
  );
}
