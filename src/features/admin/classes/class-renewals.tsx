"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DialogActions } from "@/components/feedback/dialog-actions";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/envelope";
import { approveRenewal, getClassRequests } from "./api";
import { ClassesChrome } from "./classes-chrome";
import { CodeDialog } from "./code-dialog";
import type { CodeRenewal, IssuedCode } from "./model";

export function ClassRenewals() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<CodeRenewal | null>(null);
  const [issued, setIssued] = useState<IssuedCode | null>(null);
  const [pending, setPending] = useState(false);
  const query = useQuery({
    queryKey: ["admin-class-requests"],
    queryFn: getClassRequests,
    retry: false,
  });

  if (query.isPending) return <LoadingState count={2} />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={
          query.error instanceof ApiError ? query.error.message : "Could not load renewals."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const renewals = query.data.renewals;

  async function onApprove(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setPending(true);
    try {
      const code = await approveRenewal(selected.id);
      setIssued({ className: selected.className, code: code.code });
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-class-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not generate a new code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <ClassesChrome
      current="requests"
      classCount={query.data.classCount}
      requestCount={query.data.requests.length}
    >
      <section className="rounded-xl border bg-card">
        <h3 className="border-b px-4 py-3 font-medium">Expired Class Code Renewal Requests</h3>
        {renewals.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No renewal requests.</p>
        ) : (
          <ul>
            {renewals.map((renewal) => (
              <li
                key={renewal.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{renewal.className}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested by {renewal.teacherName}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary"
                  onClick={() => setSelected(renewal)}
                >
                  Review
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected ? (
            <form onSubmit={onApprove} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>Class Code Renewal Request</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">Request ID: {selected.requestCode}</p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{selected.teacherName}</p>
                  <p className="text-sm text-muted-foreground">@{selected.teacherHandle}</p>
                </div>
                <StatusBadge variant="pending" />
              </div>
              <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Requested class code for</dt>
                  <dd>{selected.className}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Enrolled Students</dt>
                  <dd>{selected.studentCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Requested on</dt>
                  <dd>{selected.requestedAt}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Current Code Status</dt>
                  <dd>
                    <StatusBadge variant="expired" />
                  </dd>
                </div>
              </dl>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="text-xs text-muted-foreground">Reason</p>
                <p>{selected.reason}</p>
              </div>
              <DialogActions
                onCancel={() => setSelected(null)}
                actionLabel="Generate New Code"
                pending={pending}
              />
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      <CodeDialog
        open={issued !== null}
        onOpenChange={(open) => {
          if (!open) setIssued(null);
        }}
        title="Successfully Created New Code!"
        classLabel={issued?.className ?? ""}
        code={issued?.code ?? ""}
      />
    </ClassesChrome>
  );
}
