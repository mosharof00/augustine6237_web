"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { applyApiFormError } from "@/components/feedback/apply-api-form-error";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/envelope";
import {
  AuthFooter,
  AuthHeading,
  AuthSubmit,
  RootError,
  authInputClass,
} from "./auth-ui";
import { forgotPasswordSchema, type ForgotPasswordValues } from "./schemas";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      await forgotPassword({ email: values.email.trim() });
      setSent(true);
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError ? error.message : "Could not send the reset email.",
      });
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthHeading
          title="Reset Your Password"
          subtitle="Enter your email for the verification code"
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className={authInputClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {sent ? (
          <p role="status" className="text-sm text-white/80">
            Check your email for the reset link.
          </p>
        ) : null}
        <RootError message={form.formState.errors.root?.message} />
        <AuthSubmit pending={form.formState.isSubmitting}>Submit</AuthSubmit>
        <AuthFooter
          prompt="Remember your password?"
          href="/sign-in"
          label="Back to login"
        />
      </form>
    </Form>
  );
}
