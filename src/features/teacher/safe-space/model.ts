import type { StatusBadgeVariant } from "@/components/feedback/status-badge";

export type ReportStatus = "NEW" | "REVIEWING" | "ADDRESSED";

export interface SafeSpaceReportItem {
  id: string;
  publicRef: string;
  studentId: string;
  studentName: string;
  studentNickname: string | null;
  avatarUrl: string | null;
  classId: string | null;
  className: string;
  category: string;
  body: string;
  feelSafe: boolean;
  status: ReportStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_TABS: { label: string; value: ReportStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Reviewing", value: "REVIEWING" },
  { label: "Addressed", value: "ADDRESSED" },
];

export function reportStatusVariant(status: string | ReportStatus): StatusBadgeVariant {
  switch (String(status).toUpperCase()) {
    case "NEW":
      return "new";
    case "REVIEWING":
      return "reviewing";
    case "ADDRESSED":
      return "addressed";
    default:
      return "pending";
  }
}

export function reportStatusLabel(status: string | ReportStatus): string {
  switch (String(status).toUpperCase()) {
    case "NEW":
      return "New";
    case "REVIEWING":
      return "Reviewing";
    case "ADDRESSED":
      return "Addressed";
    default:
      return String(status);
  }
}

export function formatReportDate(dateString: string): string {
  if (!dateString) return "";
  // Check if string is already formatted (e.g. "Oct 17, 10:48 AM")
  if (/^[A-Za-z]{3}\s\d{1,2},\s\d{1,2}:\d{2}\s(?:AM|PM)$/.test(dateString)) {
    return dateString;
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatFeelSafe(feelSafe: boolean): {
  label: string;
  shortLabel: string;
  variant: "safe" | "concern";
} {
  return feelSafe
    ? { label: "Feels safe at school", shortLabel: "Feels safe", variant: "safe" }
    : { label: "Does not feel safe", shortLabel: "Needs check-in", variant: "concern" };
}

export function normalizeSafeSpaceReport(
  raw: unknown,
  index = 0,
): SafeSpaceReportItem {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const id = typeof item.id === "string" ? item.id : `report-${index + 1}`;
  const publicRef =
    typeof item.publicRef === "string"
      ? item.publicRef
      : typeof item.public_ref === "string"
        ? item.public_ref
        : `SSR-${1040 + index}`;

  const studentObj =
    item.student && typeof item.student === "object"
      ? (item.student as Record<string, unknown>)
      : null;

  const studentId =
    typeof item.studentId === "string"
      ? item.studentId
      : typeof item.student_id === "string"
        ? item.student_id
        : typeof studentObj?.id === "string"
          ? studentObj.id
          : `student-${index + 1}`;

  const studentNickname =
    typeof item.studentNickname === "string"
      ? item.studentNickname
      : typeof item.student_nickname === "string"
        ? item.student_nickname
        : typeof studentObj?.nickname === "string"
          ? studentObj.nickname
          : null;

  const realName =
    typeof item.studentName === "string"
      ? item.studentName
      : typeof item.student_name === "string"
        ? item.student_name
        : typeof studentObj?.realName === "string"
          ? studentObj.realName
          : typeof studentObj?.real_name === "string"
            ? studentObj.real_name
            : studentNickname;

  const studentName = realName || studentNickname || "Student";

  const avatarUrl =
    typeof item.avatarUrl === "string"
      ? item.avatarUrl
      : typeof item.avatar_url === "string"
        ? item.avatar_url
        : typeof studentObj?.avatarUrl === "string"
          ? studentObj.avatarUrl
          : typeof studentObj?.avatar_url === "string"
            ? studentObj.avatar_url
            : null;

  const classObj =
    item.class && typeof item.class === "object"
      ? (item.class as Record<string, unknown>)
      : null;

  const classId =
    typeof item.classId === "string"
      ? item.classId
      : typeof item.class_id === "string"
        ? item.class_id
        : typeof classObj?.id === "string"
          ? classObj.id
          : null;

  const className =
    typeof item.className === "string"
      ? item.className
      : typeof item.class_name === "string"
        ? item.class_name
        : typeof classObj?.name === "string"
          ? (typeof classObj?.gradeLabel === "string" || typeof classObj?.grade_label === "string"
              ? `${(classObj.gradeLabel ?? classObj.grade_label)} · ${classObj.name}`
              : (classObj.name as string))
          : "Grade 4 · Amber";

  const category =
    typeof item.category === "string" && item.category.trim().length > 0
      ? item.category
      : "Hurtful Words & Teasing";

  const body =
    typeof item.body === "string"
      ? item.body
      : "Confidential Safe Space report submitted by student.";

  const feelSafe =
    typeof item.feelSafe === "boolean"
      ? item.feelSafe
      : typeof item.feel_safe === "boolean"
        ? item.feel_safe
        : true;

  const rawStatus = String(item.status ?? "NEW").toUpperCase();
  const status: ReportStatus =
    rawStatus === "REVIEWING"
      ? "REVIEWING"
      : rawStatus === "ADDRESSED"
        ? "ADDRESSED"
        : "NEW";

  const submittedAt =
    typeof item.submittedAt === "string"
      ? item.submittedAt
      : typeof item.submitted_at === "string"
        ? item.submitted_at
        : typeof item.createdAt === "string"
          ? item.createdAt
          : typeof item.created_at === "string"
            ? item.created_at
            : "Oct 17, 10:48 AM";

  const createdAt =
    typeof item.createdAt === "string"
      ? item.createdAt
      : typeof item.created_at === "string"
        ? item.created_at
        : new Date().toISOString();

  const updatedAt =
    typeof item.updatedAt === "string"
      ? item.updatedAt
      : typeof item.updated_at === "string"
        ? item.updated_at
        : createdAt;

  return {
    id,
    publicRef,
    studentId,
    studentName,
    studentNickname,
    avatarUrl,
    classId,
    className,
    category,
    body,
    feelSafe,
    status,
    submittedAt,
    createdAt,
    updatedAt,
  };
}

export const SAMPLE_TEACHER_REPORTS: SafeSpaceReportItem[] = [
  {
    id: "ssr-1046",
    publicRef: "SSR-1046",
    studentId: "student-1",
    studentName: "Oscar Lindqvist",
    studentNickname: "oscar_l",
    avatarUrl: null,
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Hurtful Words & Teasing",
    body: "Someone deliberately shoved me against the hallway lockers when we were heading out to PE class. When I turned around they laughed and threatened to do it again if I said anything.",
    feelSafe: true,
    status: "NEW",
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
  },
  {
    id: "ssr-1045",
    publicRef: "SSR-1045",
    studentId: "student-2",
    studentName: "Ethan Kowalski",
    studentNickname: "ethan_k",
    avatarUrl: null,
    classId: "class-cedar",
    className: "Grade 4 · Cedar",
    category: "Cyberbullying",
    body: "A group chat was created sharing unkind edits of my class presentation and mocking my comments.",
    feelSafe: true,
    status: "NEW",
    submittedAt: "Oct 22, 8:41 AM",
    createdAt: "2026-10-22T08:41:00Z",
    updatedAt: "2026-10-22T08:41:00Z",
  },
  {
    id: "ssr-1044-new",
    publicRef: "SSR-1044",
    studentId: "student-3",
    studentName: "Jonah Levy",
    studentNickname: "jonah_l",
    avatarUrl: null,
    classId: "class-amber",
    className: "Grade 3 · Amber",
    category: "Physical Push or Unsafe Behavior",
    body: "During recess two older kids pushed me into the gravel near the bleachers and took my basketball.",
    feelSafe: false,
    status: "NEW",
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
  },
  {
    id: "ssr-1042",
    publicRef: "SSR-1042",
    studentId: "student-4",
    studentName: "Noah Bennett",
    studentNickname: "noah_b",
    avatarUrl: null,
    classId: "class-cedar",
    className: "Grade 4 · Cedar",
    category: "Something Else",
    body: "I noticed some peers feeling left out repeatedly during group projects and wanted to ask for advice.",
    feelSafe: true,
    status: "REVIEWING",
    submittedAt: "Oct 22, 7:15 AM",
    createdAt: "2026-10-22T07:15:00Z",
    updatedAt: "2026-10-22T07:15:00Z",
  },
  {
    id: "ssr-1045-rev",
    publicRef: "SSR-1045",
    studentId: "student-1",
    studentName: "Oscar Lindqvist",
    studentNickname: "oscar_l",
    avatarUrl: null,
    classId: "class-cedar",
    className: "Grade 4 · Cedar",
    category: "Hurtful Words & Teasing",
    body: "Repeated jokes about my accent during science class.",
    feelSafe: true,
    status: "REVIEWING",
    submittedAt: "Oct 22, 7:15 AM",
    createdAt: "2026-10-22T07:15:00Z",
    updatedAt: "2026-10-22T07:15:00Z",
  },
  {
    id: "ssr-1045-addr",
    publicRef: "SSR-1045",
    studentId: "student-1",
    studentName: "Oscar Lindqvist",
    studentNickname: "oscar_l",
    avatarUrl: null,
    classId: "class-cedar",
    className: "Grade 4 · Cedar",
    category: "Hurtful Words & Teasing",
    body: "Spoke with teacher and resolution reached.",
    feelSafe: true,
    status: "ADDRESSED",
    submittedAt: "Oct 22, 7:15 AM",
    createdAt: "2026-10-22T07:15:00Z",
    updatedAt: "2026-10-22T07:15:00Z",
  },
  {
    id: "ssr-1044-addr",
    publicRef: "SSR-1044",
    studentId: "student-3",
    studentName: "Jonah Levy",
    studentNickname: "jonah_l",
    avatarUrl: null,
    classId: "class-maple",
    className: "Grade 3 · Maple",
    category: "Cyberbullying",
    body: "Direct messages sent online; counselor mediated and settled.",
    feelSafe: false,
    status: "ADDRESSED",
    submittedAt: "Oct 21, 5:02 PM",
    createdAt: "2026-10-21T17:02:00Z",
    updatedAt: "2026-10-21T17:02:00Z",
  },
  {
    id: "ssr-1041",
    publicRef: "SSR-1041",
    studentId: "student-4",
    studentName: "Noah Bennett",
    studentNickname: "noah_b",
    avatarUrl: null,
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Physical Push or Unsafe Behavior",
    body: "Recess incident addressed with monitoring staff.",
    feelSafe: true,
    status: "ADDRESSED",
    submittedAt: "Oct 19, 2:30 PM",
    createdAt: "2026-10-19T14:30:00Z",
    updatedAt: "2026-10-19T14:30:00Z",
  },
];
