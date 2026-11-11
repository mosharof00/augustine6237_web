"use client"

import { toast } from "sonner"

export function toastSuccess({
  title,
  description,
}: {
  title: string
  description: string
}) {
  toast.success(title, { description })
}
