import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import {
  normalizeDashboard,
  type TeacherClass,
  type TeacherDashboard,
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
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

export async function getTeacherDashboard(
  classId?: string,
): Promise<TeacherDashboard> {
  const query = classId ? { classId } : undefined;
  const raw = await callApi<unknown>(() =>
    asCall(client().GET("/teacher/dashboard", { params: { query } })),
  );
  return normalizeDashboard(raw);
}

export async function getTeacherClasses(): Promise<TeacherClass[]> {
  try {
    const result = await callApi<{ items?: TeacherClass[] } | TeacherClass[]>(() =>
      asCall(client().GET("/teacher/classes")),
    );
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.items)) return result.items;
    return [];
  } catch {
    return [];
  }
}
