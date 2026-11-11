import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import { getStaff } from "@/features/admin/staff/api";
import type {
  ReportStatus,
  SafeSpaceNote,
  SafeSpaceReport,
  SafeSpaceReportDetail,
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

export function getAdminReports(query?: {
  status?: ReportStatus;
  page?: number;
  perPage?: number;
}) {
  return callApi<Page<SafeSpaceReport>>(() =>
    asCall(client().GET("/admin/safe-space/reports", { params: { query } })),
  );
}

export function getAdminReport(id: string) {
  return callApi<SafeSpaceReportDetail>(() =>
    asCall(client().GET(`/admin/safe-space/reports/${id}`)),
  );
}

export function updateAdminReport(
  id: string,
  body: {
    status?: ReportStatus;
    assigneeId?: string | null;
  },
) {
  return callApi<SafeSpaceReportDetail>(() =>
    asCall(client().PATCH(`/admin/safe-space/reports/${id}`, { body })),
  );
}

export function addAdminReportNote(id: string, body: { body: string }) {
  return callApi<SafeSpaceNote>(() =>
    asCall(client().POST(`/admin/safe-space/reports/${id}/notes`, { body })),
  );
}

export async function getTeachersList() {
  const result = await getStaff({ page: 1, perPage: 100 });
  return (result.items ?? []).filter(
    (member) => member.role === "TEACHER" || !member.role,
  );
}
