import { z } from "zod";
import type { Page } from "@/lib/api/envelope";

export const HISTORY_PER_PAGE = 12;

export const DEFAULT_SUMMARY: PointSummary = {
  totalPositivePoints: 4897,
  totalKindnessPoints: 5000,
  totalBadges: 6,
};

export const DEFAULT_POINT_RULES: PointRules = {
  storyPoints: 1,
  kindnessPoints: 50,
  teacherAward: 5,
};

export type PointRules = {
  storyPoints: number;
  kindnessPoints: number;
  teacherAward: number;
};

export type PointSummary = {
  totalPositivePoints: number;
  totalKindnessPoints: number;
  totalBadges: number;
};

export type PointRulesData = {
  summary: PointSummary;
  rules: PointRules;
};

export type BadgeAwardType = "AUTOMATIC" | "TEACHER";

export type BadgeCode =
  | "KINDNESS_CHAMPION"
  | "STORY_EXPLORER"
  | "GAME_SHOW_READY"
  | "HELPING_HAND"
  | "SPEAK_UP"
  | "POSITIVE_LEADER";

export type Badge = {
  id: string;
  code: BadgeCode;
  name: string;
  howToEarn: string;
  criteriaDescription: string;
  threshold: number | null;
  thresholdUnit: string | null;
  awardType: BadgeAwardType;
  earnedCount: number;
  totalStudents: number;
};

export const DEFAULT_BADGES: Badge[] = [
  {
    id: "badge-1",
    code: "KINDNESS_CHAMPION",
    name: "Kindness Champion",
    howToEarn: "How student earn it",
    criteriaDescription: "",
    threshold: 500,
    thresholdUnit: "kindness point",
    awardType: "AUTOMATIC",
    earnedCount: 10,
    totalStudents: 20,
  },
  {
    id: "badge-2",
    code: "STORY_EXPLORER",
    name: "Story Explorer",
    howToEarn: "How student can earn it:",
    criteriaDescription: "",
    threshold: 2,
    thresholdUnit: "Stories",
    awardType: "AUTOMATIC",
    earnedCount: 10,
    totalStudents: 20,
  },
  {
    id: "badge-3",
    code: "GAME_SHOW_READY",
    name: "Game Show Ready",
    howToEarn: "How student can earn it:",
    criteriaDescription:
      "Complete 2 stories or 6 chapters and earn minimum 70% comprehension score.",
    threshold: null,
    thresholdUnit: null,
    awardType: "AUTOMATIC",
    earnedCount: 10,
    totalStudents: 20,
  },
  {
    id: "badge-4",
    code: "HELPING_HAND",
    name: "Helping Hand",
    howToEarn: "How student can earn it:",
    criteriaDescription:
      "Awarded directly by classroom teachers for observed prosocial behaviors.",
    threshold: null,
    thresholdUnit: null,
    awardType: "TEACHER",
    earnedCount: 10,
    totalStudents: 20,
  },
  {
    id: "badge-5",
    code: "SPEAK_UP",
    name: "Speak Up",
    howToEarn: "How student can earn it:",
    criteriaDescription:
      "Awarded by teachers or counselors during weekly class assemblies.",
    threshold: null,
    thresholdUnit: null,
    awardType: "TEACHER",
    earnedCount: 10,
    totalStudents: 20,
  },
  {
    id: "badge-6",
    code: "POSITIVE_LEADER",
    name: "Positive Leader",
    howToEarn: "How student can earn it:",
    criteriaDescription:
      "Awarded by teachers for courageous up-stander actions and peaceful conflict resolution.",
    threshold: null,
    thresholdUnit: null,
    awardType: "TEACHER",
    earnedCount: 10,
    totalStudents: 20,
  },
];

export type PointHistoryItem = {
  id: string;
  studentName: string;
  studentId: string;
  className?: string;
  category: string;
  points: number;
  reason: string;
  awardedBy: string;
  createdAt: string;
};

export type ClassOption = {
  id: string;
  name: string;
};

export type PointHistoryList = Page<PointHistoryItem> & {
  classOptions?: ClassOption[];
};

export type PointHistoryQuery = {
  page: number;
  perPage: number;
  q?: string;
  classId?: string;
  dateRange?: string;
};

export const pointRulesSchema = z.object({
  storyPoints: z.coerce.number().int().min(0, "Points must be 0 or higher"),
  kindnessPoints: z.coerce.number().int().min(0, "Points must be 0 or higher"),
  teacherAward: z.coerce.number().int().min(0, "Points must be 0 or higher"),
});

export type PointRulesFormValues = z.infer<typeof pointRulesSchema>;

export const badgeThresholdSchema = z.object({
  threshold: z.coerce.number().int().min(1, "Threshold must be at least 1"),
});

export const DEFAULT_CLASS_OPTIONS: ClassOption[] = [
  { id: "class-1", name: "Grade 4 · Amber" },
  { id: "class-2", name: "Grade 5 · Emerald" },
  { id: "class-3", name: "Grade 3 · Sapphire" },
];

export function buildSampleHistory(): PointHistoryItem[] {
  const baseStudents = [
    { name: "Sofia Alvarez", classId: "class-1", className: "Grade 4 · Amber" },
    { name: "Isla Thompson", classId: "class-1", className: "Grade 4 · Amber" },
    { name: "Maya Okafor", classId: "class-2", className: "Grade 5 · Emerald" },
    { name: "Lucas Vance", classId: "class-1", className: "Grade 4 · Amber" },
    { name: "Emma Wright", classId: "class-3", className: "Grade 3 · Sapphire" },
    { name: "Liam Chen", classId: "class-2", className: "Grade 5 · Emerald" },
    { name: "Noah Miller", classId: "class-1", className: "Grade 4 · Amber" },
    { name: "Olivia Davis", classId: "class-3", className: "Grade 3 · Sapphire" },
    { name: "Ethan Garcia", classId: "class-2", className: "Grade 5 · Emerald" },
    { name: "Ava Wilson", classId: "class-1", className: "Grade 4 · Amber" },
    { name: "Mason Taylor", classId: "class-3", className: "Grade 3 · Sapphire" },
    { name: "Chloe Martinez", classId: "class-2", className: "Grade 5 · Emerald" },
  ];

  const categories = ["Kindness Points", "Positive Points", "Game Points"];
  const reasons = [
    "Helping a classmate with reading materials",
    "",
    "",
    "Courageous up-stander during recess",
    "Completed chapter reading goal",
    "Kind defense round answer in basketball show",
  ];
  const staff = ["Ms. Jhonson", "Mr. Davis", "Ms. Lee", "System"];
  const dates = [
    "Oct 21, 10:05 AM",
    "Oct 20, 2:40 PM",
    "Oct 19, 9:30 AM",
    "Oct 18, 11:15 AM",
    "Oct 17, 3:20 PM",
    "Oct 16, 1:45 PM",
    "Oct 15, 10:00 AM",
  ];

  const items: PointHistoryItem[] = [];
  // Generate 80 items matching the screenshot
  for (let i = 0; i < 80; i++) {
    const s = baseStudents[i % baseStudents.length];
    const cat = categories[i % categories.length];
    const pts = cat === "Kindness Points" ? 50 : cat === "Positive Points" ? 3 : 2;
    const r = i === 0 ? "Helping a classmate with reading materials" : reasons[i % reasons.length];
    const aw = i < 3 ? "Ms. Jhonson" : staff[i % staff.length];
    const dt = dates[i % dates.length];

    items.push({
      id: `hist-${i + 1}`,
      studentId: `student-${(i % baseStudents.length) + 1}`,
      studentName: s.name,
      className: s.className,
      category: cat,
      points: pts,
      reason: r,
      awardedBy: aw,
      createdAt: dt,
    });
  }

  return items;
}

const STORAGE_KEY_RULES = "wop.pointRules";
const STORAGE_KEY_BADGES = "wop.badges";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
};

function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadLocalPointRules(storage: StorageLike | null = defaultStorage()): PointRules {
  if (!storage) return DEFAULT_POINT_RULES;
  try {
    const raw = storage.getItem(STORAGE_KEY_RULES);
    if (!raw) return DEFAULT_POINT_RULES;
    const parsed = JSON.parse(raw) as Partial<PointRules>;
    return {
      storyPoints:
        typeof parsed.storyPoints === "number" ? parsed.storyPoints : DEFAULT_POINT_RULES.storyPoints,
      kindnessPoints:
        typeof parsed.kindnessPoints === "number"
          ? parsed.kindnessPoints
          : DEFAULT_POINT_RULES.kindnessPoints,
      teacherAward:
        typeof parsed.teacherAward === "number"
          ? parsed.teacherAward
          : DEFAULT_POINT_RULES.teacherAward,
    };
  } catch {
    return DEFAULT_POINT_RULES;
  }
}

export function saveLocalPointRules(
  rules: PointRules,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  } catch {
    // Ignore storage errors
  }
}

export function loadLocalBadges(storage: StorageLike | null = defaultStorage()): Badge[] {
  if (!storage) return DEFAULT_BADGES;
  try {
    const raw = storage.getItem(STORAGE_KEY_BADGES);
    if (!raw) return DEFAULT_BADGES;
    const parsed = JSON.parse(raw) as Badge[];
    if (Array.isArray(parsed) && parsed.length === 6) {
      return parsed;
    }
    return DEFAULT_BADGES;
  } catch {
    return DEFAULT_BADGES;
  }
}

export function saveLocalBadges(
  badges: Badge[],
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_BADGES, JSON.stringify(badges));
  } catch {
    // Ignore storage errors
  }
}
