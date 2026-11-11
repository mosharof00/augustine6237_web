import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import { writeCachedProfileExtra, readCachedProfileExtra } from "../profile/api";
import {
  type AccountSettingsInput,
  type NotificationSettingsInput,
  normalizeTeacherSettings,
  type PreferencesInput,
  type TeacherSettings,
} from "./model";

type Callish<T> = Promise<{
  data?: Envelope<T>;
  error?: Envelope<T>;
  response: Response;
}>;

type LooseClient = {
  GET: (
    path: string,
    init?: { params?: { query?: Record<string, string | number | undefined> } },
  ) => Callish<never>;
  POST: (path: string, init?: { body?: unknown }) => Callish<never>;
  PATCH: (path: string, init?: { body?: unknown }) => Callish<never>;
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

const SETTINGS_STORAGE_KEY = "wop_teacher_settings_cache";

function readCachedSettings(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedSettings(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const current = readCachedSettings() || {};
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...current, ...data }),
    );
  } catch {
    // Ignore storage issues in test/restricted contexts
  }
}

export async function getTeacherSettings(): Promise<TeacherSettings> {
  const [settingsRaw, profileRaw] = await Promise.allSettled([
    callApi<Record<string, unknown>>(() =>
      asCall(client().GET("/teacher/settings")),
    ),
    callApi<{ realName?: string; email?: string; phone?: string }>(() =>
      asCall(client().GET("/teacher/profile")),
    ),
  ]);

  const rawSettingsData =
    settingsRaw.status === "fulfilled" && settingsRaw.value
      ? settingsRaw.value
      : {};

  const profileData =
    profileRaw.status === "fulfilled" && profileRaw.value
      ? profileRaw.value
      : {};

  const cachedExtra = readCachedProfileExtra();
  const cachedSettings = readCachedSettings();

  const mergedSettings = {
    ...cachedSettings,
    ...rawSettingsData,
  };

  return normalizeTeacherSettings(mergedSettings, {
    realName: profileData.realName || cachedExtra?.realName,
    email: profileData.email || cachedExtra?.email,
    phone: cachedExtra?.phone,
  });
}

export async function updateTeacherAccount(
  account: AccountSettingsInput,
): Promise<TeacherSettings> {
  // Update realName via teacher profile endpoint
  await callApi<unknown>(() =>
    asCall(
      client().PATCH("/teacher/profile", {
        body: { realName: account.displayName },
      }),
    ),
  );

  // Send settings update
  try {
    await callApi<unknown>(() =>
      asCall(
        client().PATCH("/teacher/settings", {
          body: {
            account: {
              displayName: account.displayName,
              email: account.email,
              phone: account.phone,
            },
          },
        }),
      ),
    );
  } catch {
    // If backend strips unknown settings keys, local cache persists
  }

  writeCachedSettings({
    account: {
      displayName: account.displayName,
      email: account.email,
      phone: account.phone,
    },
  });

  writeCachedProfileExtra({
    realName: account.displayName,
    email: account.email,
    phone: account.phone,
  });

  return getTeacherSettings();
}

export async function updateTeacherNotifications(
  notifications: NotificationSettingsInput,
): Promise<TeacherSettings> {
  try {
    await callApi<unknown>(() =>
      asCall(
        client().PATCH("/teacher/settings", {
          body: { notifications },
        }),
      ),
    );
  } catch {
    // Fallback if settings endpoint has strict whitelist
  }

  writeCachedSettings({ notifications });
  return getTeacherSettings();
}

export async function updateTeacherPreferences(
  preferences: PreferencesInput,
): Promise<TeacherSettings> {
  try {
    await callApi<unknown>(() =>
      asCall(
        client().PATCH("/teacher/settings", {
          body: { preferences },
        }),
      ),
    );
  } catch {
    // Fallback if settings endpoint has strict whitelist
  }

  writeCachedSettings({ preferences });
  return getTeacherSettings();
}

export async function changePassword(input: {
  current: string;
  next: string;
}): Promise<{ success: boolean; message?: string }> {
  const result = await callApi<{ message?: string }>(() =>
    asCall(
      client().PATCH("/auth/password", {
        body: { current: input.current, next: input.next },
      }),
    ),
  );

  return { success: true, message: result?.message || "Password updated successfully" };
}

export async function getTeacherClassesOptions(): Promise<
  Array<{ id: string; name: string }>
> {
  try {
    const raw = await callApi<{ items?: Array<{ id: string; name: string }> } | Array<{ id: string; name: string }>>(() =>
      asCall(client().GET("/teacher/classes")),
    );
    if (Array.isArray(raw)) {
      return raw.map((c) => ({ id: c.id, name: c.name }));
    }
    if (Array.isArray(raw?.items)) {
      return raw.items.map((c) => ({ id: c.id, name: c.name }));
    }
    return [];
  } catch {
    return [];
  }
}
