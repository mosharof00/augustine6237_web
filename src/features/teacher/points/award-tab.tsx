"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClassSwitcher, type ClassSwitcherOption } from "@/features/teacher/classes/class-switcher";
import { cn } from "@/lib/utils";
import {
  awardPoints,
  getTeacherPointsHistory,
  getTeacherStudentsList,
} from "./api";
import {
  ALLOWED_AMOUNTS,
  AWARD_CATEGORIES,
  awardPointsSchema,
  formatAwardDate,
  type AwardCategory,
  type TeacherPointsHistoryItem,
  type TeacherStudentOption,
} from "./model";

export interface AwardTabProps {
  classes: ClassSwitcherOption[];
  selectedClassId?: string;
  onSelectClass: (classId: string | undefined) => void;
}

export function AwardTab({
  classes,
  selectedClassId,
  onSelectClass,
}: AwardTabProps) {
  const queryClient = useQueryClient();

  const [studentId, setStudentId] = useState<string>("");
  const [category, setCategory] = useState<AwardCategory>("Kindness");
  const [amount, setAmount] = useState<number>(3);
  const [reason, setReason] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch students for teacher (filtered by selectedClassId if chosen)
  const studentsQuery = useQuery({
    queryKey: ["teacher-students-options", selectedClassId],
    queryFn: () => getTeacherStudentsList(selectedClassId),
  });

  // Fetch recent awards (paginated history, top 5)
  const historyQuery = useQuery({
    queryKey: ["teacher-points-history", selectedClassId],
    queryFn: () => getTeacherPointsHistory({ classId: selectedClassId, page: 1, perPage: 10 }),
  });

  const students = studentsQuery.data ?? [];
  const selectedStudent = students.find((s) => s.id === studentId);

  const awardMutation = useMutation({
    mutationFn: awardPoints,
    onSuccess: () => {
      toast.success("Points awarded successfully!", {
        description: `Awarded +${amount} points to ${selectedStudent?.name ?? "student"}.`,
      });
      // Invalidate queries to auto-refresh history and badge monitor
      queryClient.invalidateQueries({ queryKey: ["teacher-points-history"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-badge-monitor"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard"] });

      // Reset form
      setStudentId("");
      setReason("");
      setFormError(null);
      setIsConfirmOpen(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to award points";
      setFormError(msg);
      toast.error("Failed to award points", { description: msg });
      setIsConfirmOpen(false);
    },
  });

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate using awardPointsSchema
    const parseResult = awardPointsSchema.safeParse({
      studentId,
      amount,
      category,
      reason: reason || undefined,
    });

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      setFormError(firstIssue?.message ?? "Please check form entries.");
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmAward = () => {
    awardMutation.mutate({
      studentId,
      amount,
      category,
      reason: reason || undefined,
    });
  };

  const recentAwards: TeacherPointsHistoryItem[] = historyQuery.data?.items ?? [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Award Form */}
      <div className="lg:col-span-7">
        <form onSubmit={handleOpenReview} className="space-y-6">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive"
            >
              {formError}
            </div>
          )}

          {/* Class & Student Dropdowns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="class-select"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Class
              </label>
              <div className="relative">
                <ClassSwitcher
                  classes={classes}
                  selectedClassId={selectedClassId}
                  onSelectClass={(newClassId) => {
                    onSelectClass(newClassId);
                    setStudentId(""); // Clear student when class changes
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="student-select"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Student
              </label>
              {studentsQuery.isLoading ? (
                <div className="h-9 w-full animate-pulse rounded-lg border bg-muted" />
              ) : (
                <select
                  id="student-select"
                  aria-label="Select student"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setFormError(null);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Select student</option>
                  {students.map((student: TeacherStudentOption) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                      {student.className ? ` (${student.className})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Category Cards */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-foreground">
              Category
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {AWARD_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setFormError(null);
                    }}
                    className={cn(
                      "flex h-11 items-center justify-between rounded-xl border px-4 text-xs font-medium transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary"
                        : "border-border bg-card text-foreground hover:bg-muted/60 hover:border-muted-foreground/30",
                    )}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="size-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Sample categories. Final list is pending configuration.
            </p>
          </div>

          {/* Points Amount Pills */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-foreground">
              Points
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ALLOWED_AMOUNTS.map((val) => {
                const isSelected = amount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      setFormError(null);
                    }}
                    className={cn(
                      "flex h-9 w-12 items-center justify-center rounded-lg border text-xs font-semibold transition-all",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-card text-foreground hover:bg-muted/60",
                    )}
                  >
                    +{val}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Sample values. Configured values pending.
            </p>
          </div>

          {/* Reason Textarea */}
          <div>
            <label
              htmlFor="reason-input"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Reason (Optional)
            </label>
            <textarea
              id="reason-input"
              aria-label="Reason for awarding points"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What did they do well?"
              rows={4}
              maxLength={300}
              className="w-full resize-none rounded-xl border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Action Button */}
          <div>
            <Button
              type="submit"
              disabled={!studentId || amount < 1 || amount > 5 || awardMutation.isPending}
              className="h-10 px-6 font-semibold"
            >
              {awardMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Review"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Column: Recent Awards */}
      <div className="lg:col-span-5">
        <aside className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold text-foreground text-sm">Recent awards</h3>

          {historyQuery.isLoading ? (
            <div className="mt-4 space-y-3">
              <LoadingState kind="cards" count={3} />
            </div>
          ) : historyQuery.isError ? (
            <div className="py-6">
              <ErrorState
                message="Unable to load recent awards"
                onRetry={() => historyQuery.refetch()}
              />
            </div>
          ) : recentAwards.length === 0 ? (
            <div className="py-6">
              <EmptyState
                title="No recent awards"
                description="Student kindness and effort awards will appear here once submitted."
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentAwards.slice(0, 5).map((award) => (
                <li
                  key={award.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-9 shrink-0">
                      {award.avatarUrl && (
                        <AvatarImage src={award.avatarUrl} alt={award.studentName} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {award.studentName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {award.studentName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {award.category} · {formatAwardDate(award.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-3 shrink-0">
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      +{award.amount}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Points Award</DialogTitle>
            <DialogDescription>
              Please verify the award details before submitting to the ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student:</span>
              <span className="font-semibold text-foreground">
                {selectedStudent?.name ?? studentId}
              </span>
            </div>
            {selectedStudent?.className && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Class:</span>
                <span className="font-medium text-foreground">
                  {selectedStudent.className}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-semibold text-foreground">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Points:</span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                +{amount}
              </span>
            </div>
            {reason && (
              <div className="pt-2 border-t">
                <span className="text-muted-foreground block mb-1">Reason:</span>
                <p className="italic text-foreground">{reason}</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={awardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAward}
              disabled={awardMutation.isPending}
              className="font-semibold"
            >
              {awardMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Awarding...
                </>
              ) : (
                "Confirm & Award"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
