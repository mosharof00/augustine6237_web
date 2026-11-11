"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { applyApiFormError } from "@/components/feedback/apply-api-form-error";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { saveSchool } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/envelope";
import {
  AuthHeading,
  AuthSubmit,
  RootError,
  authInputClass,
} from "./auth-ui";
import { goToApp } from "./navigate";
import { schoolBody } from "./payloads";
import { clearPendingSchool } from "./pending-school";
import { schoolSchema, type SchoolValues } from "./schemas";

export function SchoolForm() {
  const [ready, setReady] = useState(false);
  const form = useForm<SchoolValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: SchoolValues) {
    try {
      await saveSchool(schoolBody(values.name));
      clearPendingSchool();
      setReady(true);
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError ? error.message : "Could not save the school.",
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <AuthHeading
            title="Set up your school profile"
            subtitle="Let's personalize Wings of Power for your school."
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">School Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your school name"
                    className={authInputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <RootError message={form.formState.errors.root?.message} />
          <AuthSubmit pending={form.formState.isSubmitting}>Save & Continue</AuthSubmit>
        </form>
      </Form>
      <Dialog open={ready} onOpenChange={setReady}>
        <DialogContent showCloseButton={false} className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <Check />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle>You&apos;re All Set</DialogTitle>
            <DialogDescription>
              Your school wings of power profile is ready!
            </DialogDescription>
          </DialogHeader>
          <Button type="button" className="h-11 w-full" onClick={() => goToApp("/admin")}>
            Go to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
