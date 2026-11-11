"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StudentRow } from "./model";

export function StudentActions({
  student,
  onReview,
  onReactivate,
}: {
  student: StudentRow;
  onReview: (student: StudentRow) => void;
  onReactivate: (student: StudentRow) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Actions for ${student.name}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        ···
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border bg-card shadow-md"
        >
          <Link
            role="menuitem"
            href={`/admin/users/students/${student.id}`}
            className="block bg-primary px-3 py-2 text-sm text-primary-foreground"
            onClick={() => setOpen(false)}
          >
            View Profile
          </Link>
          {student.status === "PENDING" ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                setOpen(false);
                onReview(student);
              }}
            >
              Review
            </button>
          ) : null}
          {student.status === "INACTIVE" ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                setOpen(false);
                onReactivate(student);
              }}
            >
              Reactivate
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
