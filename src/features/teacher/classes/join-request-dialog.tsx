"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Clock, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
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
import { ApiError } from "@/lib/api/envelope";
import { approveJoinRequest, rejectJoinRequest } from "./api";
import {
  formatClassName,
  formatRequestDate,
  type TeacherJoinRequest,
} from "./model";

export interface JoinRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: TeacherJoinRequest | null;
  className: string;
  gradeLabel?: string | null;
  onSuccess?: () => void;
}

export function JoinRequestDialog({
  open,
  onOpenChange,
  request,
  className,
  gradeLabel,
  onSuccess,
}: JoinRequestDialogProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  if (!request) return null;

  const student = request.student;
  const displayName = student.realName || student.nickname || student.username || "Student";
  const displayClass = formatClassName(className, gradeLabel);

  async function handleApprove() {
    if (!request) return;
    setSubmitting(true);
    try {
      await approveJoinRequest(request.id);
      toastSuccess({
        title: "Join request approved",
        description: `${displayName} has joined ${displayClass}.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["teacher-classes"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher-class"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not approve this join request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!request) return;
    setSubmitting(true);
    try {
      await rejectJoinRequest(request.id);
      toastSuccess({
        title: "Join request declined",
        description: `Join request for ${displayName} was declined.`,
      });
      void queryClient.invalidateQueries({ queryKey: ["teacher-classes"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher-class"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not decline this join request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Join Request</DialogTitle>
          <DialogDescription>
            Decide whether to admit this student into your class.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Student Profile Card */}
          <div className="flex items-center justify-between rounded-xl border bg-card p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 ring-1 ring-border">
                {student.avatarUrl ? (
                  <AvatarImage src={student.avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">@{student.username}</p>
              </div>
            </div>
            <StatusBadge variant="pending" />
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3 text-xs">
            <div>
              <p className="text-muted-foreground">Requested class</p>
              <p className="mt-0.5 font-semibold text-foreground">{displayClass}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Grade</p>
              <p className="mt-0.5 font-semibold text-foreground">{gradeLabel || "—"}</p>
            </div>
            <div className="col-span-2 pt-1 border-t border-border/50">
              <p className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-3" />
                <span>Requested: {formatRequestDate(request.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => void handleReject()}
            className="flex items-center gap-1.5"
          >
            <X className="size-4" />
            <span>Decline</span>
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => void handleApprove()}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-4" />
            <span>Approve</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
