"use client";

import { Shield, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  formatFeelSafe,
  formatReportDate,
  reportStatusVariant,
  type SafeSpaceReportItem,
} from "./model";

export interface SafeSpacePreviewContentProps {
  report: SafeSpaceReportItem;
  onClose?: () => void;
}

export function SafeSpacePreviewContent({
  report,
  onClose,
}: SafeSpacePreviewContentProps) {
  const feelSafeInfo = formatFeelSafe(report.feelSafe);

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1 border-b pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              {report.publicRef}
            </span>
            <StatusBadge variant={reportStatusVariant(report.status)} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Student Report Summary
        </h3>
        <p className="text-xs text-muted-foreground">
          Confidential report submitted by student. For staff reference only.
        </p>
      </div>

      <div className="space-y-4 py-2 text-sm">
        {/* Student & Class info */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-1 ring-border/50">
              {report.avatarUrl ? (
                <AvatarImage src={report.avatarUrl} alt={report.studentName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {report.studentName.slice(0, 2).toUpperCase() || <User className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{report.studentName}</p>
              {report.studentNickname ? (
                <p className="text-xs text-muted-foreground">
                  @{report.studentNickname}
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground border">
              {report.className}
            </span>
          </div>
        </div>

        {/* Feel Safe Banner */}
        <div
          className={`flex items-center gap-2.5 rounded-lg border p-3 ${
            report.feelSafe
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {report.feelSafe ? (
            <ShieldCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <div className="text-xs">
            <p className="font-semibold">{feelSafeInfo.label}</p>
            <p className="text-[11px] opacity-90">
              {report.feelSafe
                ? "Student marked that they generally feel safe in this environment."
                : "Student indicated feeling unsafe. Follow up promptly according to policy."}
            </p>
          </div>
        </div>

        {/* Report Category and Date */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border bg-muted/20 p-2.5">
            <span className="text-muted-foreground">Category</span>
            <p className="mt-1 font-medium text-foreground">{report.category}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-2.5">
            <span className="text-muted-foreground">Date & Time</span>
            <p className="mt-1 font-medium text-foreground">
              {formatReportDate(report.submittedAt || report.createdAt)}
            </p>
          </div>
        </div>

        {/* Narrative Body */}
        <div className="rounded-lg border bg-background p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Shield className="size-3.5 text-primary" />
            <span>Report Statement</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {report.body}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end border-t pt-4">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

interface SafeSpacePreviewModalProps {
  report: SafeSpaceReportItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SafeSpacePreviewModal({
  report,
  open,
  onOpenChange,
}: SafeSpacePreviewModalProps) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <SafeSpacePreviewContent
          report={report}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
