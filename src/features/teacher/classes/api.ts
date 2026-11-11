import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import {
  normalizeClassDetail,
  normalizeClassRow,
  normalizeJoinRequest,
  type TeacherClassDetail,
  type TeacherClassRow,
  type TeacherJoinRequest,
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

export async function getTeacherClasses(query?: {
  page?: number;
  perPage?: number;
  q?: string;
}): Promise<Page<TeacherClassRow>> {
  const params = query ? { params: { query } } : undefined;
  const raw = await callApi<
    | { items?: unknown[]; total?: number; page?: number; perPage?: number; lastPage?: number }
    | unknown[]
  >(() => asCall(client().GET("/teacher/classes", params)));

  if (Array.isArray(raw)) {
    const items = raw.map((item, idx) => normalizeClassRow(item, idx));
    return {
      items,
      total: items.length,
      page: 1,
      perPage: items.length || 10,
      lastPage: 1,
    };
  }

  const rawItems = Array.isArray(raw?.items) ? raw.items : [];
  return {
    items: rawItems.map((item, idx) => normalizeClassRow(item, idx)),
    total: typeof raw?.total === "number" ? raw.total : rawItems.length,
    page: typeof raw?.page === "number" ? raw.page : 1,
    perPage: typeof raw?.perPage === "number" ? raw.perPage : 10,
    lastPage: typeof raw?.lastPage === "number" ? raw.lastPage : 1,
  };
}

export async function getTeacherClass(id: string): Promise<TeacherClassDetail> {
  const raw = await callApi<unknown>(() =>
    asCall(client().GET(`/teacher/classes/${id}`)),
  );

  // Also query class students to populate class detail students tab
  let classStudents: unknown[] = [];
  try {
    const studentsRaw = await callApi<{ items?: unknown[] } | unknown[]>(() =>
      asCall(client().GET("/teacher/students", { params: { query: { classId: id, perPage: 50 } } })),
    );
    if (Array.isArray(studentsRaw)) {
      classStudents = studentsRaw;
    } else if (Array.isArray(studentsRaw?.items)) {
      classStudents = studentsRaw.items;
    }
  } catch {
    // If student list query fails or is empty, fallback gracefully
    classStudents = [];
  }

  const rawObj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const detail = normalizeClassDetail({
    ...rawObj,
    students: classStudents.length > 0 ? classStudents : rawObj.students,
  });

  return detail;
}

export async function getTeacherClassJoinRequests(
  id: string,
  query?: { page?: number; perPage?: number },
): Promise<Page<TeacherJoinRequest>> {
  const params = query ? { params: { query } } : undefined;
  const raw = await callApi<{
    items?: unknown[];
    total?: number;
    page?: number;
    perPage?: number;
    lastPage?: number;
  }>(() => asCall(client().GET(`/teacher/classes/${id}/join-requests`, params)));

  const rawItems = Array.isArray(raw?.items) ? raw.items : [];
  return {
    items: rawItems.map(normalizeJoinRequest),
    total: typeof raw?.total === "number" ? raw.total : rawItems.length,
    page: typeof raw?.page === "number" ? raw.page : 1,
    perPage: typeof raw?.perPage === "number" ? raw.perPage : 10,
    lastPage: typeof raw?.lastPage === "number" ? raw.lastPage : 1,
  };
}

export async function approveJoinRequest(id: string): Promise<{ success: boolean; message?: string }> {
  const raw = await callApi<{ message?: string }>(() =>
    asCall(client().POST(`/teacher/join-requests/${id}/approve`)),
  );
  return { success: true, message: raw?.message || "Join request approved" };
}

export async function rejectJoinRequest(id: string): Promise<{ success: boolean; message?: string }> {
  const raw = await callApi<{ message?: string }>(() =>
    asCall(client().POST(`/teacher/join-requests/${id}/reject`)),
  );
  return { success: true, message: raw?.message || "Join request rejected" };
}
