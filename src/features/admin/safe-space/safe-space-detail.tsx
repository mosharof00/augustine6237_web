"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileText,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import {
  addAdminReportNote,
  getAdminReport,
  getTeachersList,
  updateAdminReport,
} from "./api";
import { ChangeStatusDialog } from "./change-status-dialog";
import { ChangeTeacherDialog } from "./change-teacher-dialog";
import {
  formatReportDate,
  reportStatusVariant,
  SAMPLE_REPORTS,
  type SafeSpaceReportDetail,
} from "./model";

export function SafeSpaceDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const [changingTeacher, setChangingTeacher] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  // Query single report detail
  const reportQuery = useQuery({
    queryKey: ["admin-safe-space-report", id],
    queryFn: () => getAdminReport(id),
    retry: false,
  });

  // Query teachers for assignment
  const teachersQuery = useQuery({
    queryKey: ["admin-staff", "teachers"],
    queryFn: getTeachersList,
    retry: false,
  });

  // Find sample report fallback if query has no real record (for preview/dev)
  const report: SafeSpaceReportDetail | undefined = useMemo(() => {
    if (reportQuery.data) return reportQuery.data;
    const match = SAMPLE_REPORTS.find((r) => r.id === id || r.publicRef === id);
    return match ?? SAMPLE_REPORTS[0];
  }, [reportQuery.data, id]);

  // Mutation: assign initial teacher
  const assignMutation = useMutation({
    mutationFn: (teacherId: string) =>
      updateAdminReport(report?.id ?? id, {
        assigneeId: teacherId,
        status: report?.status === "NEW" ? "REVIEWING" : undefined,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-safe-space-report", id], data);
      void queryClient.invalidateQueries({ queryKey: ["admin-safe-space-reports"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-safe-space-all"] });
      setSelectedTeacherId("");
      toastSuccess({
        title: "Teacher assigned",
        description: "Report assignment updated successfully.",
      });
    },
  });

  // Mutation: add staff note
  const noteMutation = useMutation({
    mutationFn: (body: string) =>
      addAdminReportNote(report?.id ?? id, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-safe-space-report", id],
      });
      setNoteBody("");
      setNoteError(null);
      toastSuccess({
        title: "Note added",
        description: "Your note has been attached to the report.",
      });
    },
    onError: (err) => {
      setNoteError(
        err instanceof ApiError ? err.message : "Failed to add note.",
      );
    },
  });

  if (reportQuery.isPending && !report) {
    return <LoadingState count={3} />;
  }

  if (reportQuery.isError && !report) {
    return (
      <ErrorState
        message={
          reportQuery.error instanceof ApiError
            ? reportQuery.error.message
            : "Could not load report details."
        }
        onRetry={() => void reportQuery.refetch()}
      />
    );
  }

  if (!report) {
    return (
      <ErrorState
        message="Report not found."
        onRetry={() => void reportQuery.refetch()}
      />
    );
  }

  const teachers = teachersQuery.data ?? [];
  const assignedTeacher = report.assignee;

  // Filter notes into staff/admin and teacher notes
  const notes = report.notes ?? [];
  const teacherNotes = notes.filter(
    (n) => n.author?.role === "TEACHER" || n.authorId === report.assigneeId,
  );
  const adminNotes = notes.filter(
    (n) => n.author?.role !== "TEACHER" && n.authorId !== report.assigneeId,
  );

  function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeacherId) return;
    assignMutation.mutate(selectedTeacherId);
  }

  function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = noteBody.trim();
    if (!trimmed) {
      setNoteError("Note cannot be empty");
      return;
    }
    setNoteError(null);
    noteMutation.mutate(trimmed);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link
          href="/admin/safe-space"
          className="transition-colors hover:text-foreground"
        >
          Safe Space Reports
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">Report Details</span>
      </nav>

      {/* Title & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {report.studentName || report.studentNickname || "Student"}
            </h1>
            <StatusBadge variant={reportStatusVariant(report.status)} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChangingStatus(true)}
              className="h-7 rounded-full text-xs"
            >
              Change status
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Report ID: {report.publicRef || report.id}
          </p>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Metadata Card */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/60 bg-muted/30 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Class Name</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {report.className || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Concern Category</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {report.category}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted On</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatReportDate(report.submittedAt || report.createdAt)}
              </p>
            </div>
          </div>

          {/* What the student shared */}
          <section
            aria-label="Student shared narrative"
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-primary" />
              <span>What the student shared</span>
            </div>
            <div className="mt-3 rounded-xl border border-orange-100 bg-[#FFF8F4] p-4 text-sm leading-relaxed text-foreground/90 dark:border-orange-950/40 dark:bg-[#2A1E17]">
              {report.body || "No statement provided."}
            </div>
          </section>

          {/* Student Safety Indicator */}
          <section
            aria-label="Student safety indicator"
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
          >
            <h2 className="text-sm font-semibold text-foreground">Student Safety</h2>
            <div className="mt-3">
              {report.feelSafe ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>Feel safe right now</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-semibold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                  <span>Does not feel safe right now</span>
                </div>
              )}
            </div>
          </section>

          {/* Add a Note & Notes Feed */}
          <section
            aria-label="Staff notes"
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Pencil className="size-4 text-primary" />
              <span>Add a Note</span>
            </div>

            <form onSubmit={handleNoteSubmit} className="mt-3 space-y-3">
              <textarea
                aria-label="Note content"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="add notes if needed to the authorized teacher....."
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {noteError ? (
                <p role="alert" className="text-xs text-destructive">
                  {noteError}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={noteMutation.isPending}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {noteMutation.isPending ? "Adding..." : "Add Note"}
                </Button>
              </div>
            </form>

            {/* Notes List / Empty placeholder */}
            <div className="mt-4 space-y-2">
              {adminNotes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                  Admin Note: Notes will appear here
                </div>
              ) : (
                <div className="space-y-2">
                  {adminNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {note.author?.realName || note.author?.nickname || "Admin"}
                        </span>
                        <span className="text-muted-foreground">
                          {formatReportDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/90">{note.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Handling Assignments Card */}
          <section
            aria-label="Handling assignments"
            className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
          >
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Handling Assignments
              </h2>

              {!assignedTeacher ? (
                /* Unassigned State: Select Teacher */
                <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="teacher-select"
                      className="text-xs font-medium text-foreground"
                    >
                      Authorized Teacher
                    </label>
                    <select
                      id="teacher-select"
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={!selectedTeacherId || assignMutation.isPending}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                  >
                    {assignMutation.isPending ? "Assigning..." : "Assign Report"}
                  </Button>
                </form>
              ) : (
                /* Assigned State: Show Teacher profile & Change button */
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Assigned Teacher
                    </span>
                    <button
                      type="button"
                      onClick={() => setChangingTeacher(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
                    >
                      <span>Change</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/20 p-5 text-center">
                    <Avatar className="size-16 border-2 border-primary/20 shadow-xs">
                      <AvatarFallback className="bg-orange-100 text-sm font-bold text-primary">
                        {(assignedTeacher.realName || assignedTeacher.nickname || "T")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="mt-3 font-semibold text-primary">
                      {assignedTeacher.realName || assignedTeacher.nickname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{assignedTeacher.nickname || "teacher"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      ID: {assignedTeacher.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Note Sub-section */}
            <div className="mt-6 border-t border-border/60 pt-4">
              {teacherNotes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-center text-xs text-muted-foreground">
                  Teacher Note: No notes added
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Teacher Notes ({teacherNotes.length})
                  </p>
                  {teacherNotes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {n.author?.realName || "Teacher"}
                        </span>
                        <span className="text-muted-foreground">
                          {formatReportDate(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-foreground/90">{n.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Change Assigned Teacher Modal */}
      {changingTeacher && assignedTeacher ? (
        <ChangeTeacherDialog
          reportId={report.id}
          currentTeacher={{
            id: assignedTeacher.id,
            name: assignedTeacher.realName || assignedTeacher.nickname || "Teacher",
            handle: assignedTeacher.nickname || "teacher",
          }}
          teachers={teachers.map((t) => ({
            id: t.id,
            name: t.name,
            handle: t.handle,
          }))}
          open={changingTeacher}
          onOpenChange={setChangingTeacher}
          onChanged={() => {
            void queryClient.invalidateQueries({
              queryKey: ["admin-safe-space-report", id],
            });
            void queryClient.invalidateQueries({
              queryKey: ["admin-safe-space-reports"],
            });
            void queryClient.invalidateQueries({
              queryKey: ["admin-safe-space-all"],
            });
          }}
        />
      ) : null}

      {/* Change Status Modal */}
      {changingStatus ? (
        <ChangeStatusDialog
          reportId={report.id}
          currentStatus={report.status}
          open={changingStatus}
          onOpenChange={setChangingStatus}
          onChanged={() => {
            void queryClient.invalidateQueries({
              queryKey: ["admin-safe-space-report", id],
            });
            void queryClient.invalidateQueries({
              queryKey: ["admin-safe-space-reports"],
            });
            void queryClient.invalidateQueries({
              queryKey: ["admin-safe-space-all"],
            });
            toastSuccess({
              title: "Status updated",
              description: "Report status changed successfully.",
            });
          }}
        />
      ) : null}
    </div>
  );
}
