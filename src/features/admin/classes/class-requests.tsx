"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/envelope";
import { approveClassRequest, getClassRequests, rejectClassRequest } from "./api";
import { ClassesChrome } from "./classes-chrome";
import { CodeDialog } from "./code-dialog";
import type { ClassRequest, IssuedCode } from "./model";

export function ClassRequests() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ClassRequest | null>(null);
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
          query.error instanceof ApiError ? query.error.message : "Could not load class requests."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const lists = query.data;

  async function onApprove(request: ClassRequest) {
    setPending(true);
    try {
      const code = await approveClassRequest(request.id);
      setSelected(null);
      setIssued(code);
      void queryClient.invalidateQueries({ queryKey: ["admin-class-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not approve this request.");
    } finally {
      setPending(false);
    }
  }

  async function onReject(request: ClassRequest) {
    setPending(true);
    try {
      await rejectClassRequest(request.id);
      setSelected(null);
      toast.success("Request rejected");
      void queryClient.invalidateQueries({ queryKey: ["admin-class-requests"] });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not reject this request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <ClassesChrome
      current="requests"
      classCount={lists.classCount}
      requestCount={lists.requests.length}
    >
      {lists.renewals.length > 0 ? (
        <section className="rounded-xl border bg-card">
          <h3 className="border-b px-4 py-3 font-medium">Expired Class Code Renewal Requests</h3>
          <ul>
            {lists.renewals.map((renewal) => (
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
                <Button render={<Link href="/admin/classes/renewals" />}>Review</Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ul className="grid gap-3">
        {lists.requests.map((request) => (
          <li
            key={request.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3"
          >
            <div>
              <p className="font-medium">{request.teacherName}</p>
              <p className="text-sm text-muted-foreground">
                @{request.teacherHandle} · Requested on {request.requestedAt}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-primary"
              onClick={() => setSelected(request)}
            >
              Review Now →
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected ? (
            <div className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Class Request Details</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{selected.teacherName}</p>
                <p className="text-sm text-muted-foreground">@{selected.teacherHandle}</p>
              </div>
              <StatusBadge variant="pending" />
            </div>
            <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Requested class</dt>
                <dd>{selected.className}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Grade</dt>
                <dd>{selected.grade}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Age Group</dt>
                <dd>{selected.ageGroup}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Requested</dt>
                <dd>{selected.requestedAt}</dd>
              </div>
            </dl>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => void onReject(selected)}
              >
                Reject
              </Button>
              <Button type="button" disabled={pending} onClick={() => void onApprove(selected)}>
                Approve & Generate Code
              </Button>
            </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <CodeDialog
        open={issued !== null}
        onOpenChange={(open) => {
          if (!open) setIssued(null);
        }}
        title="Class Created Successfully!"
        classLabel={issued?.className ?? ""}
        code={issued?.code ?? ""}
      />
    </ClassesChrome>
  );
}
