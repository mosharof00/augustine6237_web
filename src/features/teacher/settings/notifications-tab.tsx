"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import type { NotificationSettingsInput, TeacherNotificationSettings } from "./model";

interface NotificationsTabProps {
  initialData: TeacherNotificationSettings;
  onSave: (data: NotificationSettingsInput) => Promise<void>;
}

export function NotificationsTab({ initialData, onSave }: NotificationsTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsInput>({
    email: initialData.email,
    push: initialData.push,
    weekly_reports: initialData.weekly_reports,
    quiet_hours: initialData.quiet_hours,
    stories: initialData.stories,
    badges: initialData.badges,
    game_show: initialData.game_show,
    safe_space: initialData.safe_space,
  });

  const toggle = (key: keyof NotificationSettingsInput) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-xs">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Notification Preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose which updates you want to receive.
        </p>
      </div>

      <div className="space-y-3.5">
        {/* Email Notifications */}
        <div className="flex items-center justify-between rounded-lg bg-muted/20 p-4 transition-colors hover:bg-muted/30">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Email Notifications
            </p>
            <p className="text-xs text-muted-foreground">
              Receive important updates by email.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Toggle Email Notifications"
            aria-checked={settings.email}
            onClick={() => toggle("email")}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              settings.email ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                settings.email ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between rounded-lg bg-muted/20 p-4 transition-colors hover:bg-muted/30">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Push Notifications
            </p>
            <p className="text-xs text-muted-foreground">
              Get alerts about assignments and classes.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Toggle Push Notifications"
            aria-checked={settings.push}
            onClick={() => toggle("push")}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              settings.push ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                settings.push ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        {/* Weekly Reports */}
        <div className="flex items-center justify-between rounded-lg bg-muted/20 p-4 transition-colors hover:bg-muted/30">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Weekly Reports
            </p>
            <p className="text-xs text-muted-foreground">
              Receive a weekly teaching activity summary.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Toggle Weekly Reports"
            aria-checked={settings.weekly_reports}
            onClick={() => toggle("weekly_reports")}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              settings.weekly_reports ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                settings.weekly_reports ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        {/* Quiet Hours */}
        <div className="flex items-center justify-between rounded-lg bg-muted/20 p-4 transition-colors hover:bg-muted/30">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Quiet Hours
            </p>
            <p className="text-xs text-muted-foreground">
              Silence notifications outside school hours.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Toggle Quiet Hours"
            aria-checked={settings.quiet_hours}
            onClick={() => toggle("quiet_hours")}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              settings.quiet_hours ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                settings.quiet_hours ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 font-medium"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
