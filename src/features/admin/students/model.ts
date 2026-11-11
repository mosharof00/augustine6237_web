import type { Page } from "@/lib/api/envelope";
import type { StatusBadgeVariant } from "@/components/feedback/status-badge";

export const STUDENT_PER_PAGE = 12;

export type StudentStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export type ClassOption = {
  id: string;
  name: string;
};

export type StudentRow = {
  id: string;
  name: string;
  handle: string;
  studentCode: string;
  classId: string;
  className: string;
  positivePoints: number;
  progressPercent: number;
  reportCount: number;
  status: StudentStatus;
};

export type StudentList = Page<StudentRow> & {
  classOptions: ClassOption[];
};

export type QuizStatus = "COMPLETED" | "REMAINING" | "WAITING";

export type StoryProgress = {
  story: string;
  chapters: string;
  completed: number;
  total: number;
  score: string | null;
  quizStatus: QuizStatus;
  quizScore: string | null;
};

export type StudentDetail = StudentRow & {
  ageLabel: string;
  powerHeroesUnlocked: number;
  powerHeroesTotal: number;
  chaptersCompleted: number;
  progress: StoryProgress[];
  kindnessPoints: number;
  badgeCount: number;
  storyPoints: { story: string; points: number }[];
  history: { title: string; at: string; detail: string; amount: number }[];
  categories: { label: string; points: number }[];
  badges: { name: string; earned: boolean }[];
  classAchievement: {
    className: string;
    status: StudentStatus;
    completedChapters: number;
    completedChapterTotal: number;
    positivePoints: number;
    kindnessPoints: number;
  };
  eligibility: {
    storiesCompleted: number;
    storiesTotal: number;
    chaptersCompleted: number;
    chaptersTotal: number;
    scorePercent: number;
    scoreRequired: number;
    defenseResponse: string;
    defenseKindness: string;
  };
  safeSpace: {
    reportCount: number;
    newCount: number;
    reviewingCount: number;
    addressedCount: number;
  };
  classOptions: ClassOption[];
};

export type StudentListQuery = {
  page: number;
  perPage: number;
  q?: string;
  classId?: string;
  status?: StudentStatus;
};

export function studentListQuery(input: {
  page: number;
  q?: string;
  classId?: string;
  pending?: boolean;
}): StudentListQuery {
  return {
    page: input.page,
    perPage: STUDENT_PER_PAGE,
    q: input.q || undefined,
    classId: input.classId || undefined,
    status: input.pending ? "PENDING" : undefined,
  };
}

export function studentStatusVariant(status: StudentStatus): StatusBadgeVariant {
  if (status === "INACTIVE") return "inactive";
  if (status === "PENDING") return "pending";
  return "active";
}

export function powerHeroesValue(unlocked: number) {
  return unlocked > 0 ? "Available" : "N/A";
}

export function powerHeroesCount(unlocked: number, total: number) {
  return `${unlocked}/${total}`;
}

export function scoreLabel(value: string | null) {
  return value ?? "—";
}

export function badgeCountLabel(count: number) {
  return String(count).padStart(2, "0");
}

export function moveClassPayload(classId: string) {
  return { classId };
}

export function statusPatch(status: "ACTIVE" | "INACTIVE") {
  return { status };
}

export function quizStatusLabel(status: QuizStatus) {
  if (status === "COMPLETED") return "Completed";
  if (status === "REMAINING") return "Remaining";
  return "Waiting";
}
