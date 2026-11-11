import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import {
  FALLBACK_GAME_PACKS,
  normalizeGamePackDetail,
  normalizeGamePackRow,
  toSavePackPayload,
  type GamePackDetail,
  type GamePackFormData,
  type GamePackRow,
  type PublishStatus,
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
  DELETE: (path: string) => Callish<never>;
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

export type GamePackQuery = {
  page?: number;
  perPage?: number;
  status?: string;
  ageGroup?: string;
  q?: string;
};

export async function getTeacherGamePacks(
  query?: GamePackQuery,
): Promise<Page<GamePackRow>> {
  try {
    const params = query ? { params: { query } } : undefined;
    const raw = await callApi<
      | {
          items?: unknown[];
          total?: number;
          page?: number;
          perPage?: number;
          lastPage?: number;
        }
      | unknown[]
    >(() => asCall(client().GET("/teacher/game-packs", params)));

    if (Array.isArray(raw)) {
      const items = raw.map((item, idx) => normalizeGamePackRow(item, idx));
      return {
        items,
        total: items.length,
        page: 1,
        perPage: items.length || 10,
        lastPage: 1,
      };
    }

    const rawItems = Array.isArray(raw?.items) ? raw.items : [];
    const items = rawItems.map((item, idx) => normalizeGamePackRow(item, idx));
    return {
      items,
      total: typeof raw?.total === "number" ? raw.total : items.length,
      page: typeof raw?.page === "number" ? raw.page : 1,
      perPage: typeof raw?.perPage === "number" ? raw.perPage : 10,
      lastPage: typeof raw?.lastPage === "number" ? raw.lastPage : 1,
    };
  } catch {
    // If backend table is empty or error occurs, fallback gracefully
    return {
      items: FALLBACK_GAME_PACKS,
      total: FALLBACK_GAME_PACKS.length,
      page: 1,
      perPage: 10,
      lastPage: 1,
    };
  }
}

export async function getTeacherGamePack(id: string): Promise<GamePackDetail> {
  const raw = await callApi<unknown>(() =>
    asCall(client().GET(`/teacher/game-packs/${id}`)),
  );
  return normalizeGamePackDetail(raw);
}

export async function createTeacherGamePack(
  formData: GamePackFormData,
  statusOverride?: PublishStatus,
): Promise<GamePackDetail> {
  const body = toSavePackPayload(formData, statusOverride);
  const raw = await callApi<unknown>(() =>
    asCall(client().POST("/teacher/game-packs", { body })),
  );
  return normalizeGamePackDetail(raw);
}

export async function updateTeacherGamePack(
  id: string,
  formData: GamePackFormData,
  statusOverride?: PublishStatus,
): Promise<GamePackDetail> {
  const body = toSavePackPayload(formData, statusOverride);
  const raw = await callApi<unknown>(() =>
    asCall(client().PATCH(`/teacher/game-packs/${id}`, { body })),
  );
  return normalizeGamePackDetail(raw);
}

export async function deleteTeacherGamePack(id: string): Promise<void> {
  await callApi<unknown>(() =>
    asCall(client().DELETE(`/teacher/game-packs/${id}`)),
  );
}
