"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { applyApiFormError } from "@/components/feedback/apply-api-form-error";
import { DialogActions } from "@/components/feedback/dialog-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ApiError } from "@/lib/api/envelope";
import { updateAdminReport } from "./api";
import { changeTeacherSchema } from "./model";

export function ChangeTeacherDialog({
  reportId,
  currentTeacher,
  teachers,
  open,
  onOpenChange,
  onChanged,
}: {
  reportId: string;
  currentTeacher?: {
    id: string;
    name: string;
    handle: string;
  } | null;
  teachers: { id: string; name: string; handle?: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const form = useForm<{ teacherId: string }>({
    resolver: zodResolver(changeTeacherSchema),
    defaultValues: { teacherId: currentTeacher?.id ?? "" },
  });

  async function onSubmit(values: { teacherId: string }) {
    try {
      await updateAdminReport(reportId, { assigneeId: values.teacherId });
      form.reset();
      onOpenChange(false);
      onChanged();
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError ? error.message : "Could not assign teacher.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Change Assigned Teacher
          </DialogTitle>
        </DialogHeader>

        {currentTeacher ? (
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-border/60">
                <AvatarFallback className="bg-orange-100 text-xs font-semibold text-primary">
                  {currentTeacher.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {currentTeacher.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{currentTeacher.handle}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-primary dark:bg-orange-950/60">
              Current
            </span>
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground">
                    Authorized Teacher
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      aria-label="Authorized Teacher"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.handle ? `(@${t.handle})` : ""}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root?.message ? (
              <p role="alert" className="text-xs text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <DialogActions
              onCancel={() => onOpenChange(false)}
              actionLabel="Confirm & Update"
              pending={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
