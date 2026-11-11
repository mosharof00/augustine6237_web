"use client";

import { Copy, Share2 } from "lucide-react";
import { toastSuccess } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { classReadyLine } from "./model";

export function CodeDialog({
  open,
  onOpenChange,
  title,
  classLabel,
  code,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  classLabel: string;
  code: string;
}) {
  async function onCopy() {
    await navigator.clipboard.writeText(code);
    toastSuccess({ title: "Code copied", description: code });
  }

  async function onShare() {
    const text = `${classLabel} join code ${code}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Class join code", text });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(text);
    toastSuccess({ title: "Code copied", description: text });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader className="items-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            ✓
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{classReadyLine(classLabel)}</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-primary/10 px-4 py-3">
          <p className="text-xs tracking-wide text-muted-foreground">CLASS JOIN CODE</p>
          <p className="mt-1 text-xl font-semibold text-primary">[{code}]</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => void onShare()}>
            <Share2 />
            Share
          </Button>
          <Button type="button" onClick={() => void onCopy()}>
            <Copy />
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
