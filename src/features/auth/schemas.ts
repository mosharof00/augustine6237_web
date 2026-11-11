import { z } from "zod";

function requiredEmail(emptyMessage: string) {
  return z.string().superRefine((value, ctx) => {
    const trimmed = value.trim();
    if (!trimmed) {
      ctx.addIssue({ code: "custom", message: emptyMessage });
      return;
    }
    if (!z.email().safeParse(trimmed).success) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid email address",
      });
    }
  });
}

function passwordField() {
  return z
    .string()
    .min(1, "Password is required")
    .min(6, "Must be at least 6 characters");
}

function confirmField() {
  return z.string().min(1, "Confirm password is required");
}

export const signInSchema = z.object({
  email: requiredEmail("Email is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    email: requiredEmail("Email is required"),
    password: passwordField(),
    confirm: confirmField(),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const verifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const forgotPasswordSchema = z.object({
  email: requiredEmail("Email is required"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordField(),
    confirm: confirmField(),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const schoolSchema = z.object({
  name: z.string().trim().min(1, "School name is required"),
});

export const acceptInviteSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    password: passwordField(),
    confirm: confirmField(),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type SchoolValues = z.infer<typeof schoolSchema>;
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>;
