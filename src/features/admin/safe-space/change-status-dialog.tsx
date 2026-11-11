"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { ApiError } from "@/lib/api/envelope";
import { updateAdminReport } from "./api";
import {
  changeStatusSchema,
  reportStatusLabel,
  type ReportStatus,
} from "./model";

const STATUS_OPTIONS: {
  value: ReportStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "NEW",
    label: "New",
    description: "Report has been submitted and is pending initial review.",
  },
  {
    value: "REVIEWING",
    label: "Reviewing",
    description: "Assigned to a teacher and active follow-up is in progress.",
  },
  {
    value: "ADDRESSED",
    label: "Addressed",
    description: "Follow-up conversation and student safety actions completed.",
  },
];

export function ChangeStatusDialog({
  reportId,
  currentStatus,
  open,
  onOpenChange,
  onChanged,
}: {
  reportId: string;
  currentStatus: ReportStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const form = useForm<{ status: ReportStatus }>({
    resolver: zodResolver(changeStatusSchema),
    defaultValues: { status: currentStatus },
  });

  async function onSubmit(values: { status: ReportStatus }) {
    try {
      await updateAdminReport(reportId, { status: values.status });
      form.reset({ status: values.status });
      onOpenChange(false);
      onChanged();
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError ? error.message : "Could not update status.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Change Report Status
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs font-medium text-foreground">
                    Select New Status
                  </FormLabel>
                  <FormControl>
                    <div className="grid gap-2">
                      {STATUS_OPTIONS.map((opt) => {
                        const selected = field.value === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.name}
                              value={opt.value}
                              checked={selected}
                              onChange={() => field.onChange(opt.value)}
                              className="mt-1 size-4 accent-primary"
                            />
                            <div className="text-sm">
                              <p className="font-semibold text-foreground">
                                {reportStatusLabel(opt.value)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {opt.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
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
