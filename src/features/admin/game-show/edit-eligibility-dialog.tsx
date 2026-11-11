"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/envelope";
import { updateEligibilityConfig } from "./api";
import {
  updateEligibilitySchema,
  type EligibilityConfig,
  type UpdateEligibilityInput,
} from "./model";

export function EditEligibilityDialog({
  open,
  onOpenChange,
  config,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: EligibilityConfig;
  onSaved: (updated: EligibilityConfig) => void;
}) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<UpdateEligibilityInput>({
    resolver: zodResolver(updateEligibilitySchema),
    values: {
      requiredStories: config.requiredStories,
      requiredChapters: config.requiredChapters,
      minQuizPercent: config.minQuizPercent,
    },
  });

  async function onSubmit(values: UpdateEligibilityInput) {
    setIsPending(true);
    try {
      const updated = await updateEligibilityConfig(values);
      toast.success("Game show eligibility rules updated");
      onSaved(updated);
      onOpenChange(false);
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError
            ? error.message
            : "Could not update eligibility rules",
      });
      toast.error("Failed to update eligibility rules");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Game Show Rules</DialogTitle>
          <DialogDescription>
            Update eligibility criteria for students participating in classroom
            game shows.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requiredStories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Stories</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="2"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Total number of completed stories required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiredChapters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Chapters</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="6"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Total number of completed chapters required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minQuizPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Comprehension %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      placeholder="70"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum average chapter quiz score percentage required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogActions
              onCancel={() => onOpenChange(false)}
              actionLabel="Save Changes"
              pending={isPending}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
