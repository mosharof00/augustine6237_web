"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { getStaffMember, remindStaff } from "./api";
import { EditStaffDialog } from "./edit-dialog";
import { staffRoleLabel, staffStatusVariant, type StaffMember } from "./model";
import { ReactivateDialog } from "./reactivate-dialog";

export function StaffProfile({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const query = useQuery({
    queryKey: ["admin-staff", id],
    queryFn: () => getStaffMember(id),
    retry: false,
  });

  if (query.isPending) return <LoadingState count={2} />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={
          query.error instanceof ApiError
            ? query.error.message
            : "Could not load this profile."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const member = query.data;
  const classes = member.classes ?? [];

  async function onRemind(current: StaffMember) {
    await remindStaff(current.id);
    toastSuccess({
      title: "Reminder sent",
      description: `The invite was sent again to ${current.name}.`,
    });
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin/users/staff" className="hover:text-foreground">
          User Management
        </Link>
        {" / Staff / "}
        <span className="text-foreground">{member.name}</span>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-medium text-primary">
            {member.name.slice(0, 1)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{member.name}</h2>
              <StatusBadge variant={staffStatusVariant(member.status)} />
            </div>
            <p className="text-sm text-muted-foreground">
              @{member.handle} · {member.email}
            </p>
          </div>
        </div>
        {member.status === "INVITED" ? (
          <Button type="button" onClick={() => void onRemind(member)}>
            Send Reminder
          </Button>
        ) : member.status === "INACTIVE" ? (
          <Button type="button" onClick={() => setReactivating(true)}>
            Reactivate
          </Button>
        ) : (
          <Button type="button" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <article className="rounded-xl border bg-card p-4">
          <h3 className="font-medium">Personal Details</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label="ID" value={member.staffCode} />
            <Detail
              label="Status"
              value={<StatusBadge variant={staffStatusVariant(member.status)} />}
            />
            <Detail label="Full name" value={member.name} />
            <Detail label="Role" value={staffRoleLabel(member)} />
            <Detail label="Username" value={`@${member.handle}`} />
            <Detail label="Assigned Class" value={String(classes.length || member.assignedClass)} />
            <Detail label="Email" value={member.email} />
            <Detail label="Date Joined" value={member.joinedAt || "—"} />
            <Detail label="Phone Number" value={member.phone} />
          </dl>
        </article>
        <article className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Assigned Classes</h3>
            <span className="text-xs text-muted-foreground">
              {classes.length} {classes.length === 1 ? "class" : "classes"}
            </span>
          </div>
          {classes.length === 0 ? (
            <EmptyState
              title="No classes assigned"
              description="Assigned classes will appear here."
            />
          ) : (
            <ul className="mt-3 grid gap-3">
              {classes.map((item) => (
                <li key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Class Code: {item.code}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Assigned On: {item.assignedOn}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>{item.studentCount} Students</span>
                    <Link href={`/admin/classes/${item.id}`} className="text-primary">
                      View Class
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
      <EditStaffDialog
        member={member}
        open={editing}
        onOpenChange={setEditing}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-staff", id] });
        }}
      />
      <ReactivateDialog
        member={member}
        open={reactivating}
        onOpenChange={setReactivating}
        onDone={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
        }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
