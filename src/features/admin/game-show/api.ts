import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import {
  DEFAULT_ELIGIBILITY,
  loadLocalEligibility,
  SAMPLE_MATCH_1V1,
  SAMPLE_MATCH_5V5,
  SAMPLE_MATCHES,
  saveLocalEligibility,
  type EligibilityConfig,
  type GameMatch,
  type GameMatchDetail,
  type MatchMode,
  type MatchPhase,
  type UpdateEligibilityInput,
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

type BackendEligibilityResponse = {
  schoolId?: string;
  requiredStories?: number;
  requiredChapters?: number;
  minQuizPercent?: number;
  required_stories?: number;
  required_chapters?: number;
  min_quiz_percent?: number;
  updatedAt?: string;
};

export async function getEligibilityConfig(): Promise<EligibilityConfig> {
  try {
    const res = await callApi<BackendEligibilityResponse>(() =>
      asCall(client().GET("/admin/game/eligibility-config")),
    );
    if (res) {
      const config: EligibilityConfig = {
        schoolId: res.schoolId,
        requiredStories:
          res.requiredStories ??
          res.required_stories ??
          DEFAULT_ELIGIBILITY.requiredStories,
        requiredChapters:
          res.requiredChapters ??
          res.required_chapters ??
          DEFAULT_ELIGIBILITY.requiredChapters,
        minQuizPercent:
          res.minQuizPercent ??
          res.min_quiz_percent ??
          DEFAULT_ELIGIBILITY.minQuizPercent,
        updatedAt: res.updatedAt,
      };
      saveLocalEligibility(config);
      return config;
    }
  } catch {
    // API not yet reachable or offline
  }
  return loadLocalEligibility();
}

export async function updateEligibilityConfig(
  input: UpdateEligibilityInput,
): Promise<EligibilityConfig> {
  const nextConfig: EligibilityConfig = {
    requiredStories: input.requiredStories,
    requiredChapters: input.requiredChapters,
    minQuizPercent: input.minQuizPercent,
    updatedAt: new Date().toISOString(),
  };
  saveLocalEligibility(nextConfig);

  try {
    const res = await callApi<BackendEligibilityResponse>(() =>
      asCall(
        client().PATCH("/admin/game/eligibility-config", {
          body: {
            required_stories: input.requiredStories,
            required_chapters: input.requiredChapters,
            min_quiz_percent: input.minQuizPercent,
            requiredStories: input.requiredStories,
            requiredChapters: input.requiredChapters,
            minQuizPercent: input.minQuizPercent,
          },
        }),
      ),
    );
    if (res) {
      const updated: EligibilityConfig = {
        schoolId: res.schoolId,
        requiredStories:
          res.requiredStories ??
          res.required_stories ??
          nextConfig.requiredStories,
        requiredChapters:
          res.requiredChapters ??
          res.required_chapters ??
          nextConfig.requiredChapters,
        minQuizPercent:
          res.minQuizPercent ??
          res.min_quiz_percent ??
          nextConfig.minQuizPercent,
        updatedAt: res.updatedAt,
      };
      saveLocalEligibility(updated);
      return updated;
    }
  } catch {
    // Fall back to saved local config
  }

  return nextConfig;
}

export async function getMatches(query?: {
  mode?: MatchMode;
  phase?: MatchPhase;
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<Page<GameMatch>> {
  const page = query?.page ?? 1;
  const perPage = query?.perPage ?? 10;

  try {
    const res = await callApi<Page<GameMatch>>(() =>
      asCall(
        client().GET("/admin/game/matches", {
          params: {
            query: {
              mode: query?.mode,
              phase: query?.phase,
              page,
              perPage,
            },
          },
        }),
      ),
    );
    if (res && Array.isArray(res.items) && res.items.length > 0) {
      return res;
    }
  } catch {
    // Fall back to local fixtures
  }

  let filtered = [...SAMPLE_MATCHES];
  if (query?.mode) {
    filtered = filtered.filter((m) => m.mode === query.mode);
  }
  if (query?.phase) {
    filtered = filtered.filter((m) => m.phase === query.phase);
  }
  if (query?.search) {
    const q = query.search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        (m.className && m.className.toLowerCase().includes(q)) ||
        m.mode.toLowerCase().includes(q) ||
        m.participants.some((p) => p.nickname?.toLowerCase().includes(q)),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  return {
    items,
    total,
    page,
    perPage,
    lastPage,
  };
}

export async function getMatchDetail(id: string): Promise<GameMatchDetail> {
  try {
    const res = await callApi<GameMatchDetail>(() =>
      asCall(client().GET(`/admin/game/matches/${id}`)),
    );
    if (res && res.id) {
      return res;
    }
  } catch {
    // Fall back to fixtures
  }

  if (id === SAMPLE_MATCH_1V1.id || id.includes("1v1")) {
    return SAMPLE_MATCH_1V1;
  }
  if (id === SAMPLE_MATCH_5V5.id || id.includes("5v5")) {
    return SAMPLE_MATCH_5V5;
  }

  const found = SAMPLE_MATCHES.find((m) => m.id === id);
  if (found) {
    return {
      ...found,
      packId: "pack-default",
      rounds: [],
    };
  }

  return SAMPLE_MATCH_1V1;
}
