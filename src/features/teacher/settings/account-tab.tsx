"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  type AccountSettingsInput,
  accountSettingsSchema,
  type TeacherAccountSettings,
} from "./model";

interface AccountTabProps {
  initialData: TeacherAccountSettings;
  onSave: (data: AccountSettingsInput) => Promise<void>;
}

export function AccountTab({ initialData, onSave }: AccountTabProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AccountSettingsInput>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      displayName: initialData.displayName,
      email: initialData.email,
      phone: initialData.phone,
    },
  });

  const handleSubmit = async (values: AccountSettingsInput) => {
    try {
      setIsSaving(true);
      await onSave(values);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-xs">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Account Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Update your account details and contact information.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-muted-foreground">
                  Display Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    className="h-11 bg-muted/20"
                    {...field}
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
                <FormLabel className="text-xs font-semibold text-muted-foreground">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 bg-muted/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-muted-foreground">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your phone number"
                    className="h-11 bg-muted/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="px-6 font-medium"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
