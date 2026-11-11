"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { registerUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/envelope";
import {
  AuthFooter,
  AuthHeading,
  AuthSubmit,
  PasswordInput,
  RootError,
  authInputClass,
} from "./auth-ui";
import { signUpSchema, type SignUpValues } from "./schemas";

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  async function onSubmit(values: SignUpValues) {
    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        type: "CLIENT",
      });
      router.push("/sign-in?registered=true");
    } catch (error) {
      applyApiFormError(form, {
        message:
          error instanceof ApiError ? error.message : "Could not create the account.",
      });
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthHeading
          title="Create BetSocial Account"
          subtitle="Join the social prediction & matched betting community"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
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
              <FormLabel className="text-primary">Set Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder="Create a strong password"
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
        <AuthSubmit pending={form.formState.isSubmitting}>
          Create Account
        </AuthSubmit>
        <AuthFooter
          prompt="Already have an account?"
          href="/sign-in"
          label="Sign In Here"
        />
      </form>
    </Form>
  );
}
