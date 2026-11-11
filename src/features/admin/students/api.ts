import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import type { StudentDetail, StudentList, StudentListQuery, StudentStatus } from "./model";

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

export function getStudents(query: StudentListQuery) {
  return callApi<StudentList>(() =>
    asCall(client().GET("/admin/students", { params: { query } })),
  );
}

export function getStudent(id: string) {
  return callApi<StudentDetail>(() => asCall(client().GET(`/admin/students/${id}`)));
}

export function updateStudentStatus(id: string, status: StudentStatus) {
  return callApi<StudentDetail>(() =>
    asCall(client().PATCH(`/admin/students/${id}`, { body: { status } })),
  );
}

export function approveStudent(id: string) {
  return callApi<StudentDetail>(() =>
    asCall(client().POST(`/admin/students/${id}/approve`)),
  );
}

export function moveStudent(id: string, classId: string) {
  return callApi<StudentDetail>(() =>
    asCall(client().POST(`/admin/students/${id}/move-class`, { body: { classId } })),
  );
}
