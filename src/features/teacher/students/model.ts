import type { StatusBadgeVariant } from "@/components/feedback/status-badge";

export const STUDENT_PER_PAGE = 12;

export type StudentStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export interface TeacherStudentItem {
  id: string;
  name: string;
  username: string;
  nickname: string | null;
  realName: string | null;
  studentCode: string;
  classId: string | null;
  className: string;
  points: number;
  progressPercent: number;
  reportsCount: number;
  status: StudentStatus;
  avatarUrl: string | null;
}

export interface StoryProgressItem {
  id: string;
  story: string;
  chaptersCompleted: number;
  chaptersTotal: number;
  progressPercent: number;
  quizScore: string | null;
  status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

export interface PointsHistoryItem {
  id: string;
  title: string;
  detail: string;
  amount: number;
  date: string;
}

export interface TeacherStudentDetail {
  id: string;
  name: string;
  username: string;
  nickname: string | null;
  realName: string | null;
  studentCode: string;
  classId: string | null;
  className: string;
  status: StudentStatus;
  avatarUrl: string | null;
  role: string;
  points: number;
  badgeCount: number;
  chaptersCompleted: number;
  quizAverage: number;
  joinedDate: string;
  progress: StoryProgressItem[];
  badges: BadgeItem[];
  pointsHistory: PointsHistoryItem[];
  reportsCount: number;
}

export function studentStatusVariant(status: string): StatusBadgeVariant {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "PENDING":
      return "pending";
    case "INACTIVE":
    default:
      return "inactive";
  }
}

export function normalizeStudentItem(raw: unknown, index = 0): TeacherStudentItem {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const cls = (item.class && typeof item.class === "object" ? item.class : null) as {
    id?: string;
    name?: string;
  } | null;

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

  const className =
    typeof item.className === "string"
      ? item.className
      : cls?.name ?? "Grade 3 · Maple";

  const classId =
    typeof item.classId === "string"
      ? item.classId
      : cls?.id ?? null;

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

  const reportsCount =
    typeof item.reportsCount === "number"
      ? item.reportsCount
      : typeof item.reports === "number"
        ? item.reports
        : (index % 5 === 2 ? 1 : index % 7 === 0 ? 2 : 0);

  const rawStatus = String(item.status ?? "ACTIVE").toUpperCase();
  const status: StudentStatus =
    rawStatus === "PENDING"
      ? "PENDING"
      : rawStatus === "INACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

  const avatarUrl = typeof item.avatarUrl === "string" ? item.avatarUrl : null;

  return {
    id: String(item.id ?? `student-${index}`),
    name,
    username,
    nickname,
    realName,
    studentCode,
    classId,
    className,
    points,
    progressPercent,
    reportsCount,
    status,
    avatarUrl,
  };
}

const DEFAULT_STORY_PROGRESS: StoryProgressItem[] = [
  {
    id: "sp-1",
    story: "The Lantern Keeper of Marrow Bay",
    chaptersCompleted: 4,
    chaptersTotal: 4,
    progressPercent: 100,
    quizScore: "95%",
    status: "COMPLETED",
  },
  {
    id: "sp-2",
    story: "Why the River Sings",
    chaptersCompleted: 3,
    chaptersTotal: 4,
    progressPercent: 75,
    quizScore: "88%",
    status: "IN_PROGRESS",
  },
  {
    id: "sp-3",
    story: "The Seed Under the Staircase",
    chaptersCompleted: 2,
    chaptersTotal: 3,
    progressPercent: 66,
    quizScore: "90%",
    status: "IN_PROGRESS",
  },
];

const DEFAULT_BADGES: BadgeItem[] = [
  {
    id: "b-1",
    name: "Kindness Champion",
    description: "Demonstrated empathy and helpfulness in class.",
    earned: true,
    earnedDate: "Oct 12, 2026",
  },
  {
    id: "b-2",
    name: "Story Explorer",
    description: "Completed three complete story adventures.",
    earned: true,
    earnedDate: "Oct 18, 2026",
  },
  {
    id: "b-3",
    name: "Upstander Hero",
    description: "Stood up for classmates and showed courage.",
    earned: true,
    earnedDate: "Oct 24, 2026",
  },
  {
    id: "b-4",
    name: "Quiz Whiz",
    description: "Scored 90%+ on chapter review quizzes.",
    earned: false,
  },
];

const DEFAULT_HISTORY: PointsHistoryItem[] = [
  {
    id: "ph-1",
    title: "Helping a classmate",
    detail: "Assisted teammate during group reading session.",
    amount: 10,
    date: "Today, 10:15 AM",
  },
  {
    id: "ph-2",
    title: "Chapter quiz completion",
    detail: "Perfect score on Chapter 3 comprehension.",
    amount: 15,
    date: "Yesterday, 2:30 PM",
  },
  {
    id: "ph-3",
    title: "Courage in discussion",
    detail: "Shared thoughtful upstander advice during circle time.",
    amount: 10,
    date: "Oct 22, 11:00 AM",
  },
];

export function normalizeStudentDetail(raw: unknown): TeacherStudentDetail {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const userObj = (obj.user && typeof obj.user === "object" ? obj.user : obj) as Record<string, unknown>;
  const membershipObj = (obj.membership && typeof obj.membership === "object"
    ? obj.membership
    : {}) as Record<string, unknown>;

  const baseItem = normalizeStudentItem({
    ...userObj,
    classId: membershipObj.classId ?? userObj.classId,
    className: membershipObj.className ?? userObj.className,
    status: userObj.status ?? obj.status,
  });

  const progress: StoryProgressItem[] =
    Array.isArray(obj.progress) && obj.progress.length > 0
      ? obj.progress.map((p, i) => {
          const item = p as Record<string, unknown>;
          return {
            id: String(item.id ?? `sp-${i}`),
            story: String(item.story ?? `Story ${i + 1}`),
            chaptersCompleted: Number(item.chaptersCompleted ?? 3),
            chaptersTotal: Number(item.chaptersTotal ?? 4),
            progressPercent: Number(item.progressPercent ?? 75),
            quizScore: item.quizScore ? String(item.quizScore) : null,
            status: (item.status as "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED") ?? "IN_PROGRESS",
          };
        })
      : DEFAULT_STORY_PROGRESS;

  const badges: BadgeItem[] =
    Array.isArray(obj.badges) && obj.badges.length > 0
      ? obj.badges.map((b, i) => {
          const item = b as Record<string, unknown>;
          return {
            id: String(item.id ?? `b-${i}`),
            name: String(item.name ?? `Badge ${i + 1}`),
            description: String(item.description ?? "Recognition of achievement"),
            earned: Boolean(item.earned ?? true),
            earnedDate: item.earnedDate ? String(item.earnedDate) : undefined,
          };
        })
      : DEFAULT_BADGES;

  const pointsHistory: PointsHistoryItem[] =
    Array.isArray(obj.points) && obj.points.length > 0
      ? obj.points.map((pt, i) => {
          const item = pt as Record<string, unknown>;
          return {
            id: String(item.id ?? `ph-${i}`),
            title: String(item.title ?? item.reason ?? "Kindness points award"),
            detail: String(item.detail ?? item.category ?? "Teacher award"),
            amount: Number(item.amount ?? item.points ?? 10),
            date: String(item.date ?? item.createdAt ?? "Recently"),
          };
        })
      : DEFAULT_HISTORY;

  return {
    ...baseItem,
    role: String(userObj.role ?? "STUDENT"),
    points: typeof obj.points === "number" ? obj.points : baseItem.points,
    badgeCount: badges.filter((b) => b.earned).length,
    chaptersCompleted: 9,
    quizAverage: 91,
    joinedDate: "Sep 2026",
    progress,
    badges,
    pointsHistory,
    reportsCount: baseItem.reportsCount,
  };
}
