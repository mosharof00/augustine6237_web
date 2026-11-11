import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import {
  normalizeSafeSpaceReport,
  type ReportStatus,
  type SafeSpaceReportItem,
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

export async function getTeacherSafeSpaceReports(query?: {
  status?: ReportStatus;
  page?: number;
  perPage?: number;
}): Promise<Page<SafeSpaceReportItem>> {
  const paramsQuery: Record<string, string | number | undefined> = {};
  if (query?.status) paramsQuery.status = query.status;
  if (query?.page) paramsQuery.page = query.page;
  if (query?.perPage) paramsQuery.perPage = query.perPage;

  const raw = await callApi<Page<unknown> | unknown[]>(() =>
    asCall(
      client().GET("/teacher/safe-space/reports", {
        params: { query: paramsQuery },
      }),
    ),
  );

  if (Array.isArray(raw)) {
    const items = raw.map((item, idx) => normalizeSafeSpaceReport(item, idx));
    return {
      items,
      total: items.length,
      page: query?.page ?? 1,
      perPage: query?.perPage ?? items.length,
      lastPage: 1,
    };
  }

  const rawItems = Array.isArray(raw?.items) ? raw.items : [];
  const items = rawItems.map((item, idx) => normalizeSafeSpaceReport(item, idx));
  return {
    items,
    total: typeof raw?.total === "number" ? raw.total : items.length,
    page: typeof raw?.page === "number" ? raw.page : query?.page ?? 1,
    perPage: typeof raw?.perPage === "number" ? raw.perPage : query?.perPage ?? 10,
    lastPage: typeof raw?.lastPage === "number" ? raw.lastPage : 1,
  };
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
