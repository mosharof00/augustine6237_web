export interface SafeSpaceSummary {
  new: number;
  reviewing: number;
  total: number;
}

export interface LeaderboardStudent {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  kindnessPoints: number;
  rank: number;
  class?: string;
}

export interface TeacherWeekPoint {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  date: string;
  reports: number;
  points: number;
  quizAverage: number;
}

export interface ClassProgressSegment {
  name: string;
  share: number;
}

export interface ClassProgressData {
  total: number;
  segments: ClassProgressSegment[];
}

export type ReportStatus = "new" | "reviewing" | "addressed";

export interface RecentReport {
  id: string;
  reference: string;
  student: string;
  class: string;
  submitted: string;
  status: ReportStatus;
}

export interface RecentAward {
  id: string;
  student: string;
  category: string;
  points: number | string;
  time: string;
  avatarUrl?: string | null;
}

export interface TeacherClass {
  id: string;
  name: string;
  grade?: string;
  code?: string;
  studentCount?: number;
  pendingCount?: number;
}

export interface TeacherDashboard {
  safeSpaceReports: SafeSpaceSummary;
  pendingStudents: number;
  eligibleStudents: number;
  flaggedResponses: {
    count: number;
    caption: string;
  };
  leaderboard: LeaderboardStudent[];
  week: TeacherWeekPoint[];
  classProgress: ClassProgressData;
  recentReports: RecentReport[];
  recentAwards: RecentAward[];
}

export const MON_FRI_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export function greeting(name: string, hour = new Date().getHours()): string {
  const trimmed = name.trim() || "there";
  if (hour < 12) return `Good morning, ${trimmed}.`;
  if (hour < 18) return `Good afternoon, ${trimmed}.`;
  return `Good evening, ${trimmed}.`;
}

export function attentionLine(count: number): string {
  if (count <= 0) return "No items need your attention today.";
  if (count === 1) return "1 item needs your attention today.";
  return `${count} items need your attention today.`;
}

export function formatCount(value: number): string {
  if (value < 0) return "00";
  if (value < 10) return `0${value}`;
  return String(value);
}

export function normalizeWeek(
  rawWeek?: Array<{
    day?: string;
    date?: string;
    reports?: number;
    reportsCount?: number;
    points?: number;
    pointsAwarded?: number;
    quizAverage?: number;
  }>,
): TeacherWeekPoint[] {
  const map = new Map<string, {
    date: string;
    reports: number;
    points: number;
    quizAverage: number;
  }>();

  if (Array.isArray(rawWeek)) {
    for (const item of rawWeek) {
      if (!item || !item.day) continue;
      const reports = item.reports ?? item.reportsCount ?? 0;
      const points = item.points ?? item.pointsAwarded ?? 0;
      const quizAverage =
        typeof item.quizAverage === "number"
          ? item.quizAverage
          : points > 0
            ? Math.min(100, Math.round(points * 3.5))
            : 0;

      map.set(item.day, {
        date: item.date ?? "",
        reports,
        points,
        quizAverage,
      });
    }
  }

  return MON_FRI_DAYS.map((day) => {
    const existing = map.get(day);
    return {
      day,
      date: existing?.date ?? "",
      reports: existing?.reports ?? 0,
      points: existing?.points ?? 0,
      quizAverage: existing?.quizAverage ?? 0,
    };
  });
}

function normalizeReportStatus(raw: unknown): ReportStatus {
  if (typeof raw !== "string") return "new";
  const lower = raw.toLowerCase();
  if (lower === "addressed" || lower === "resolved") return "addressed";
  if (lower === "reviewing" || lower === "in_review") return "reviewing";
  return "new";
}

export function normalizeDashboard(raw: unknown): TeacherDashboard {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;

  const rawReports = (
    typeof obj.safeSpaceReports === "object" && obj.safeSpaceReports !== null
      ? obj.safeSpaceReports
      : {}
  ) as Record<string, unknown>;

  const reportsNew = Number(rawReports.new ?? obj.safeSpaceNew ?? 0);
  const reportsReviewing = Number(
    rawReports.reviewing ?? obj.safeSpaceReviewing ?? 0,
  );
  const reportsTotal = Number(
    rawReports.total ?? reportsNew + reportsReviewing,
  );

  const pendingStudents = Number(
    obj.pendingStudents ?? obj.pendingJoinRequests ?? 0,
  );
  const eligibleStudents = Number(
    obj.eligibleStudents ??
      obj.eligibleStudentsCount ??
      obj.gameEligibleStudents ??
      0,
  );

  let flaggedCount = 0;
  let flaggedCaption = "Criteria not configured";
  if (typeof obj.flaggedResponses === "number") {
    flaggedCount = obj.flaggedResponses;
  } else if (
    typeof obj.flaggedResponses === "object" &&
    obj.flaggedResponses !== null
  ) {
    const flaggedObj = obj.flaggedResponses as Record<string, unknown>;
    flaggedCount = Number(flaggedObj.count ?? 0);
    if (typeof flaggedObj.caption === "string" && flaggedObj.caption.trim()) {
      flaggedCaption = flaggedObj.caption;
    }
  }

  const rawLeaderboard = Array.isArray(obj.leaderboard) ? obj.leaderboard : [];
  const leaderboard: LeaderboardStudent[] = rawLeaderboard.map((item, index) => {
    const student = (typeof item === "object" && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    return {
      userId: String(student.userId ?? student.id ?? `student-${index}`),
      nickname: String(student.nickname ?? student.name ?? student.username ?? "Student"),
      avatarUrl: typeof student.avatarUrl === "string" ? student.avatarUrl : null,
      kindnessPoints: Number(student.kindnessPoints ?? student.points ?? 0),
      rank: Number(student.rank ?? index + 1),
      class: typeof student.class === "string" ? student.class : undefined,
    };
  });

  const week = normalizeWeek(
    Array.isArray(obj.week)
      ? (obj.week as Array<Record<string, unknown>>)
      : undefined,
  );

  let classProgress: ClassProgressData = { total: 0, segments: [] };
  if (
    typeof obj.classProgress === "object" &&
    obj.classProgress !== null
  ) {
    const cp = obj.classProgress as Record<string, unknown>;
    const rawSegments = Array.isArray(cp.segments) ? cp.segments : [];
    classProgress = {
      total: Number(cp.total ?? rawSegments.length),
      segments: rawSegments.map((s) => {
        const seg = (typeof s === "object" && s !== null ? s : {}) as Record<
          string,
          unknown
        >;
        return {
          name: String(seg.name ?? "Class"),
          share: Number(seg.share ?? 0),
        };
      }),
    };
  }

  const rawReportsList = Array.isArray(obj.recentReports)
    ? obj.recentReports
    : [];
  const recentReports: RecentReport[] = rawReportsList.map((item, index) => {
    const report = (typeof item === "object" && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    return {
      id: String(report.id ?? `report-${index}`),
      reference: String(report.reference ?? `SSR-${1000 + index}`),
      student: String(report.student ?? report.studentName ?? "Student"),
      class: String(report.class ?? report.className ?? ""),
      submitted: String(report.submitted ?? report.createdAt ?? "Recently"),
      status: normalizeReportStatus(report.status),
    };
  });

  const rawAwardsList = Array.isArray(obj.recentAwards) ? obj.recentAwards : [];
  const recentAwards: RecentAward[] = rawAwardsList.map((item, index) => {
    const award = (typeof item === "object" && item !== null ? item : {}) as Record<
      string,
      unknown
    >;
    return {
      id: String(award.id ?? `award-${index}`),
      student: String(award.student ?? award.studentName ?? "Student"),
      category: String(award.category ?? award.reason ?? "Kindness"),
      points: award.points !== undefined ? (award.points as number | string) : 0,
      time: String(award.time ?? award.createdAt ?? "Recently"),
      avatarUrl: typeof award.avatarUrl === "string" ? award.avatarUrl : null,
    };
  });

  return {
    safeSpaceReports: {
      new: reportsNew,
      reviewing: reportsReviewing,
      total: reportsTotal,
    },
    pendingStudents,
    eligibleStudents,
    flaggedResponses: {
      count: flaggedCount,
      caption: flaggedCaption,
    },
    leaderboard,
    week,
    classProgress,
    recentReports,
    recentAwards,
  };
}
