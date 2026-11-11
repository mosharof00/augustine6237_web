import { z } from "zod";
import type { StatusBadgeVariant } from "@/components/feedback/status-badge";

export type ReportStatus = "NEW" | "REVIEWING" | "ADDRESSED";

export const CONCERN_CATEGORIES = [
  "Hurtful Words & Teasing",
  "Cyberbullying",
  "Physical Push or Unsafe Behavior",
  "Something Else",
] as const;

export type ConcernCategory = (typeof CONCERN_CATEGORIES)[number];

export type SafeSpaceReport = {
  id: string;
  publicRef: string;
  studentId: string;
  studentNickname?: string | null;
  studentName: string;
  classId?: string | null;
  className?: string | null;
  category: string;
  body: string;
  feelSafe: boolean;
  status: ReportStatus;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    nickname?: string | null;
    realName?: string | null;
  } | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    nickname?: string | null;
    realName?: string | null;
    avatarUrl?: string | null;
  } | null;
  class?: {
    id: string;
    name?: string | null;
    grade?: string | null;
  } | null;
};

export type SafeSpaceNote = {
  id: string;
  reportId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    nickname?: string | null;
    realName?: string | null;
    role?: string | null;
  } | null;
};

export type SafeSpaceReportDetail = SafeSpaceReport & {
  notes: SafeSpaceNote[];
};

export type SafeSpaceSummary = {
  newReports: number;
  reviewingReports: number;
  addressedReports: number;
  flaggedReports: number;
  concernCategories: { category: string; count: number }[];
};

export function reportStatusVariant(status: string | ReportStatus): StatusBadgeVariant {
  switch (status) {
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
  switch (status) {
    case "NEW":
      return "New";
    case "REVIEWING":
      return "Reviewing";
    case "ADDRESSED":
      return "Addressed";
    default:
      return status;
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

export function calculateSummary(reports: SafeSpaceReport[]): SafeSpaceSummary {
  const newReports = reports.filter((r) => r.status === "NEW").length;
  const reviewingReports = reports.filter((r) => r.status === "REVIEWING").length;
  const addressedReports = reports.filter((r) => r.status === "ADDRESSED").length;
  const flaggedReports = reports.filter((r) => !r.feelSafe).length;

  const categoryCountMap: Record<string, number> = {};
  for (const cat of CONCERN_CATEGORIES) {
    categoryCountMap[cat] = 0;
  }
  for (const r of reports) {
    if (r.category in categoryCountMap) {
      categoryCountMap[r.category] += 1;
    } else {
      categoryCountMap[r.category] = (categoryCountMap[r.category] ?? 0) + 1;
    }
  }

  const concernCategories = CONCERN_CATEGORIES.map((cat) => ({
    category: cat,
    count: categoryCountMap[cat] ?? 0,
  }));

  return {
    newReports,
    reviewingReports,
    addressedReports,
    flaggedReports,
    concernCategories,
  };
}

export const addNoteSchema = z.object({
  body: z.string().trim().min(1, "Note cannot be empty").max(1000, "Note too long"),
});

export const changeTeacherSchema = z.object({
  teacherId: z.string().min(1, "Select a teacher"),
});

export const changeStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "ADDRESSED"]),
});

export const SAMPLE_REPORTS: SafeSpaceReportDetail[] = [
  {
    id: "ssr-1046",
    publicRef: "SSR-1046",
    studentId: "student-1",
    studentNickname: "oscar_l",
    studentName: "Oscar Lindqvist",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Hurtful Words & Teasing",
    body: "Someone deliberately shoved me against the hallway lockers when we were heading out to PE class. When I turned around they laughed and threatened to do it again if I said anything.",
    feelSafe: true,
    status: "NEW",
    assigneeId: null,
    assignee: null,
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
  {
    id: "ssr-1045",
    publicRef: "SSR-1045",
    studentId: "student-2",
    studentNickname: "ethan_k",
    studentName: "Ethan Kowalski",
    classId: "class-cedar",
    className: "Grade 4 · Cedar",
    category: "Cyberbullying",
    body: "A group chat was created sharing unkind edits of my class presentation and mocking my comments.",
    feelSafe: true,
    status: "NEW",
    assigneeId: null,
    assignee: null,
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
  {
    id: "ssr-1044-new",
    publicRef: "SSR-1044",
    studentId: "student-3",
    studentNickname: "jonah_l",
    studentName: "Jonah Levy",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Physical Push or Unsafe Behavior",
    body: "During recess two older kids pushed me into the gravel near the bleachers and took my basketball.",
    feelSafe: false,
    status: "NEW",
    assigneeId: null,
    assignee: null,
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
  {
    id: "ssr-1042",
    publicRef: "SSR-1042",
    studentId: "student-1",
    studentNickname: "oscar_l",
    studentName: "Oscar Lindqvist",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Something Else",
    body: "I noticed some peers feeling left out repeatedly during group projects and wanted to ask for advice.",
    feelSafe: true,
    status: "REVIEWING",
    assigneeId: "teacher-jhonson",
    assignee: {
      id: "teacher-jhonson",
      nickname: "jhonson759",
      realName: "Ms. Jhonson",
    },
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
  {
    id: "ssr-1044-reviewing",
    publicRef: "SSR-1044",
    studentId: "student-4",
    studentNickname: "noah_b",
    studentName: "Noah Bennett",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Physical Push or Unsafe Behavior",
    body: "Rough pushing near the cafeteria lines caused me to drop my tray and trip.",
    feelSafe: false,
    status: "REVIEWING",
    assigneeId: "teacher-jhonson",
    assignee: {
      id: "teacher-jhonson",
      nickname: "jhonson759",
      realName: "Ms. Jhonson",
    },
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
  {
    id: "ssr-1044-words",
    publicRef: "SSR-1044",
    studentId: "student-4",
    studentNickname: "noah_b",
    studentName: "Noah Bennett",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Hurtful Words & Teasing",
    body: "Repeated name-calling in the hallway between third and fourth periods.",
    feelSafe: true,
    status: "REVIEWING",
    assigneeId: "teacher-rivera",
    assignee: {
      id: "teacher-rivera",
      nickname: "rivera478",
      realName: "Ms. Rivera",
    },
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
  {
    id: "ssr-1044-cyber",
    publicRef: "SSR-1044",
    studentId: "student-4",
    studentNickname: "noah_b",
    studentName: "Noah Bennett",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Cyberbullying",
    body: "Direct messages sent online telling me not to come to school sports events.",
    feelSafe: false,
    status: "ADDRESSED",
    assigneeId: "teacher-jhonson",
    assignee: {
      id: "teacher-jhonson",
      nickname: "jhonson759",
      realName: "Ms. Jhonson",
    },
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [
      {
        id: "note-1",
        reportId: "ssr-1044-cyber",
        authorId: "admin-1",
        body: "Spoke with students and guardians; incident resolved.",
        createdAt: "Oct 17, 11:30 AM",
        author: {
          id: "admin-1",
          nickname: "admin",
          realName: "Principal Sarah",
          role: "ADMIN",
        },
      },
    ],
  },
  {
    id: "ssr-1044-push",
    publicRef: "SSR-1044",
    studentId: "student-4",
    studentNickname: "noah_b",
    studentName: "Noah Bennett",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Physical Push or Unsafe Behavior",
    body: "Hallway congestion led to shoving; recess monitor alerted and addressed.",
    feelSafe: true,
    status: "ADDRESSED",
    assigneeId: "teacher-rivera",
    assignee: {
      id: "teacher-rivera",
      nickname: "rivera478",
      realName: "Ms. Rivera",
    },
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
  {
    id: "ssr-1044-else",
    publicRef: "SSR-1044",
    studentId: "student-4",
    studentNickname: "noah_b",
    studentName: "Noah Bennett",
    classId: "class-amber",
    className: "Grade 4 · Amber",
    category: "Something Else",
    body: "Follow-up conversation with student on coping strategies went smoothly.",
    feelSafe: true,
    status: "ADDRESSED",
    assigneeId: "teacher-jhonson",
    assignee: {
      id: "teacher-jhonson",
      nickname: "jhonson759",
      realName: "Ms. Jhonson",
    },
    submittedAt: "Oct 17, 10:48 AM",
    createdAt: "2026-10-17T10:48:00Z",
    updatedAt: "2026-10-17T10:48:00Z",
    notes: [],
  },
];
