"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { applyApiFormError } from "@/components/feedback/apply-api-form-error";
import { toastSuccess } from "@/components/feedback/toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/envelope";
import { AuthHeading, AuthSubmit, PasswordInput, RootError } from "./auth-ui";
import { resetPasswordBody } from "./payloads";
import { resetPasswordSchema, type ResetPasswordValues } from "./schemas";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      form.setError("root", { message: "This reset link is missing a token." });
      return;
    }
    try {
      await resetPassword(resetPasswordBody(token, values.password));
      toastSuccess({
        title: "Password updated",
        description: "Sign in with your new password.",
      });
      router.push("/sign-in");
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError ? error.message : "Could not set the password.",
      });
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthHeading
          title="Set New Password"
          subtitle="Must be at least 8 character"
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">New password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RootError message={form.formState.errors.root?.message} />
        <AuthSubmit pending={form.formState.isSubmitting}>Set New Password</AuthSubmit>
      </form>
    </Form>
  );
}
