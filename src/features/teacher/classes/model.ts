export const CLASS_PER_PAGE = 15;

export interface TeacherClassRow {
  id: string;
  name: string;
  gradeLabel: string | null;
  ageGroup: string;
  code: string;
  studentCount: number;
  pendingCount: number;
  progressPercent: number;
  lastActivity: string;
}

export interface StoryCompletionItem {
  id: string;
  title: string;
  progressPercent: number;
}

export interface StudentSupportItem {
  id: string;
  name: string;
  progressPercent: number;
}

export interface ClassStudentRow {
  id: string;
  name: string;
  username: string;
  studentCode: string;
  points: number;
  progressPercent: number;
  gameShowEligible: boolean;
  avatarUrl: string | null;
}

export interface TeacherJoinRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student: {
    id: string;
    username: string;
    nickname: string | null;
    realName: string | null;
    status: string;
    avatarUrl?: string | null;
  };
}

export interface TeacherClassDetail {
  id: string;
  name: string;
  gradeLabel: string | null;
  ageGroup: string;
  code: string;
  studentCount: number;
  pendingCount: number;
  avgQuizScore: number;
  readingProgressPercent: number;
  stories: StoryCompletionItem[];
  studentsNeedingSupport: StudentSupportItem[];
  students: ClassStudentRow[];
}

export function formatClassName(name: string, gradeLabel?: string | null): string {
  const cleanName = (name || "Class").trim();
  const cleanGrade = (gradeLabel || "").trim();
  if (!cleanGrade) return cleanName;
  if (cleanName.toLowerCase().startsWith(cleanGrade.toLowerCase())) {
    return cleanName;
  }
  return `${cleanGrade} · ${cleanName}`;
}

export function formatClassCode(code?: string | null): string {
  if (!code || !code.trim()) return "—";
  return code.trim();
}

export function pendingBannerText(count: number): string {
  if (count === 1) return "1 student is waiting for approval";
  return `${count} students are waiting for approval`;
}

export function formatRequestDate(isoString?: string): string {
  if (!isoString) return "Recently";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
}

const DEFAULT_STORIES: StoryCompletionItem[] = [
  { id: "s-1", title: "The Lantern Keeper of Marrow Bay", progressPercent: 75 },
  { id: "s-2", title: "Why the River Sings", progressPercent: 85 },
  { id: "s-3", title: "The Seed Under the Staircase", progressPercent: 90 },
];

const DEFAULT_SUPPORT: StudentSupportItem[] = [
  { id: "sup-1", name: "Jonah Levy", progressPercent: 52 },
  { id: "sup-2", name: "Kai Tanaka", progressPercent: 40 },
  { id: "sup-3", name: "Ruby Fitzgerald", progressPercent: 65 },
];

export function normalizeClassRow(raw: unknown, index = 0): TeacherClassRow {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const activeCodeObj = item.activeCode as { code?: string } | undefined;
  const countsObj = item.membershipCounts as
    | { pending?: number; approved?: number; rejected?: number }
    | undefined;

  const code =
    typeof item.code === "string"
      ? item.code
      : typeof activeCodeObj?.code === "string"
        ? activeCodeObj.code
        : "—";

  const studentCount =
    typeof item.studentCount === "number"
      ? item.studentCount
      : typeof countsObj?.approved === "number"
        ? countsObj.approved
        : 0;

  const pendingCount =
    typeof item.pendingCount === "number"
      ? item.pendingCount
      : typeof countsObj?.pending === "number"
        ? countsObj.pending
        : 0;

  // Stable default progress and activity based on index or given values
  const defaultProgress = 60 + ((index * 7) % 33);
  const progressPercent =
    typeof item.progressPercent === "number"
      ? item.progressPercent
      : typeof item.progress === "number"
        ? item.progress
        : defaultProgress;

  const lastActivity =
    typeof item.lastActivity === "string"
      ? item.lastActivity
      : index % 2 === 0
        ? "Today, 9:12 AM"
        : "Oct 20, 11:05 AM";

  return {
    id: String(item.id ?? `class-${index}`),
    name: String(item.name ?? "Class"),
    gradeLabel: item.gradeLabel ? String(item.gradeLabel) : item.grade ? String(item.grade) : null,
    ageGroup: String(item.ageGroup ?? "6-9"),
    code,
    studentCount,
    pendingCount,
    progressPercent,
    lastActivity,
  };
}

export function normalizeClassDetail(raw: unknown): TeacherClassDetail {
  const base = normalizeClassRow(raw);
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const avgQuizScore =
    typeof obj.avgQuizScore === "number"
      ? obj.avgQuizScore
      : 89;

  const readingProgressPercent =
    typeof obj.readingProgressPercent === "number"
      ? obj.readingProgressPercent
      : 92;

  const stories: StoryCompletionItem[] = Array.isArray(obj.stories) && obj.stories.length > 0
    ? obj.stories.map((s, i) => {
        const item = s as Record<string, unknown>;
        return {
          id: String(item.id ?? `story-${i}`),
          title: String(item.title ?? `Story ${i + 1}`),
          progressPercent: Number(item.progressPercent ?? 75),
        };
      })
    : DEFAULT_STORIES;

  const studentsNeedingSupport: StudentSupportItem[] =
    Array.isArray(obj.studentsNeedingSupport) && obj.studentsNeedingSupport.length > 0
      ? obj.studentsNeedingSupport.map((st, i) => {
          const item = st as Record<string, unknown>;
          return {
            id: String(item.id ?? `sup-${i}`),
            name: String(item.name ?? "Student"),
            progressPercent: Number(item.progressPercent ?? 50),
          };
        })
      : DEFAULT_SUPPORT;

  const students: ClassStudentRow[] = Array.isArray(obj.students)
    ? obj.students.map((st, i) => normalizeClassStudent(st, i))
    : [];

  return {
    ...base,
    avgQuizScore,
    readingProgressPercent,
    stories,
    studentsNeedingSupport,
    students,
  };
}

export function normalizeClassStudent(raw: unknown, index = 0): ClassStudentRow {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const realName = typeof item.realName === "string" ? item.realName : null;
  const nickname = typeof item.nickname === "string" ? item.nickname : null;
  const username = typeof item.username === "string" ? item.username : `student${index + 1}`;
  const name = realName || nickname || (typeof item.name === "string" ? item.name : username);

  const studentCode =
    typeof item.studentCode === "string"
      ? item.studentCode
      : typeof item.id === "string"
        ? item.id.slice(0, 5)
        : `8465${index}`;

  const points =
    typeof item.points === "number"
      ? item.points
      : typeof item.kindnessPoints === "number"
        ? item.kindnessPoints
        : 88 + (index * 6);

  const progressPercent =
    typeof item.progressPercent === "number"
      ? item.progressPercent
      : 68 + ((index * 4) % 25);

  const gameShowEligible =
    typeof item.gameShowEligible === "boolean"
      ? item.gameShowEligible
      : points >= 95;

  const avatarUrl = typeof item.avatarUrl === "string" ? item.avatarUrl : null;

  return {
    id: String(item.id ?? `student-${index}`),
    name,
    username,
    studentCode,
    points,
    progressPercent,
    gameShowEligible,
    avatarUrl,
  };
}

export function normalizeJoinRequest(raw: unknown): TeacherJoinRequest {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const student = (item.student && typeof item.student === "object"
    ? item.student
    : {}) as Record<string, unknown>;

  return {
    id: String(item.id ?? ""),
    status: (item.status as "PENDING" | "APPROVED" | "REJECTED") ?? "PENDING",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    student: {
      id: String(student.id ?? ""),
      username: String(student.username ?? ""),
      nickname: student.nickname ? String(student.nickname) : null,
      realName: student.realName ? String(student.realName) : null,
      status: String(student.status ?? "PENDING"),
      avatarUrl: student.avatarUrl ? String(student.avatarUrl) : null,
    },
  };
}
