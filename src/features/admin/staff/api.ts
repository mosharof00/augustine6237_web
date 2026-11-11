import { api, callApi } from "@/lib/api/client";
import type { Envelope, Page } from "@/lib/api/envelope";
import type { StaffMember } from "./model";

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

export function getStaff(query: { page: number; perPage: number; q?: string }) {
  return callApi<Page<StaffMember>>(() =>
    asCall(client().GET("/admin/staff", { params: { query } })),
  );
}

export function getStaffMember(id: string) {
  return callApi<StaffMember>(() => asCall(client().GET(`/admin/staff/${id}`)));
}

export function inviteStaff(body: { email: string; canAccessSafeSpace: boolean }) {
  return callApi(() => client().POST("/admin/staff/invite", { body }));
}

export function updateStaff(
  id: string,
  body: {
    name: string;
    email: string;
    canAccessSafeSpace: boolean;
    assignedClass: string;
  },
) {
  return callApi<StaffMember>(() =>
    asCall(client().PATCH(`/admin/staff/${id}`, { body })),
  );
}

export function reactivateStaff(id: string) {
  return callApi(() => client().POST(`/admin/staff/${id}/reactivate`));
}

export function remindStaff(id: string) {
  return callApi(() => client().POST(`/admin/staff/${id}/remind`));
}
