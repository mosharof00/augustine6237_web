"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { applyApiFormError } from "@/components/feedback/apply-api-form-error";
import { DialogActions } from "@/components/feedback/dialog-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/envelope";
import { updateStaff } from "./api";
import {
  editStaffSchema,
  staffPatch,
  type EditStaffValues,
  type StaffMember,
} from "./model";

export function EditStaffDialog({
  member,
  open,
  onOpenChange,
  onSaved,
}: {
  member: StaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const form = useForm<EditStaffValues>({
    resolver: zodResolver(editStaffSchema),
    values: {
      name: member.name,
      email: member.email,
      assignedClass: member.assignedClass,
      canAccessSafeSpace: member.canAccessSafeSpace,
    },
  });

  async function onSubmit(values: EditStaffValues) {
    try {
      await updateStaff(member.id, staffPatch(values));
      onOpenChange(false);
      onSaved();
    } catch (error) {
      applyApiFormError(form, {
        message: error instanceof ApiError ? error.message : "Could not save the profile.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input {...field} className="pl-9" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input {...field} type="email" className="pl-9" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Class</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                    >
                      {member.assignedClass ? (
                        <option value={member.assignedClass}>{member.assignedClass}</option>
                      ) : (
                        <option value="">Select Class</option>
                      )}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="canAccessSafeSpace"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2 text-sm">
                    <FormControl>
                      <input
                        type="checkbox"
                        name={field.name}
                        ref={field.ref}
                        checked={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="size-4 accent-primary"
                      />
                    </FormControl>
                    Give permission for safe space report
                  </label>
                </FormItem>
              )}
            />
            {form.formState.errors.root?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}
            <DialogActions
              onCancel={() => onOpenChange(false)}
              actionLabel="Save & Update"
              pending={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
