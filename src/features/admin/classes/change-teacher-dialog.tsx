"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { changeTeacher } from "./api";
import { changeTeacherPayload } from "./model";

const schema = z.object({
  teacherId: z.string().min(1, "Choose a teacher"),
});

export function ChangeTeacherDialog({
  classId,
  teacher,
  teachers,
  open,
  onOpenChange,
  onChanged,
}: {
  classId: string;
  teacher: { name: string; handle: string };
  teachers: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { teacherId: "" },
  });

  async function onSubmit(values: { teacherId: string }) {
    try {
      await changeTeacher(classId, changeTeacherPayload(values.teacherId).teacherId);
      form.reset();
      onOpenChange(false);
      onChanged();
    } catch (error) {
      applyApiFormError(form, {
        message: error instanceof ApiError ? error.message : "Could not change the teacher.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Assigned Teacher</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">{teacher.name}</p>
            <p className="text-sm text-muted-foreground">@{teacher.handle}</p>
          </div>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
            Current
          </span>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select New Teacher</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                    >
                      <option value="">Select new teacher</option>
                      {teachers.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
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
              actionLabel="Confirm & Update"
              pending={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
