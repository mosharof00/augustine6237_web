"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "cn";
import { formatClassName } from "./model";

export interface ClassSwitcherOption {
  id: string;
  name: string;
  gradeLabel?: string | null;
}

export interface ClassSwitcherProps {
  classes: ClassSwitcherOption[];
  selectedClassId?: string;
  onSelectClass: (classId: string | undefined) => void;
  showAllOption?: boolean;
  allLabel?: string;
  className?: string;
}

export function ClassSwitcher({
  classes,
  selectedClassId,
  onSelectClass,
  showAllOption = true,
  allLabel = "All Classes",
  className,
}: ClassSwitcherProps) {
  if (classes.length === 0) {
    return null;
  }

  if (classes.length === 1 && !showAllOption) {
    const cls = classes[0];
    if (!cls) return null;
    return (
      <span
        className={cn(
          "rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground",
          className,
        )}
      >
        {formatClassName(cls.name, cls.gradeLabel)}
      </span>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <select
        aria-label="Select class"
        value={selectedClassId ?? ""}
        onChange={(e) => onSelectClass(e.target.value ? e.target.value : undefined)}
        className="h-9 appearance-none rounded-lg border bg-background py-1.5 pr-8 pl-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {showAllOption && <option value="">{allLabel}</option>}
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {formatClassName(cls.name, cls.gradeLabel)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
