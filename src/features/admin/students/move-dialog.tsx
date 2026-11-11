"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { applyApiFormError } from "@/components/feedback/apply-api-form-error";
import { DialogActions } from "@/components/feedback/dialog-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { moveStudent } from "./api";
import { moveClassPayload, type ClassOption } from "./model";

const moveSchema = z.object({
  classId: z.string().min(1, "Choose a class"),
});

type MoveValues = z.infer<typeof moveSchema>;

export function MoveClassDialog({
  studentId,
  studentName,
  options,
  open,
  onOpenChange,
  onMoved,
}: {
  studentId: string;
  studentName: string;
  options: ClassOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoved: (className: string) => void;
}) {
  const form = useForm<MoveValues>({
    resolver: zodResolver(moveSchema),
    defaultValues: { classId: "" },
  });

  async function onSubmit(values: MoveValues) {
    try {
      await moveStudent(studentId, moveClassPayload(values.classId).classId);
      const name = options.find((option) => option.id === values.classId)?.name ?? "the new class";
      form.reset();
      onOpenChange(false);
      onMoved(name);
    } catch (error) {
      applyApiFormError(form, {
        message: error instanceof ApiError ? error.message : "Could not move this student.",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Another class</DialogTitle>
          <DialogDescription>
            Select the destination classroom for {studentName}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Class</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                    >
                      <option value="">Select a class</option>
                      {options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
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
              actionLabel="Confirm & Move"
              pending={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
