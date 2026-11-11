"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { toastSuccess } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
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
import { changePassword } from "./api";
import { type ChangePasswordInput, changePasswordSchema } from "./model";

export function SecurityTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: ChangePasswordInput) => {
    setServerError(null);
    try {
      setIsSubmitting(true);
      await changePassword({
        current: values.currentPassword,
        next: values.newPassword,
      });

      toastSuccess({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      form.reset();
      setIsFormOpen(false);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update password. Please check your credentials.";

      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-xs">
      {!isFormOpen ? (
        <div>
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Security & Privacy
            </h2>
            <p className="text-sm text-muted-foreground">
              Keep your teacher account secure.
            </p>
          </div>

          <div className="space-y-4">
            {/* Password Row */}
            <div className="flex flex-col gap-4 rounded-lg bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">
                  Last updated 45 days ago
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setServerError(null);
                  form.reset();
                  setIsFormOpen(true);
                }}
                className="self-start border-primary/40 text-primary hover:bg-primary/10 sm:self-center"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Change Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Keep your account secure by using a strong, unique password.
            </p>
          </div>

          {serverError && (
            <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
              {serverError}
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Current Password */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      Current Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter Current Password"
                          className="h-11 bg-muted/20 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label={
                            showCurrentPassword
                              ? "Hide current password"
                              : "Show current password"
                          }
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new passsword"
                          className="h-11 bg-muted/20 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label={
                            showNewPassword
                              ? "Hide new password"
                              : "Show new password"
                          }
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm New Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter new password"
                          className="h-11 bg-muted/20 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setServerError(null);
                    form.reset();
                    setIsFormOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
