"use client"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

export function DialogActions({
  onCancel,
  cancelLabel = "Cancel",
  actionLabel,
  pending = false,
}: {
  onCancel: () => void
  cancelLabel?: string
  actionLabel: string
  pending?: boolean
}) {
  return (
    <DialogFooter className="flex-row justify-end border-0 bg-transparent p-0">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={pending}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={pending}>
        {actionLabel}
      </Button>
    </DialogFooter>
  )
}
