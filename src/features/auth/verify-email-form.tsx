"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { applyApiFormError } from "@/components/feedback/apply-api-form-error";
import { toastSuccess } from "@/components/feedback/toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/envelope";
import { writeAccessToken } from "@/lib/auth/storage";
import { AuthHeading, AuthSubmit, RootError } from "./auth-ui";
import { goToApp } from "./navigate";
import { readPendingEmail } from "./pending-school";
import { accessTokenFrom } from "./routing";
import { verifyEmailSchema, type VerifyEmailValues } from "./schemas";

export function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? readPendingEmail() ?? "";
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: VerifyEmailValues) {
    if (!email) {
      form.setError("root", {
        message: "Go back and enter the email you registered with.",
      });
      return;
    }
    try {
      const data = await verifyEmail({ email, code: values.code });
      const token = accessTokenFrom(data);
      if (token) {
        writeAccessToken(token, false);
        goToApp("/onboarding/school");
        return;
      }
      toastSuccess({
        title: "Email verified",
        description: "Sign in to finish setting up your school.",
      });
      router.push("/sign-in");
    } catch (error) {
      applyApiFormError(form, {
        message: error instanceof ApiError ? error.message : "Could not verify the code.",
      });
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthHeading
          title="Email Verification"
          subtitle={
            email
              ? `Enter the 6-digit code sent to ${email}`
              : "Enter the 6-digit code sent to your email"
          }
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex justify-between gap-2">
                  {Array.from({ length: 6 }, (_, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        inputs.current[index] = node;
                        if (index === 0) field.ref(node);
                      }}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      aria-label={`Digit ${index + 1}`}
                      maxLength={1}
                      value={field.value[index] ?? ""}
                      className="h-12 w-12 rounded-lg bg-white text-center text-lg text-foreground outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        const digit = event.target.value.replace(/\D/g, "").slice(-1);
                        const chars = Array.from({ length: 6 }, (__, slot) => {
                          return field.value[slot] ?? "";
                        });
                        chars[index] = digit;
                        field.onChange(chars.join(""));
                        if (digit && index < 5) inputs.current[index + 1]?.focus();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Backspace" && !field.value[index] && index > 0) {
                          inputs.current[index - 1]?.focus();
                        }
                      }}
                      onPaste={(event) => {
                        const text = event.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        if (!text) return;
                        event.preventDefault();
                        field.onChange(text);
                        inputs.current[Math.min(text.length, 5)]?.focus();
                      }}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RootError message={form.formState.errors.root?.message} />
        <AuthSubmit pending={form.formState.isSubmitting}>Verify</AuthSubmit>
        <p className="text-center text-sm text-white/80">
          Don&apos;t receive code?{" "}
          <button type="button" className="font-medium text-primary">
            Resend Again
          </button>
        </p>
      </form>
    </Form>
  );
}
