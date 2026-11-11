"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { toastSuccess } from "@/components/feedback/toast";
import { ErrorState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { getStaff, remindStaff } from "./api";
import { InviteStaffDialog } from "./invite-dialog";
import {
  STAFF_PER_PAGE,
  staffRoleLabel,
  staffStatusVariant,
  type StaffMember,
} from "./model";
import { ReactivateDialog } from "./reactivate-dialog";
import { StaffActions } from "./staff-actions";
import { UserManagementTabs } from "./user-tabs";

const columns: ColumnDef<DataTableFeatures, StaffMember>[] = [
  {
    id: "staff",
    header: "Staff",
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
          {row.original.name.slice(0, 1)}
        </span>
        <span>
          <span className="block font-medium">{row.original.name}</span>
          <span className="block text-xs text-muted-foreground">@{row.original.handle}</span>
        </span>
      </span>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <span>
        <span className="block">{row.original.email}</span>
        <span className="block text-xs text-muted-foreground">{row.original.phone}</span>
      </span>
    ),
  },
  {
    accessorKey: "staffCode",
    header: "ID",
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => staffRoleLabel(row.original),
  },
  {
    accessorKey: "assignedClass",
    header: "Assigned Class",
  },
  {
    accessorKey: "studentCount",
    header: "Students",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge variant={staffStatusVariant(row.original.status)} />
    ),
  },
];

export function StaffList() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const search = params.get("q") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [reactivate, setReactivate] = useState<StaffMember | null>(null);

  const query = useQuery({
    queryKey: ["admin-staff", page, search],
    queryFn: () => getStaff({ page, perPage: STAFF_PER_PAGE, q: search || undefined }),
    retry: false,
  });

  function replaceQuery(next: { q?: string; page?: number }) {
    const value = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) value.set("q", next.q);
      else value.delete("q");
      value.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) value.set("page", String(next.page));
      else value.delete("page");
    }
    const queryString = value.toString();
    router.replace(queryString ? `/admin/users/staff?${queryString}` : "/admin/users/staff");
  }

  async function onRemind(member: StaffMember) {
    try {
      await remindStaff(member.id);
      toastSuccess({
        title: "Reminder sent",
        description: `The invite was sent again to ${member.name}.`,
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not send the reminder.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Staff</h2>
          <p className="text-sm text-muted-foreground">Manage school staff access.</p>
        </div>
        <Button type="button" onClick={() => setInviteOpen(true)}>
          + Invite New Staff
        </Button>
      </div>
      <UserManagementTabs current="staff" />
      {query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiError
              ? query.error.message
              : "Could not load staff."
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={query.data?.items ?? []}
          search={search}
          onSearchChange={(value) => replaceQuery({ q: value })}
          searchPlaceholder="Search staff"
          page={query.data?.page ?? page}
          perPage={STAFF_PER_PAGE}
          total={query.data?.total ?? 0}
          lastPage={query.data?.lastPage ?? 1}
          onPageChange={(nextPage) => replaceQuery({ page: nextPage })}
          isLoading={query.isPending}
          getRowId={(row) => row.id}
          rowAction={(row) => (
            <StaffActions
              member={row}
              onRemind={(member) => void onRemind(member)}
              onReactivate={setReactivate}
            />
          )}
        />
      )}
      <InviteStaffDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={(label) => {
          toastSuccess({
            title: "Invitation Sent",
            description: `Invitation sent to ${label}`,
          });
          void queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
        }}
      />
      <ReactivateDialog
        member={reactivate}
        open={reactivate !== null}
        onOpenChange={(open) => {
          if (!open) setReactivate(null);
        }}
        onDone={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
        }}
      />
    </div>
  );
}
