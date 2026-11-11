import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import {
  normalizeStudentDetail,
  normalizeStudentItem,
  type TeacherStudentDetail,
  type TeacherStudentItem,
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
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

export async function getTeacherStudents(query?: {
  page?: number;
  perPage?: number;
  classId?: string;
  status?: string;
  search?: string;
}): Promise<Page<TeacherStudentItem>> {
  const params = query ? { params: { query } } : undefined;
  const raw = await callApi<
    | { items?: unknown[]; total?: number; page?: number; perPage?: number; lastPage?: number }
    | unknown[]
  >(() => asCall(client().GET("/teacher/students", params)));

  if (Array.isArray(raw)) {
    const items = raw.map((item, idx) => normalizeStudentItem(item, idx));
    return {
      items,
      total: items.length,
      page: 1,
      perPage: items.length || 12,
      lastPage: 1,
    };
  }

  const rawItems = Array.isArray(raw?.items) ? raw.items : [];
  return {
    items: rawItems.map((item, idx) => normalizeStudentItem(item, idx)),
    total: typeof raw?.total === "number" ? raw.total : rawItems.length,
    page: typeof raw?.page === "number" ? raw.page : 1,
    perPage: typeof raw?.perPage === "number" ? raw.perPage : 12,
    lastPage: typeof raw?.lastPage === "number" ? raw.lastPage : 1,
  };
}

export async function getTeacherStudent(id: string): Promise<TeacherStudentDetail> {
  const raw = await callApi<unknown>(() =>
    asCall(client().GET(`/teacher/students/${id}`)),
  );
  return normalizeStudentDetail(raw);
}

export async function getTeacherClassesList(): Promise<
  { id: string; name: string; gradeLabel?: string | null }[]
> {
  try {
    const raw = await callApi<
      | { items?: { id: string; name: string; gradeLabel?: string | null }[] }
      | { id: string; name: string; gradeLabel?: string | null }[]
    >(() => asCall(client().GET("/teacher/classes")));

    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  } catch {
    return [];
  }
}
