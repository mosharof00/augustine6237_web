import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import {
  type Badge,
  type PointHistoryList,
  type PointHistoryQuery,
  type PointRules,
  type PointRulesData,
  DEFAULT_SUMMARY,
  DEFAULT_CLASS_OPTIONS,
  buildSampleHistory,
  loadLocalBadges,
  loadLocalPointRules,
  saveLocalBadges,
  saveLocalPointRules,
  HISTORY_PER_PAGE,
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
  PUT: (path: string, init?: { body?: unknown }) => Callish<never>;
  DELETE: (path: string, init?: { body?: unknown }) => Callish<never>;
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

export async function getPointRules(): Promise<PointRulesData> {
  try {
    const res = await callApi<PointRulesData>(() =>
      asCall(client().GET("/admin/point-rules")),
    );
    if (res && res.rules) {
      saveLocalPointRules(res.rules);
      return res;
    }
  } catch {
    // API not yet implemented on backend or offline
  }
  return {
    summary: DEFAULT_SUMMARY,
    rules: loadLocalPointRules(),
  };
}

export async function updatePointRules(rules: Partial<PointRules>): Promise<PointRulesData> {
  const current = loadLocalPointRules();
  const nextRules: PointRules = {
    storyPoints: rules.storyPoints ?? current.storyPoints,
    kindnessPoints: rules.kindnessPoints ?? current.kindnessPoints,
    teacherAward: rules.teacherAward ?? current.teacherAward,
  };
  saveLocalPointRules(nextRules);

  try {
    const res = await callApi<PointRulesData>(() =>
      asCall(client().PATCH("/admin/point-rules", { body: nextRules })),
    );
    if (res && res.rules) {
      saveLocalPointRules(res.rules);
      return res;
    }
  } catch {
    // Return saved local rules
  }

  return {
    summary: DEFAULT_SUMMARY,
    rules: nextRules,
  };
}

export async function getBadges(): Promise<Badge[]> {
  try {
    const res = await callApi<Badge[]>(() => asCall(client().GET("/admin/badges")));
    if (res && Array.isArray(res) && res.length > 0) {
      saveLocalBadges(res);
      return res;
    }
  } catch {
    // API not yet implemented on backend or offline
  }
  return loadLocalBadges();
}

export async function updateBadges(
  badges: { code: string; threshold: number }[],
): Promise<Badge[]> {
  const current = loadLocalBadges();
  const next = current.map((b) => {
    const match = badges.find((u) => u.code === b.code);
    if (match) {
      return { ...b, threshold: match.threshold };
    }
    return b;
  });
  saveLocalBadges(next);

  try {
    const res = await callApi<Badge[]>(() =>
      asCall(client().PATCH("/admin/badges", { body: { badges } })),
    );
    if (res && Array.isArray(res)) {
      saveLocalBadges(res);
      return res;
    }
  } catch {
    // Return saved local badges
  }

  return next;
}

export async function getPointsHistory(query: PointHistoryQuery): Promise<PointHistoryList> {
  try {
    const res = await callApi<PointHistoryList>(() =>
      asCall(
        client().GET("/admin/points/history", {
          params: {
            query: {
              page: query.page,
              perPage: query.perPage,
              q: query.q,
              classId: query.classId,
              dateRange: query.dateRange,
            },
          },
        }),
      ),
    );
    if (res && Array.isArray(res.items)) {
      return res;
    }
  } catch {
    // Fall back to sample history generator
  }

  let all = buildSampleHistory();

  // Search filter
  if (query.q) {
    const lower = query.q.toLowerCase().trim();
    all = all.filter(
      (item) =>
        item.studentName.toLowerCase().includes(lower) ||
        (item.className && item.className.toLowerCase().includes(lower)) ||
        (item.reason && item.reason.toLowerCase().includes(lower)) ||
        item.category.toLowerCase().includes(lower),
    );
  }

  // Class filter
  if (query.classId) {
    all = all.filter((item) => {
      if (query.classId === "class-1") return item.className?.includes("Grade 4");
      if (query.classId === "class-2") return item.className?.includes("Grade 5");
      if (query.classId === "class-3") return item.className?.includes("Grade 3");
      return true;
    });
  }

  const perPage = query.perPage || HISTORY_PER_PAGE;
  const page = Math.max(1, query.page || 1);
  const total = all.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;
  const items = all.slice(startIndex, startIndex + perPage);

  return {
    items,
    total,
    page,
    perPage,
    lastPage,
    classOptions: DEFAULT_CLASS_OPTIONS,
  };
}
