"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DialogActions } from "@/components/feedback/dialog-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/envelope";
import { deleteStory } from "./api";
import type { StoryListItem } from "./model";

export function DeleteStoryDialog({
  story,
  open,
  onOpenChange,
  onDeleted,
}: {
  story: StoryListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!story) return;
    setPending(true);
    setMessage(null);
    try {
      await deleteStory(story.id);
      toast.success(`Story "${story.title}" deleted.`);
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      const err =
        error instanceof ApiError ? error.message : "Could not delete this story.";
      setMessage(err);
      toast.error(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader className="items-start text-left">
            <DialogTitle>Delete Story</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {story?.title ?? "this story"}
              </span>
              ? This action will remove it from the library.
            </DialogDescription>
          </DialogHeader>

          {message ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {message}
            </p>
          ) : null}

          <div className="mt-6">
            <DialogActions
              onCancel={() => onOpenChange(false)}
              actionLabel="Delete"
              cancelLabel="Cancel"
              pending={pending}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
