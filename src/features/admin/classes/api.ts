import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import type {
  ClassDetail,
  ClassList,
  ClassRequestLists,
  IssuedCode,
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

export function getClasses(query: { page: number; perPage: number; q?: string }) {
  return callApi<ClassList>(() =>
    asCall(client().GET("/admin/classes", { params: { query } })),
  );
}

export function getClass(id: string) {
  return callApi<ClassDetail>(() => asCall(client().GET(`/admin/classes/${id}`)));
}

export function createClass(body: {
  name: string;
  grade: string;
  ageGroup: string;
  teacherId: string;
}) {
  return callApi<ClassDetail>(() => asCall(client().POST("/admin/classes", { body })));
}

export function changeTeacher(id: string, teacherId: string) {
  return callApi<ClassDetail>(() =>
    asCall(client().POST(`/admin/classes/${id}/change-teacher`, { body: { teacherId } })),
  );
}

export function regenerateCode(id: string) {
  return callApi<IssuedCode>(() => asCall(client().POST(`/admin/classes/${id}/codes`)));
}

export function getClassRequests() {
  return callApi<ClassRequestLists>(() => asCall(client().GET("/admin/class-requests")));
}

export function approveClassRequest(id: string) {
  return callApi<IssuedCode>(() =>
    asCall(client().POST(`/admin/class-requests/${id}/approve`)),
  );
}

export function rejectClassRequest(id: string) {
  return callApi(() => client().POST(`/admin/class-requests/${id}/reject`));
}

export function approveRenewal(id: string) {
  return callApi<IssuedCode>(() =>
    asCall(client().POST(`/admin/code-renewals/${id}/approve`)),
  );
}
