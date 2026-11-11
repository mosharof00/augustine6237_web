import { z } from "zod";
import type { Page } from "@/lib/api/envelope";
import type { StatusBadgeVariant } from "@/components/feedback/status-badge";

export const CLASS_PER_PAGE = 15;
export const CLASS_SUBTITLE = "Manage classes, join codes, and teacher assignment.";

export const AGE_GROUPS = [
  { value: "6-9", label: "6–9" },
  { value: "10-13", label: "10–13" },
  { value: "adults", label: "Adults" },
] as const;

export type ClassStatus = "ACTIVE" | "INACTIVE";

export type SchoolClass = {
  id: string;
  name: string;
  grade: string;
  ageGroup: string;
  code: string;
  codeExpired: boolean;
  teacherName: string;
  studentCount: number;
  status: ClassStatus;
  createdAt: string;
};

export type ClassList = Page<SchoolClass> & {
  pendingRequestCount: number;
};

export type ClassStudent = {
  id: string;
  name: string;
  handle: string;
  studentCode: string;
  className: string;
  positivePoints: number;
  progressPercent: number;
  reportCount: number;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
};

export type ClassDetail = SchoolClass & {
  readingProgressPercent: number;
  quizScorePercent: number;
  createdBy: string;
  teacher: { id: string; name: string; handle: string; staffCode: string };
  students: ClassStudent[];
};

export type ClassRequest = {
  id: string;
  teacherName: string;
  teacherHandle: string;
  requestedAt: string;
  className: string;
  grade: string;
  ageGroup: string;
  status: "PENDING";
};

export type CodeRenewal = {
  id: string;
  requestCode: string;
  teacherName: string;
  teacherHandle: string;
  classId: string;
  className: string;
  studentCount: number;
  requestedAt: string;
  codeStatus: "EXPIRED";
  reason: string;
};

export type ClassRequestLists = {
  classCount: number;
  requests: ClassRequest[];
  renewals: CodeRenewal[];
};

export type IssuedCode = {
  className: string;
  code: string;
};

const ageValues = AGE_GROUPS.map((item) => item.value) as ["6-9", "10-13", "adults"];

export const createClassSchema = z.object({
  name: z.string().trim().min(1, "Class name is required"),
  grade: z.string().trim().min(1, "Grade is required"),
  ageGroup: z.enum(ageValues, { error: "Choose an age group" }),
  teacherId: z.string().min(1, "Choose a teacher"),
});

export type CreateClassValues = z.infer<typeof createClassSchema>;

export function classListQuery(input: { page: number; q?: string }) {
  return {
    page: input.page,
    perPage: CLASS_PER_PAGE,
    q: input.q || undefined,
  };
}

export function createClassPayload(values: CreateClassValues) {
  return {
    name: values.name.trim(),
    grade: values.grade.trim(),
    ageGroup: values.ageGroup,
    teacherId: values.teacherId,
  };
}

export function teacherChoices<T extends { role: string; status: string }>(staff: T[]) {
  return staff.filter((member) => member.role === "TEACHER" && member.status === "ACTIVE");
}

export function classStatusVariant(status: ClassStatus): StatusBadgeVariant {
  return status === "ACTIVE" ? "active" : "inactive";
}

export function requestBanner(count: number) {
  const noun = count === 1 ? "request" : "requests";
  return `${count} class creation ${noun} waiting for approval`;
}

export function classReadyLine(name: string) {
  return `class [${name}] is ready.`;
}

export function changeTeacherPayload(teacherId: string) {
  return { teacherId };
}
