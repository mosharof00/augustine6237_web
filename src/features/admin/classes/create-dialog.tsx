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
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/envelope";
import { createClass } from "./api";
import {
  AGE_GROUPS,
  createClassPayload,
  createClassSchema,
  type ClassDetail,
  type CreateClassValues,
} from "./model";

export function CreateClassDialog({
  open,
  onOpenChange,
  teachers,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: { id: string; name: string }[];
  onCreated: (value: ClassDetail) => void;
}) {
  const form = useForm<CreateClassValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: { name: "", grade: "", ageGroup: "6-9", teacherId: "" },
  });

  async function onSubmit(values: CreateClassValues) {
    try {
      const created = await createClass(createClassPayload(values));
      form.reset();
      onOpenChange(false);
      onCreated(created);
    } catch (error) {
      applyApiFormError(form, {
        message: error instanceof ApiError ? error.message : "Could not create this class.",
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
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g Grade 4 . Amber" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g Grade 4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                      >
                        {AGE_GROUPS.map((group) => (
                          <option key={group.value} value={group.value}>
                            {group.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Teacher</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
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
              actionLabel="Create & Generate Code"
              pending={form.formState.isSubmitting}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
