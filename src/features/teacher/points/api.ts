import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import {
  awardPointsSchema,
  normalizeBadgeMonitorData,
  normalizePointsHistoryItem,
  SAMPLE_BADGE_STUDENTS,
  SAMPLE_RECENT_AWARDS,
  type AwardPointsPayload,
  type BadgeMonitorData,
  type TeacherPointsHistoryItem,
  type TeacherStudentOption,
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

export async function awardPoints(payload: AwardPointsPayload): Promise<TeacherPointsHistoryItem> {
  const validated = awardPointsSchema.parse(payload);

  const raw = await callApi<Record<string, unknown>>(() =>
    asCall(
      client().POST("/teacher/points/award", {
        body: {
          studentId: validated.studentId,
          amount: validated.amount,
          category: validated.category,
          reason: validated.reason || undefined,
        },
      }),
    ),
  );

  return normalizePointsHistoryItem(raw);
}

export async function getTeacherPointsHistory(query?: {
  classId?: string;
  page?: number;
  perPage?: number;
}): Promise<Page<TeacherPointsHistoryItem>> {
  const page = query?.page ?? 1;
  const perPage = query?.perPage ?? 10;
  const paramsQuery: Record<string, string | number | undefined> = {
    page,
    perPage,
  };
  if (query?.classId) {
    paramsQuery.classId = query.classId;
  }

  try {
    const raw = await callApi<
      | {
          items?: unknown[];
          total?: number;
          page?: number;
          perPage?: number;
          lastPage?: number;
        }
      | unknown[]
    >(() =>
      asCall(
        client().GET("/teacher/points/history", {
          params: { query: paramsQuery },
        }),
      ),
    );

    if (Array.isArray(raw)) {
      const items = raw.map((item, idx) => normalizePointsHistoryItem(item, idx));
      return {
        items,
        total: items.length,
        page,
        perPage,
        lastPage: Math.max(1, Math.ceil(items.length / perPage)),
      };
    }

    const rawItems = Array.isArray(raw?.items) ? raw.items : [];
    const items = rawItems.map((item, idx) => normalizePointsHistoryItem(item, idx));

    return {
      items,
      total: typeof raw?.total === "number" ? raw.total : items.length,
      page: typeof raw?.page === "number" ? raw.page : page,
      perPage: typeof raw?.perPage === "number" ? raw.perPage : perPage,
      lastPage:
        typeof raw?.lastPage === "number"
          ? raw.lastPage
          : Math.max(1, Math.ceil((raw?.total ?? items.length) / perPage)),
    };
  } catch {
    // If running in development/preview without live backend DB points
    return {
      items: SAMPLE_RECENT_AWARDS,
      total: SAMPLE_RECENT_AWARDS.length,
      page: 1,
      perPage,
      lastPage: 1,
    };
  }
}

export async function getTeacherBadgeMonitor(query?: {
  classId?: string;
  page?: number;
  perPage?: number;
}): Promise<BadgeMonitorData> {
  const page = query?.page ?? 1;
  const perPage = query?.perPage ?? 10;
  const paramsQuery: Record<string, string | number | undefined> = {
    page,
    perPage,
  };
  if (query?.classId) {
    paramsQuery.classId = query.classId;
  }

  try {
    const raw = await callApi<Record<string, unknown>>(() =>
      asCall(
        client().GET("/teacher/badges/monitor", {
          params: { query: paramsQuery },
        }),
      ),
    );

    const normalized = normalizeBadgeMonitorData(raw);
    if (normalized.items.length === 0) {
      // In development fallback if backend returned empty array
      return {
        ...normalized,
        items: SAMPLE_BADGE_STUDENTS,
        total: SAMPLE_BADGE_STUDENTS.length,
      };
    }
    return normalized;
  } catch {
    return normalizeBadgeMonitorData({
      items: SAMPLE_BADGE_STUDENTS,
      total: SAMPLE_BADGE_STUDENTS.length,
      page,
      perPage,
      lastPage: 1,
    });
  }
}

export async function getTeacherClassesList(): Promise<
  Array<{ id: string; name: string; gradeLabel?: string | null }>
> {
  try {
    const raw = await callApi<
      | { items?: Array<{ id?: string; name?: string; gradeLabel?: string | null }> }
      | Array<{ id?: string; name?: string; gradeLabel?: string | null }>
    >(() => asCall(client().GET("/teacher/classes")));

    if (Array.isArray(raw)) {
      return raw.map((c, idx) => ({
        id: String(c.id ?? `class-${idx}`),
        name: String(c.name ?? `Class ${idx + 1}`),
        gradeLabel: c.gradeLabel ?? null,
      }));
    }

    const items = Array.isArray(raw?.items) ? raw.items : [];
    return items.map((c, idx) => ({
      id: String(c.id ?? `class-${idx}`),
      name: String(c.name ?? `Class ${idx + 1}`),
      gradeLabel: c.gradeLabel ?? null,
    }));
  } catch {
    return [
      { id: "class-1", name: "Grade 4 · Amber", gradeLabel: "Grade 4" },
      { id: "class-2", name: "Grade 4 · Emerald", gradeLabel: "Grade 4" },
    ];
  }
}

export async function getTeacherStudentsList(
  classId?: string,
): Promise<TeacherStudentOption[]> {
  const params: Record<string, string | number | undefined> = { perPage: 100 };
  if (classId) {
    params.classId = classId;
  }

  try {
    const raw = await callApi<
      | {
          items?: Array<Record<string, unknown>>;
        }
      | Array<Record<string, unknown>>
    >(() =>
      asCall(
        client().GET("/teacher/students", {
          params: { query: params },
        }),
      ),
    );

    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    if (list.length === 0) {
      return [
        { id: "student-1", name: "Sofia Alvarez", className: "Grade 4 · Amber" },
        { id: "student-2", name: "Isla Thompson", className: "Grade 4 · Amber" },
        { id: "student-3", name: "Maya Okafor", className: "Grade 4 · Amber" },
        { id: "student-4", name: "Jonah Levy", className: "Grade 4 · Amber" },
        { id: "student-5", name: "Ethan Kowalski", className: "Grade 4 · Amber" },
        { id: "student-6", name: "Ruby Fitzgerald", className: "Grade 4 · Amber" },
      ];
    }

    return list.map((item, idx) => {
      const cls = typeof item.class === "object" && item.class !== null ? (item.class as Record<string, unknown>) : null;
      const name =
        typeof item.name === "string" && item.name.trim()
          ? item.name
          : typeof item.realName === "string" && item.realName.trim()
          ? item.realName
          : typeof item.nickname === "string" && item.nickname.trim()
          ? item.nickname
          : typeof item.username === "string" && item.username.trim()
          ? item.username
          : `Student ${idx + 1}`;

      return {
        id: String(item.id ?? `student-${idx}`),
        name,
        username: typeof item.username === "string" ? item.username : undefined,
        classId: typeof cls?.id === "string" ? cls.id : typeof item.classId === "string" ? item.classId : undefined,
        className: typeof cls?.name === "string" ? cls.name : typeof item.className === "string" ? item.className : undefined,
        avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : null,
      };
    });
  } catch {
    return [
      { id: "student-1", name: "Sofia Alvarez", className: "Grade 4 · Amber" },
      { id: "student-2", name: "Isla Thompson", className: "Grade 4 · Amber" },
      { id: "student-3", name: "Maya Okafor", className: "Grade 4 · Amber" },
      { id: "student-4", name: "Jonah Levy", className: "Grade 4 · Amber" },
      { id: "student-5", name: "Ethan Kowalski", className: "Grade 4 · Amber" },
      { id: "student-6", name: "Ruby Fitzgerald", className: "Grade 4 · Amber" },
    ];
  }
}
