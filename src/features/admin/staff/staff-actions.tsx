"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StaffMember } from "./model";

export function StaffActions({
  member,
  onRemind,
  onReactivate,
}: {
  member: StaffMember;
  onRemind: (member: StaffMember) => void;
  onReactivate: (member: StaffMember) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Actions for ${member.name}`}
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
            href={`/admin/users/staff/${member.id}`}
            className="block bg-primary px-3 py-2 text-sm text-primary-foreground"
            onClick={() => setOpen(false)}
          >
            View Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onRemind(member);
            }}
          >
            Send Reminder
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onReactivate(member);
            }}
          >
            Reactivate
          </button>
        </div>
      ) : null}
    </div>
  );
}
