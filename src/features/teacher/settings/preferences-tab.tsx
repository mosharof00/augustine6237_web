"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import type { PreferencesInput, TeacherPreferenceSettings } from "./model";

interface PreferencesTabProps {
  initialData: TeacherPreferenceSettings;
  classes: Array<{ id: string; name: string }>;
  onSave: (data: PreferencesInput) => Promise<void>;
}

export function PreferencesTab({
  initialData,
  classes,
  onSave,
}: PreferencesTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesInput>({
    dark_mode: initialData.dark_mode,
    language: initialData.language,
    time_zone: initialData.time_zone,
    default_class: initialData.default_class,
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-xs">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Dashboard Preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize your dashboard layout, appearance, and display preferences to
          create a more personalized teaching experience.
        </p>
      </div>

      <div className="space-y-5">
        {/* Language */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Language
          </label>
          <div className="relative">
            <select
              aria-label="Select Language"
              value={preferences.language}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, language: e.target.value }))
              }
              className="h-11 w-full appearance-none rounded-lg border border-input bg-muted/20 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Time Zone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Time Zone
          </label>
          <div className="relative">
            <select
              aria-label="Select Time Zone"
              value={preferences.time_zone}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, time_zone: e.target.value }))
              }
              className="h-11 w-full appearance-none rounded-lg border border-input bg-muted/20 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Dhaka (GMT+6)">Dhaka (GMT+6)</option>
              <option value="UTC (GMT+0)">UTC (GMT+0)</option>
              <option value="New York (EST / GMT-5)">New York (EST / GMT-5)</option>
              <option value="Los Angeles (PST / GMT-8)">
                Los Angeles (PST / GMT-8)
              </option>
              <option value="London (BST / GMT+1)">London (BST / GMT+1)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Default Class */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Default Class
          </label>
          <div className="relative">
            <select
              aria-label="Select Default Class"
              value={preferences.default_class ?? ""}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  default_class: e.target.value,
                }))
              }
              className="h-11 w-full appearance-none rounded-lg border border-input bg-muted/20 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Classes (Default)</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between rounded-lg bg-muted/20 p-4 transition-colors hover:bg-muted/30">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">
              Use a darker dashboard appearance.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Toggle Dark Mode"
            aria-checked={preferences.dark_mode}
            onClick={() =>
              setPreferences((prev) => ({
                ...prev,
                dark_mode: !prev.dark_mode,
              }))
            }
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              preferences.dark_mode ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                preferences.dark_mode ? "translate-x-5" : "translate-x-0",
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
