"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { getMe, loginUser } from "@/lib/api/auth";
import { writeAccessToken } from "@/lib/auth/storage";
import {
  AuthFooter,
  AuthHeading,
  AuthSubmit,
  PasswordInput,
  RootError,
  authInputClass,
} from "./auth-ui";
import { goToApp } from "./navigate";
import { userHome } from "./routing";
import { signInSchema, type SignInValues } from "./schemas";
import { readSignInError, rememberSignInError } from "./sign-in-error";

export function SignInForm() {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  useEffect(() => {
    const message = readSignInError();
    if (!message) return;
    const timeout = window.setTimeout(() => {
      form.setError("root", { message });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [form]);

  async function onSubmit(values: SignInValues) {
    try {
      const session = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });
      writeAccessToken(session.accessToken, values.remember);
      let user = session.user;
      try {
        const me = await getMe();
        if (me) user = me;
      } catch {
        // Fall back to login session user
      }
      const role = user?.type ?? user?.role ?? session.type;
      goToApp(userHome(role));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Could not sign in.";
      rememberSignInError(message);
      form.setError("root", { message });
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthHeading
          title="Welcome Back"
          subtitle="Sign in to your BetSocial account"
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 text-white/90">
                  <FormControl>
                    <input
                      type="checkbox"
                      name={field.name}
                      ref={field.ref}
                      checked={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="size-4 accent-primary"
                    />
                  </FormControl>
                  Remember the device
                </label>
              </FormItem>
            )}
          />
          <Link href="/forgot-password" className="font-medium text-primary">
            Forgot Password?
          </Link>
        </div>
        <RootError message={form.formState.errors.root?.message} />
        <AuthSubmit pending={form.formState.isSubmitting}>Sign In</AuthSubmit>
        <AuthFooter
          prompt="Don't have any account?"
          href="/sign-up"
          label="Sign Up Here"
        />
      </form>
    </Form>
  );
}
