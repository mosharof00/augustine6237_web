import { z } from "zod";

export const AWARD_CATEGORIES = [
  "Kindness",
  "Helping a classmate",
  "Effort",
  "Participation",
] as const;

export type AwardCategory = (typeof AWARD_CATEGORIES)[number];

export const ALLOWED_AMOUNTS = [1, 2, 3, 4, 5] as const;

export const awardPointsSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  amount: z.coerce
    .number()
    .int("Amount must be a whole number")
    .min(1, "Amount must be between 1 and 5")
    .max(5, "Amount must be between 1 and 5"),
  category: z.string().min(1, "Please select a category"),
  reason: z
    .string()
    .max(300, "Reason must be 300 characters or less")
    .optional()
    .or(z.literal("")),
});

export type AwardPointsPayload = z.infer<typeof awardPointsSchema>;

export type TeacherPointsHistoryItem = {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string | null;
  className?: string | null;
  amount: number;
  points: number;
  category: string;
  reason: string | null;
  awardedById?: string | null;
  createdAt: string;
};

export type BadgeProgressItem = {
  badgeId: string;
  code: string;
  title: string;
  artUrl?: string | null;
  earned: boolean;
  earnedAt: string | null;
  progressPercent?: number;
};

export type StudentBadgeMonitorRow = {
  id: string;
  studentId: string;
  name: string;
  realName?: string | null;
  nickname?: string | null;
  username?: string | null;
  className?: string | null;
  classId?: string | null;
  avatarUrl?: string | null;
  badges: BadgeProgressItem[];
};

export type BadgeDefinition = {
  id: string;
  code: string;
  title: string;
  description: string;
  artUrl?: string | null;
};

export type BadgeMonitorData = {
  items: StudentBadgeMonitorRow[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  badges: BadgeDefinition[];
};

export type TeacherStudentOption = {
  id: string;
  name: string;
  username?: string;
  classId?: string;
  className?: string;
  avatarUrl?: string | null;
};

export const DEFAULT_BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "badge-kindness-champion",
    code: "KINDNESS_CHAMPION",
    title: "Kindness Champion",
    description: "Complete a first story",
  },
  {
    id: "badge-story-explorer",
    code: "STORY_EXPLORER",
    title: "Story Explorer",
    description: "Receive positive points for kindness",
  },
  {
    id: "badge-helping-hand",
    code: "HELPING_HAND",
    title: "Helping Hand",
    description: "Finish a series of comprehension quizzes",
  },
  {
    id: "badge-speak-up",
    code: "SPEAK_UP",
    title: "Speak Up",
    description: "Complete audio stories",
  },
  {
    id: "badge-positive-leader",
    code: "POSITIVE_LEADER",
    title: "Positive Leader",
    description: "Be recognised for helping classmates",
  },
  {
    id: "badge-game-show-ready",
    code: "GAME_SHOW_READY",
    title: "Game Show Ready",
    description: "Complete audio stories",
  },
];

export function normalizePointsHistoryItem(
  raw: unknown,
  fallbackIdx = 0,
): TeacherPointsHistoryItem {
  if (typeof raw !== "object" || raw === null) {
    return {
      id: `history-${fallbackIdx}`,
      studentId: `student-${fallbackIdx}`,
      studentName: `Student ${fallbackIdx + 1}`,
      amount: 1,
      points: 1,
      category: "Kindness",
      reason: null,
      createdAt: new Date().toISOString(),
    };
  }

  const r = raw as Record<string, unknown>;
  const user = typeof r.user === "object" && r.user !== null ? (r.user as Record<string, unknown>) : null;
  const rawAmount = typeof r.amount === "number" ? r.amount : typeof r.points === "number" ? r.points : 1;

  const studentName =
    typeof r.studentName === "string" && r.studentName.trim()
      ? r.studentName
      : typeof user?.real_name === "string" && user.real_name.trim()
      ? user.real_name
      : typeof user?.nickname === "string" && user.nickname.trim()
      ? user.nickname
      : typeof user?.username === "string" && user.username.trim()
      ? user.username
      : typeof r.student === "string" && r.student.trim()
      ? r.student
      : "Student";

  return {
    id: typeof r.id === "string" ? r.id : `history-${fallbackIdx}`,
    studentId: typeof r.studentId === "string" ? r.studentId : typeof r.user_id === "string" ? r.user_id : "",
    studentName,
    avatarUrl: typeof r.avatarUrl === "string" ? r.avatarUrl : typeof user?.avatar_url === "string" ? user.avatar_url : null,
    className: typeof r.className === "string" ? r.className : null,
    amount: rawAmount,
    points: rawAmount,
    category: typeof r.category === "string" ? r.category : typeof r.label === "string" ? r.label : "General",
    reason: typeof r.reason === "string" ? r.reason : typeof r.ref_id === "string" ? r.ref_id : null,
    awardedById: typeof r.awardedById === "string" ? r.awardedById : typeof r.awarded_by_id === "string" ? r.awarded_by_id : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : typeof r.created_at === "string" ? r.created_at : new Date().toISOString(),
  };
}

export function normalizeBadgeMonitorData(raw: unknown): BadgeMonitorData {
  if (typeof raw !== "object" || raw === null) {
    return {
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
      lastPage: 1,
      badges: DEFAULT_BADGE_DEFINITIONS,
    };
  }

  const r = raw as Record<string, unknown>;
  const rawBadges = Array.isArray(r.badges) ? r.badges : [];
  const badges: BadgeDefinition[] =
    rawBadges.length > 0
      ? rawBadges.map((b, idx) => {
          const rec = typeof b === "object" && b !== null ? (b as Record<string, unknown>) : {};
          const code = String(rec.code ?? `BADGE_${idx}`);
          const defaultDef = DEFAULT_BADGE_DEFINITIONS.find((def) => def.code === code);
          return {
            id: typeof rec.id === "string" ? rec.id : `badge-${idx}`,
            code,
            title: typeof rec.title === "string" ? rec.title : defaultDef?.title ?? code,
            description: defaultDef?.description ?? "Achievement badge",
            artUrl: typeof rec.artUrl === "string" ? rec.artUrl : typeof rec.art_url === "string" ? rec.art_url : null,
          };
        })
      : DEFAULT_BADGE_DEFINITIONS;

  const rawItems = Array.isArray(r.items) ? r.items : [];
  const items: StudentBadgeMonitorRow[] = rawItems.map((item, idx) => {
    const s = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    const studentId = typeof s.studentId === "string" ? s.studentId : typeof s.id === "string" ? s.id : `student-${idx}`;
    const name =
      typeof s.name === "string" && s.name.trim()
        ? s.name
        : typeof s.realName === "string" && s.realName.trim()
        ? s.realName
        : typeof s.real_name === "string" && s.real_name.trim()
        ? s.real_name
        : typeof s.nickname === "string" && s.nickname.trim()
        ? s.nickname
        : typeof s.username === "string" && s.username.trim()
        ? s.username
        : `Student ${idx + 1}`;

    const studentBadgesRaw = Array.isArray(s.badges) ? s.badges : [];
    const studentBadges: BadgeProgressItem[] = badges.map((badgeDef) => {
      const match = studentBadgesRaw.find((sb) => {
        if (typeof sb !== "object" || sb === null) return false;
        const srec = sb as Record<string, unknown>;
        return srec.badgeId === badgeDef.id || srec.badge_id === badgeDef.id || srec.code === badgeDef.code;
      });

      if (!match) {
        return {
          badgeId: badgeDef.id,
          code: badgeDef.code,
          title: badgeDef.title,
          artUrl: badgeDef.artUrl,
          earned: false,
          earnedAt: null,
          progressPercent: 68,
        };
      }

      const m = match as Record<string, unknown>;
      const earned = Boolean(m.earned);
      return {
        badgeId: badgeDef.id,
        code: badgeDef.code,
        title: badgeDef.title,
        artUrl: typeof m.artUrl === "string" ? m.artUrl : badgeDef.artUrl,
        earned,
        earnedAt: typeof m.earnedAt === "string" ? m.earnedAt : typeof m.earned_at === "string" ? m.earned_at : null,
        progressPercent: typeof m.progressPercent === "number" ? m.progressPercent : earned ? 100 : 68,
      };
    });

    return {
      id: studentId,
      studentId,
      name,
      realName: typeof s.realName === "string" ? s.realName : typeof s.real_name === "string" ? s.real_name : null,
      nickname: typeof s.nickname === "string" ? s.nickname : null,
      username: typeof s.username === "string" ? s.username : null,
      className: typeof s.className === "string" ? s.className : null,
      classId: typeof s.classId === "string" ? s.classId : null,
      avatarUrl: typeof s.avatarUrl === "string" ? s.avatarUrl : null,
      badges: studentBadges,
    };
  });

  return {
    items,
    total: typeof r.total === "number" ? r.total : items.length,
    page: typeof r.page === "number" ? r.page : 1,
    perPage: typeof r.perPage === "number" ? r.perPage : 10,
    lastPage: typeof r.lastPage === "number" ? r.lastPage : Math.max(1, Math.ceil(items.length / 10)),
    badges,
  };
}

export function formatAwardDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return isoString;
  }
}

export const SAMPLE_RECENT_AWARDS: TeacherPointsHistoryItem[] = [
  {
    id: "sample-1",
    studentId: "student-1",
    studentName: "Sofia Alvarez",
    amount: 3,
    points: 3,
    category: "Kindness",
    reason: "Welcomed a new classmate",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "sample-2",
    studentId: "student-2",
    studentName: "Isla Thompson",
    amount: 5,
    points: 5,
    category: "Effort",
    reason: "Helped tidy up reading corner",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "sample-3",
    studentId: "student-3",
    studentName: "Maya Okafor",
    amount: 2,
    points: 2,
    category: "Helping a classmate",
    reason: "Assisted partner during comprehension quiz",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const SAMPLE_BADGE_STUDENTS: StudentBadgeMonitorRow[] = [
  {
    id: "s-1",
    studentId: "s-1",
    name: "Jonah Levy",
    className: "Grade 4 · Amber",
    badges: [
      { badgeId: "b-1", code: "KINDNESS_CHAMPION", title: "Kindness Champion", earned: true, earnedAt: "2026-10-21T10:00:00Z" },
      { badgeId: "b-2", code: "STORY_EXPLORER", title: "Story Explorer", earned: false, earnedAt: null, progressPercent: 38 },
      { badgeId: "b-3", code: "HELPING_HAND", title: "Helping Hand", earned: true, earnedAt: "2026-10-15T14:30:00Z" },
      { badgeId: "b-4", code: "SPEAK_UP", title: "Speak Up", earned: false, earnedAt: null, progressPercent: 68 },
      { badgeId: "b-5", code: "POSITIVE_LEADER", title: "Positive Leader", earned: false, earnedAt: null, progressPercent: 68 },
      { badgeId: "b-6", code: "GAME_SHOW_READY", title: "Game Show Ready", earned: true, earnedAt: "2026-10-18T09:15:00Z" },
    ],
  },
  {
    id: "s-2",
    studentId: "s-2",
    name: "Maya Okafor",
    className: "Grade 4 · Amber",
    badges: [
      { badgeId: "b-1", code: "KINDNESS_CHAMPION", title: "Kindness Champion", earned: true, earnedAt: "2026-10-19T10:00:00Z" },
      { badgeId: "b-2", code: "STORY_EXPLORER", title: "Story Explorer", earned: true, earnedAt: "2026-10-18T11:20:00Z" },
      { badgeId: "b-3", code: "HELPING_HAND", title: "Helping Hand", earned: false, earnedAt: null, progressPercent: 68 },
      { badgeId: "b-4", code: "SPEAK_UP", title: "Speak Up", earned: true, earnedAt: "2026-10-20T12:00:00Z" },
      { badgeId: "b-5", code: "POSITIVE_LEADER", title: "Positive Leader", earned: false, earnedAt: null, progressPercent: 68 },
      { badgeId: "b-6", code: "GAME_SHOW_READY", title: "Game Show Ready", earned: true, earnedAt: "2026-10-22T08:45:00Z" },
    ],
  },
  {
    id: "s-3",
    studentId: "s-3",
    name: "Ethan Kowalski",
    className: "Grade 4 · Amber",
    badges: [
      { badgeId: "b-1", code: "KINDNESS_CHAMPION", title: "Kindness Champion", earned: true, earnedAt: "2026-10-12T10:00:00Z" },
      { badgeId: "b-2", code: "STORY_EXPLORER", title: "Story Explorer", earned: false, earnedAt: null, progressPercent: 68 },
      { badgeId: "b-3", code: "HELPING_HAND", title: "Helping Hand", earned: true, earnedAt: "2026-10-14T09:30:00Z" },
      { badgeId: "b-4", code: "SPEAK_UP", title: "Speak Up", earned: false, earnedAt: null, progressPercent: 68 },
      { badgeId: "b-5", code: "POSITIVE_LEADER", title: "Positive Leader", earned: true, earnedAt: "2026-10-21T15:10:00Z" },
      { badgeId: "b-6", code: "GAME_SHOW_READY", title: "Game Show Ready", earned: false, earnedAt: null, progressPercent: 68 },
    ],
  },
  {
    id: "s-4",
    studentId: "s-4",
    name: "Ruby Fitzgerald",
    className: "Grade 4 · Amber",
    badges: [
      { badgeId: "b-1", code: "KINDNESS_CHAMPION", title: "Kindness Champion", earned: true, earnedAt: "2026-10-11T10:00:00Z" },
      { badgeId: "b-2", code: "STORY_EXPLORER", title: "Story Explorer", earned: true, earnedAt: "2026-10-16T11:20:00Z" },
      { badgeId: "b-3", code: "HELPING_HAND", title: "Helping Hand", earned: false, earnedAt: null, progressPercent: 68 },
      { badgeId: "b-4", code: "SPEAK_UP", title: "Speak Up", earned: true, earnedAt: "2026-10-17T14:00:00Z" },
      { badgeId: "b-5", code: "POSITIVE_LEADER", title: "Positive Leader", earned: true, earnedAt: "2026-10-20T16:00:00Z" },
      { badgeId: "b-6", code: "GAME_SHOW_READY", title: "Game Show Ready", earned: true, earnedAt: "2026-10-22T13:30:00Z" },
    ],
  },
];
