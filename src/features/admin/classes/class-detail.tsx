"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "cn";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { getStaff } from "@/features/admin/staff/api";
import { studentStatusVariant } from "@/features/admin/students/model";
import { ApiError } from "@/lib/api/envelope";
import { getClass, regenerateCode } from "./api";
import { ChangeTeacherDialog } from "./change-teacher-dialog";
import { CodeDialog } from "./code-dialog";
import {
  classStatusVariant,
  teacherChoices,
  type ClassStudent,
  type IssuedCode,
} from "./model";

const columns: ColumnDef<DataTableFeatures, ClassStudent>[] = [
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => (
      <span>
        <span className="block font-medium">{row.original.name}</span>
        <span className="block text-xs text-muted-foreground">@{row.original.handle}</span>
      </span>
    ),
  },
  { accessorKey: "studentCode", header: "ID" },
  { accessorKey: "className", header: "Class" },
  { accessorKey: "positivePoints", header: "Positive Points" },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => <span>{row.original.progressPercent}%</span>,
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

export function ClassDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"overview" | "students">("overview");
  const [changing, setChanging] = useState(false);
  const [issued, setIssued] = useState<IssuedCode | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-classes", id],
    queryFn: () => getClass(id),
    retry: false,
  });
  const teachers = useQuery({
    queryKey: ["admin-staff", "teachers"],
    queryFn: () => getStaff({ page: 1, perPage: 100 }),
    enabled: changing,
    retry: false,
  });

  const roster = query.data?.students;
  const filtered = useMemo(() => {
    if (!roster) return [];
    const q = studentSearch.trim().toLowerCase();
    return roster.filter((student) => {
      const matchesQuery =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.handle.toLowerCase().includes(q);
      const matchesStatus = !studentStatus || student.status === studentStatus;
      return matchesQuery && matchesStatus;
    });
  }, [roster, studentSearch, studentStatus]);
  const perPage = 12;
  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(studentPage, lastPage);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  if (query.isPending) return <LoadingState count={2} />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={query.error instanceof ApiError ? query.error.message : "Could not load this class."}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const schoolClass = query.data;

  async function onCopy() {
    await navigator.clipboard.writeText(schoolClass.code);
    toastSuccess({ title: "Code copied", description: schoolClass.code });
  }

  async function onRegenerate() {
    try {
      const next = await regenerateCode(schoolClass.id);
      setIssued(next);
      void queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not regenerate the code.");
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/classes" className="hover:text-foreground">
          Classes
        </Link>
        {" / "}
        <span className="text-foreground">{schoolClass.name}</span>
      </p>
      <div>
        <h2 className="text-2xl font-semibold">{schoolClass.name}</h2>
        <p className="text-sm text-muted-foreground">
          Class code {schoolClass.code} · {schoolClass.studentCount} students
        </p>
      </div>
      <div className="flex gap-4 border-b">
        {(["overview", "students"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-current={tab === item ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-1 pb-2 text-sm capitalize",
              tab === item
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground",
            )}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Students" value={String(schoolClass.studentCount)} caption="Students in this class." />
            <Metric
              label="Avg. reading progress"
              value={`${schoolClass.readingProgressPercent}%`}
              caption="Average progress by students"
            />
            <Metric
              label="Avg. quiz score"
              value={`${schoolClass.quizScorePercent}%`}
              caption="Average score achieved by students."
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
            <article className="rounded-xl border bg-card p-4">
              <h3 className="font-medium">Class Details</h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Class Name" value={schoolClass.name} />
                <Field
                  label="Status"
                  value={<StatusBadge variant={classStatusVariant(schoolClass.status)} />}
                />
                <Field label="Grade" value={schoolClass.grade} />
                <Field label="Created By" value={schoolClass.createdBy} />
                <Field label="Age Group" value={schoolClass.ageGroup} />
                <Field label="Created On" value={schoolClass.createdAt} />
              </dl>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Class Invite Code</p>
                  <p className="text-primary">[{schoolClass.code}]</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => void onRegenerate()}>
                    Regenerate
                  </Button>
                  <Button type="button" onClick={() => void onCopy()}>
                    Copy
                  </Button>
                </div>
              </div>
            </article>
            <article className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">Assigned Teacher</h3>
                <button
                  type="button"
                  className="text-sm text-primary"
                  onClick={() => setChanging(true)}
                >
                  Change →
                </button>
              </div>
              <p className="mt-4 font-medium">{schoolClass.teacher.name}</p>
              <p className="text-sm text-muted-foreground">@{schoolClass.teacher.handle}</p>
              <p className="mt-2 text-sm text-primary">ID: {schoolClass.teacher.staffCode}</p>
            </article>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <div>
            <h3 className="text-lg font-medium">All Students</h3>
            <p className="text-sm text-muted-foreground">Students in this class.</p>
          </div>
          <DataTable
            columns={columns}
            data={rows}
            search={studentSearch}
            onSearchChange={(value) => {
              setStudentSearch(value);
              setStudentPage(1);
            }}
            searchPlaceholder="Search by name or username"
            filters={
              <select
                aria-label="Status"
                value={studentStatus}
                onChange={(event) => {
                  setStudentStatus(event.target.value);
                  setStudentPage(1);
                }}
                className="h-10 rounded-full border bg-background px-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            }
            page={page}
            perPage={perPage}
            total={filtered.length}
            lastPage={lastPage}
            onPageChange={setStudentPage}
            getRowId={(row) => row.id}
            rowAction={(row) => (
              <Button
                variant="outline"
                render={<Link href={`/admin/users/students/${row.id}`} />}
              >
                View
              </Button>
            )}
          />
        </div>
      )}
      <ChangeTeacherDialog
        classId={schoolClass.id}
        teacher={schoolClass.teacher}
        teachers={teacherChoices(teachers.data?.items ?? [])}
        open={changing}
        onOpenChange={setChanging}
        onChanged={() => {
          toastSuccess({
            title: "Teacher updated",
            description: `${schoolClass.name} has a new teacher.`,
          });
          void queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
        }}
      />
      <CodeDialog
        open={issued !== null}
        onOpenChange={(open) => {
          if (!open) setIssued(null);
        }}
        title="Successfully Created New Code!"
        classLabel={issued?.className ?? schoolClass.name}
        code={issued?.code ?? ""}
      />
    </div>
  );
}

function Metric({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-medium">{label}</h3>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
    </article>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
