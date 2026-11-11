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
import { Input } from "@/components/ui/input";
import { acceptTeacherInvite } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/envelope";
import { writeAccessToken } from "@/lib/auth/storage";
import {
  AuthHeading,
  AuthSubmit,
  PasswordInput,
  RootError,
  authInputClass,
} from "./auth-ui";
import { goToApp } from "./navigate";
import { acceptInviteBody } from "./payloads";
import { accessTokenFrom } from "./routing";
import { acceptInviteSchema, type AcceptInviteValues } from "./schemas";

export function AcceptInviteForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: "", password: "", confirm: "" },
  });

  async function onSubmit(values: AcceptInviteValues) {
    if (!token) {
      form.setError("root", { message: "This invite link is missing a token." });
      return;
    }
    try {
      const data = await acceptTeacherInvite(
        acceptInviteBody({
          token,
          name: values.name,
          password: values.password,
        }),
      );
      const accessToken = accessTokenFrom(data);
      if (accessToken) {
        writeAccessToken(accessToken, false);
        goToApp("/teacher");
        return;
      }
      toastSuccess({
        title: "Invite accepted",
        description: "Sign in with your new password.",
      });
      router.push("/sign-in");
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError ? error.message : "Could not accept the invite.",
      });
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthHeading
          title="Accept your invite"
          subtitle="Must be at least 8 character"
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Full Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={authInputClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
