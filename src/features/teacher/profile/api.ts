import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import {
  normalizeTeacherProfile,
  type TeacherProfile,
  type UpdateProfileInput,
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
  PATCH: (path: string, init?: { body?: unknown }) => Callish<never>;
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

const PROFILE_STORAGE_KEY = "wop_teacher_profile_extra";

export function readCachedProfileExtra(): Partial<TeacherProfile> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<TeacherProfile>) : null;
  } catch {
    return null;
  }
}

export function writeCachedProfileExtra(extra: Partial<TeacherProfile>): void {
  if (typeof window === "undefined") return;
  try {
    const current = readCachedProfileExtra() || {};
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ ...current, ...extra }),
    );
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export async function getTeacherProfile(): Promise<TeacherProfile> {
  const raw = await callApi<unknown>(() =>
    asCall(client().GET("/teacher/profile")),
  );

  const cachedExtra = readCachedProfileExtra();
  return normalizeTeacherProfile(raw, cachedExtra);
}

export async function updateTeacherProfile(
  input: UpdateProfileInput,
): Promise<TeacherProfile> {
  // Save realName to backend profile API
  await callApi<unknown>(() =>
    asCall(
      client().PATCH("/teacher/profile", {
        body: { realName: input.realName },
      }),
    ),
  );

  // Cache additional visual/biographical fields locally
  const extraToCache: Partial<TeacherProfile> = {
    realName: input.realName,
    email: input.email,
    phone: input.phone,
    title: input.title,
    avatarUrl: input.avatarUrl,
    bio: input.bio,
    department: input.department,
    qualification: input.qualification,
    experience: input.experience,
    dob: input.dob,
    gender: input.gender,
    address: input.address,
  };
  writeCachedProfileExtra(extraToCache);

  // Return refreshed full profile
  return getTeacherProfile();
}
