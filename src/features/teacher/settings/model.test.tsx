import { describe, expect, it } from "vitest";
import {
  accountSettingsSchema,
  changePasswordSchema,
  normalizeTeacherSettings,
  notificationSettingsSchema,
  preferencesSchema,
} from "./model";

describe("Teacher Settings Model", () => {
  describe("normalizeTeacherSettings", () => {
    it("provides defaults when raw payload is null or empty", () => {
      const settings = normalizeTeacherSettings(null);
      expect(settings.account.displayName).toBe("Sarah Mitchell");
      expect(settings.account.email).toBe("sarah.mitchell@school.edu");
      expect(settings.account.phone).toBe("+1 (555) 123-4567");
      expect(settings.notifications.email).toBe(true);
      expect(settings.notifications.push).toBe(true);
      expect(settings.notifications.weekly_reports).toBe(false);
      expect(settings.notifications.quiet_hours).toBe(false);
      expect(settings.preferences.dark_mode).toBe(false);
      expect(settings.preferences.language).toBe("English");
      expect(settings.preferences.time_zone).toBe("Dhaka (GMT+6)");
      expect(settings.preferences.default_class).toBe("");
    });

    it("uses profile data as fallback for account fields", () => {
      const fallback = {
        realName: "Jane Doe",
        email: "jane@school.org",
        phone: "+1 555 999 8888",
      };
      const settings = normalizeTeacherSettings({}, fallback);
      expect(settings.account.displayName).toBe("Jane Doe");
      expect(settings.account.email).toBe("jane@school.org");
      expect(settings.account.phone).toBe("+1 555 999 8888");
    });

    it("parses stored raw settings accurately", () => {
      const raw = {
        account: {
          displayName: "Alice Smith",
          email: "alice@school.edu",
          phone: "+1 234 567 8900",
        },
        notifications: {
          email: false,
          push: true,
          weekly_reports: true,
          quiet_hours: true,
        },
        preferences: {
          dark_mode: true,
          language: "Spanish",
          time_zone: "UTC (GMT+0)",
          default_class: "cls-1",
        },
      };

      const settings = normalizeTeacherSettings(raw);
      expect(settings.account.displayName).toBe("Alice Smith");
      expect(settings.notifications.email).toBe(false);
      expect(settings.notifications.weekly_reports).toBe(true);
      expect(settings.notifications.quiet_hours).toBe(true);
      expect(settings.preferences.dark_mode).toBe(true);
      expect(settings.preferences.language).toBe("Spanish");
      expect(settings.preferences.time_zone).toBe("UTC (GMT+0)");
      expect(settings.preferences.default_class).toBe("cls-1");
    });
  });

  describe("accountSettingsSchema", () => {
    it("validates correct account settings input", () => {
      const result = accountSettingsSchema.safeParse({
        displayName: "Sarah Mitchell",
        email: "sarah@school.edu",
        phone: "+1 (555) 123-4567",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty displayName or invalid email", () => {
      const res1 = accountSettingsSchema.safeParse({
        displayName: "   ",
        email: "sarah@school.edu",
      });
      expect(res1.success).toBe(false);

      const res2 = accountSettingsSchema.safeParse({
        displayName: "Sarah Mitchell",
        email: "bad-email",
      });
      expect(res2.success).toBe(false);
    });
  });

  describe("notificationSettingsSchema", () => {
    it("validates notification toggles", () => {
      const result = notificationSettingsSchema.safeParse({
        email: true,
        push: false,
        weekly_reports: true,
        quiet_hours: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("preferencesSchema", () => {
    it("validates preferences inputs", () => {
      const result = preferencesSchema.safeParse({
        dark_mode: false,
        language: "English",
        time_zone: "Dhaka (GMT+6)",
        default_class: "class-101",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing language", () => {
      const result = preferencesSchema.safeParse({
        dark_mode: false,
        language: "",
        time_zone: "UTC",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("accepts matching passwords with minimum 8 characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects password shorter than 8 characters", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpassword123",
        newPassword: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password mismatch between new and confirm", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        confirmPassword: "differentpassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Passwords do not match");
      }
    });

    it("rejects empty current password", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      });
      expect(result.success).toBe(false);
    });
  });
});
