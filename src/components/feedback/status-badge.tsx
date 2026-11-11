import { cn } from "cn"

const statusLabels = {
  active: "Active",
  published: "Published",
  addressed: "Addressed",
  inactive: "Inactive",
  invitation: "Invitation sent",
  new: "New",
  pending: "Pending",
  reviewing: "Reviewing",
  draft: "Draft",
  expired: "Expired",
} as const

export type StatusBadgeVariant = keyof typeof statusLabels

const statusStyles: Record<StatusBadgeVariant, string> = {
  active: "bg-success/15 text-success",
  published: "bg-success/15 text-success",
  addressed: "bg-success/15 text-success",
  inactive: "bg-destructive/15 text-destructive",
  invitation: "bg-info/15 text-info",
  new: "bg-info/15 text-info",
  pending: "bg-primary/15 text-primary",
  reviewing: "bg-primary/15 text-primary",
  draft: "bg-muted text-muted-foreground",
  expired: "bg-destructive/10 text-destructive/80",
}

export function StatusBadge({
  variant,
  className,
}: {
  variant: StatusBadgeVariant
  className?: string
}) {
  return (
    <span
      data-slot="status-badge"
      data-variant={variant}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[variant],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabels[variant]}
    </span>
  )
}
