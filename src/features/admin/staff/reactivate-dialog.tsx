"use client";

import { useState } from "react";
import { DialogActions } from "@/components/feedback/dialog-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/envelope";
import { reactivateStaff } from "./api";
import type { StaffMember } from "./model";

export function ReactivateDialog({
  member,
  open,
  onOpenChange,
  onDone,
}: {
  member: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!member) return;
    setPending(true);
    setMessage(null);
    try {
      await reactivateStaff(member.id);
      onOpenChange(false);
      onDone();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not reactivate this account.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader className="items-center text-center">
            <DialogTitle>Are You Sure?</DialogTitle>
            <DialogDescription>
              Reactivating this account will restore the teacher&apos;s access to Wings of Power
            </DialogDescription>
          </DialogHeader>
          {message ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {message}
            </p>
          ) : null}
          <div className="mt-4">
            <DialogActions
              onCancel={() => onOpenChange(false)}
              actionLabel="Reactivate"
              pending={pending}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
