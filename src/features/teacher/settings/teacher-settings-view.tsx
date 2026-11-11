"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { toastSuccess } from "@/components/feedback/toast";
import { ApiError } from "@/lib/api/envelope";
import { cn } from "cn";
import {
  getTeacherClassesOptions,
  getTeacherSettings,
  updateTeacherAccount,
  updateTeacherNotifications,
  updateTeacherPreferences,
} from "./api";
import {
  type AccountSettingsInput,
  type NotificationSettingsInput,
  type PreferencesInput,
  type SettingsTab,
  type TeacherSettings,
} from "./model";
import { AccountTab } from "./account-tab";
import { NotificationsTab } from "./notifications-tab";
import { PreferencesTab } from "./preferences-tab";
import { SecurityTab } from "./security-tab";

export function TeacherSettingsView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TeacherSettings>({
    queryKey: ["teacher", "settings"],
    queryFn: getTeacherSettings,
  });

  const { data: classes = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["teacher", "classes", "options"],
    queryFn: getTeacherClassesOptions,
  });

  const updateAccountMutation = useMutation({
    mutationFn: (data: AccountSettingsInput) => updateTeacherAccount(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["teacher", "settings"], updated);
      queryClient.invalidateQueries({ queryKey: ["teacher", "profile"] });
      toastSuccess({
        title: "Account saved",
        description: "Your account details have been updated.",
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not update account settings.",
      );
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (data: NotificationSettingsInput) =>
      updateTeacherNotifications(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["teacher", "settings"], updated);
      toastSuccess({
        title: "Notifications saved",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not update notification preferences.",
      );
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: PreferencesInput) => updateTeacherPreferences(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["teacher", "settings"], updated);
      toastSuccess({
        title: "Preferences saved",
        description: "Your dashboard preferences have been updated.",
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not update dashboard preferences.",
      );
    },
  });

  if (isLoading) {
    return <LoadingState count={3} />;
  }

  if (isError || !settings) {
    return (
      <ErrorState
        message={
          error instanceof ApiError
            ? error.message
            : "Could not load settings. Please try again."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notification" },
    { id: "preferences", label: "Preferences" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, preferences, and dashboard experience.
        </p>
      </div>

      {/* Settings Tab Navigation */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative -mb-px px-6 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "account" && (
          <AccountTab
            initialData={settings.account}
            onSave={async (data) => {
              await updateAccountMutation.mutateAsync(data);
            }}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab
            initialData={settings.notifications}
            onSave={async (data) => {
              await updateNotificationsMutation.mutateAsync(data);
            }}
          />
        )}

        {activeTab === "preferences" && (
          <PreferencesTab
            initialData={settings.preferences}
            classes={classes}
            onSave={async (data) => {
              await updatePreferencesMutation.mutateAsync(data);
            }}
          />
        )}

        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}
