import { z } from "zod";

export type SettingsTab = "account" | "notifications" | "preferences" | "security";

export interface TeacherAccountSettings {
  displayName: string;
  email: string;
  phone: string;
}

export interface TeacherNotificationSettings {
  email: boolean;
  push: boolean;
  weekly_reports: boolean;
  quiet_hours: boolean;
  stories: boolean;
  badges: boolean;
  game_show: boolean;
  safe_space: boolean;
}

export interface TeacherPreferenceSettings {
  dark_mode: boolean;
  language: string;
  time_zone: string;
  default_class: string;
}

export interface TeacherSettings {
  account: TeacherAccountSettings;
  notifications: TeacherNotificationSettings;
  preferences: TeacherPreferenceSettings;
}

export const accountSettingsSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
});

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;

export const notificationSettingsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  weekly_reports: z.boolean(),
  quiet_hours: z.boolean(),
  stories: z.boolean().optional(),
  badges: z.boolean().optional(),
  game_show: z.boolean().optional(),
  safe_space: z.boolean().optional(),
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;

export const preferencesSchema = z.object({
  dark_mode: z.boolean(),
  language: z.string().min(1, "Language is required"),
  time_zone: z.string().min(1, "Time zone is required"),
  default_class: z.string().optional(),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export function normalizeTeacherSettings(
  rawSettings: unknown,
  fallbackProfile?: {
    realName?: string;
    email?: string;
    phone?: string;
  } | null,
): TeacherSettings {
  const root = (rawSettings && typeof rawSettings === "object" ? rawSettings : {}) as Record<
    string,
    unknown
  >;

  const rawAccount = (root.account && typeof root.account === "object"
    ? root.account
    : {}) as Record<string, unknown>;

  const rawNotifications = (root.notifications && typeof root.notifications === "object"
    ? root.notifications
    : {}) as Record<string, unknown>;

  const rawPrefs = (root.preferences && typeof root.preferences === "object"
    ? root.preferences
    : {}) as Record<string, unknown>;

  return {
    account: {
      displayName:
        typeof rawAccount.displayName === "string" && rawAccount.displayName.trim()
          ? rawAccount.displayName.trim()
          : typeof fallbackProfile?.realName === "string" && fallbackProfile.realName.trim()
            ? fallbackProfile.realName.trim()
            : "Sarah Mitchell",
      email:
        typeof rawAccount.email === "string" && rawAccount.email.trim()
          ? rawAccount.email.trim()
          : typeof fallbackProfile?.email === "string" && fallbackProfile.email.trim()
            ? fallbackProfile.email.trim()
            : "sarah.mitchell@school.edu",
      phone:
        typeof rawAccount.phone === "string" && rawAccount.phone.trim()
          ? rawAccount.phone.trim()
          : typeof fallbackProfile?.phone === "string" && fallbackProfile.phone.trim()
            ? fallbackProfile.phone.trim()
            : "+1 (555) 123-4567",
    },
    notifications: {
      email: typeof rawNotifications.email === "boolean" ? rawNotifications.email : true,
      push: typeof rawNotifications.push === "boolean" ? rawNotifications.push : true,
      weekly_reports:
        typeof rawNotifications.weekly_reports === "boolean"
          ? rawNotifications.weekly_reports
          : false,
      quiet_hours:
        typeof rawNotifications.quiet_hours === "boolean"
          ? rawNotifications.quiet_hours
          : false,
      stories: typeof rawNotifications.stories === "boolean" ? rawNotifications.stories : true,
      badges: typeof rawNotifications.badges === "boolean" ? rawNotifications.badges : true,
      game_show:
        typeof rawNotifications.game_show === "boolean" ? rawNotifications.game_show : true,
      safe_space:
        typeof rawNotifications.safe_space === "boolean" ? rawNotifications.safe_space : true,
    },
    preferences: {
      dark_mode:
        typeof rawPrefs.dark_mode === "boolean"
          ? rawPrefs.dark_mode
          : typeof root.dark_mode === "boolean"
            ? root.dark_mode
            : false,
      language:
        typeof rawPrefs.language === "string" && rawPrefs.language.trim()
          ? rawPrefs.language.trim()
          : "English",
      time_zone:
        typeof rawPrefs.time_zone === "string" && rawPrefs.time_zone.trim()
          ? rawPrefs.time_zone.trim()
          : "Dhaka (GMT+6)",
      default_class:
        typeof rawPrefs.default_class === "string" ? rawPrefs.default_class.trim() : "",
    },
  };
}
