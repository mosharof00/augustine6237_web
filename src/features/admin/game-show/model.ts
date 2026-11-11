import { z } from "zod";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
};

export function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export type EligibilityConfig = {
  schoolId?: string;
  requiredStories: number;
  requiredChapters: number;
  minQuizPercent: number;
  updatedAt?: string;
};

export const DEFAULT_ELIGIBILITY: EligibilityConfig = {
  requiredStories: 2,
  requiredChapters: 6,
  minQuizPercent: 70,
};

export const STORAGE_KEY_ELIGIBILITY = "wop.game.eligibility-config";

export const updateEligibilitySchema = z.object({
  requiredStories: z
    .number()
    .int("Must be a whole number")
    .min(0, "Required stories must be 0 or more"),
  requiredChapters: z
    .number()
    .int("Must be a whole number")
    .min(0, "Required chapters must be 0 or more"),
  minQuizPercent: z
    .number()
    .int("Must be a whole number")
    .min(0, "Minimum percent must be 0 or more")
    .max(100, "Minimum percent cannot exceed 100"),
});

export type UpdateEligibilityInput = z.infer<typeof updateEligibilitySchema>;

export function loadLocalEligibility(
  storage: StorageLike | null = defaultStorage(),
): EligibilityConfig {
  if (!storage) return DEFAULT_ELIGIBILITY;
  try {
    const raw = storage.getItem(STORAGE_KEY_ELIGIBILITY);
    if (!raw) return DEFAULT_ELIGIBILITY;
    const parsed = JSON.parse(raw) as Partial<EligibilityConfig> & {
      required_stories?: number;
      required_chapters?: number;
      min_quiz_percent?: number;
    };
    return {
      requiredStories:
        typeof parsed.requiredStories === "number"
          ? parsed.requiredStories
          : typeof parsed.required_stories === "number"
            ? parsed.required_stories
            : DEFAULT_ELIGIBILITY.requiredStories,
      requiredChapters:
        typeof parsed.requiredChapters === "number"
          ? parsed.requiredChapters
          : typeof parsed.required_chapters === "number"
            ? parsed.required_chapters
            : DEFAULT_ELIGIBILITY.requiredChapters,
      minQuizPercent:
        typeof parsed.minQuizPercent === "number"
          ? parsed.minQuizPercent
          : typeof parsed.min_quiz_percent === "number"
            ? parsed.min_quiz_percent
            : DEFAULT_ELIGIBILITY.minQuizPercent,
      updatedAt: parsed.updatedAt,
      schoolId: parsed.schoolId,
    };
  } catch {
    return DEFAULT_ELIGIBILITY;
  }
}

export function saveLocalEligibility(
  config: EligibilityConfig,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_ELIGIBILITY, JSON.stringify(config));
  } catch {
    // Ignore storage write errors
  }
}

export type MatchMode = "ONE_V_ONE" | "FIVE_V_FIVE" | "SINGLE";
export type MatchPhase = "WAITING" | "PLAYING" | "FINISHED" | "CANCELLED";

export type GameTeam = {
  id: string;
  label: string;
  scoreXp: number;
  scoreKindness: number;
  scoreBaskets: number;
};

export type GameParticipantUser = {
  id: string;
  nickname?: string | null;
  realName?: string | null;
  avatarUrl?: string | null;
  username?: string | null;
};

export type GameParticipantHero = {
  id: string;
  code: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string | null;
  artUrl?: string | null;
  powerCode?: string;
  powerLabel?: string;
};

export type GameParticipant = {
  id: string;
  teamId: string;
  userId?: string | null;
  isBot?: boolean;
  jerseyNumber?: number | null;
  heroId?: string | null;
  isConnected: boolean;
  leftAt?: string | null;
  powerUsed?: boolean;
  nickname: string;
  avatarUrl?: string | null;
  user?: GameParticipantUser | null;
  hero?: GameParticipantHero | null;
  shotsMade?: number;
  shotsMissed?: number;
  scoreXp?: number;
  kindnessPoints?: number;
};

export type GameRound = {
  id: string;
  number: number;
  roundType: string;
  phase: string;
  deadlineAt?: string;
  buzzWinnerId?: string | null;
  answersCount?: number;
  shootoutsCount?: number;
};

export type GameMatch = {
  id: string;
  mode: MatchMode;
  phase: MatchPhase;
  schoolId?: string | null;
  classId?: string | null;
  className?: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  winnerTeamId?: string | null;
  teams: GameTeam[];
  participants: GameParticipant[];
  createdAt: string;
  updatedAt?: string;
};

export type GameMatchDetail = GameMatch & {
  packId?: string | null;
  rounds?: GameRound[];
};

export function formatMatchDate(isoOrFormatted?: string | null): string {
  if (!isoOrFormatted) return "—";
  if (!isoOrFormatted.includes("T") && !isoOrFormatted.includes("-")) {
    return isoOrFormatted;
  }
  const date = new Date(isoOrFormatted);
  if (Number.isNaN(date.getTime())) return isoOrFormatted;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMatchShortDate(isoOrFormatted?: string | null): string {
  if (!isoOrFormatted) return "—";
  const date = new Date(isoOrFormatted);
  if (Number.isNaN(date.getTime())) return isoOrFormatted;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMatchDuration(
  startedAt?: string | null,
  finishedAt?: string | null,
): string {
  if (!startedAt || !finishedAt) return "12m 30s";
  const start = new Date(startedAt).getTime();
  const finish = new Date(finishedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(finish) || finish <= start) {
    return "12m 30s";
  }
  const totalSeconds = Math.round((finish - start) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function formatModeLabel(mode: MatchMode): string {
  switch (mode) {
    case "FIVE_V_FIVE":
      return "Multi Player";
    case "ONE_V_ONE":
    case "SINGLE":
    default:
      return "Single Player";
  }
}

export function getWinnerTeam(
  match: GameMatch | GameMatchDetail,
): GameTeam | undefined {
  if (!match.teams || match.teams.length === 0) return undefined;
  if (match.winnerTeamId) {
    const winner = match.teams.find((t) => t.id === match.winnerTeamId);
    if (winner) return winner;
  }
  // Fallback to team with highest score
  return [...match.teams].sort((a, b) => b.scoreXp - a.scoreXp)[0];
}

export function getWinnerLabel(match: GameMatch | GameMatchDetail): string {
  const winnerTeam = getWinnerTeam(match);
  if (!winnerTeam) return "—";
  if (match.mode === "ONE_V_ONE" || match.mode === "SINGLE") {
    const participant = match.participants?.find(
      (p) => p.teamId === winnerTeam.id,
    );
    if (participant?.nickname) {
      return participant.nickname;
    }
  }
  return winnerTeam.label || "Team A";
}

export function getMatchScoreDisplay(match: GameMatch | GameMatchDetail): {
  teamA: number;
  teamB: number;
  winningScore: number;
} {
  const team1 = match.teams?.[0]?.scoreXp ?? 0;
  const team2 = match.teams?.[1]?.scoreXp ?? 0;
  return {
    teamA: team1,
    teamB: team2,
    winningScore: Math.max(team1, team2),
  };
}

export const SAMPLE_MATCH_1V1: GameMatchDetail = {
  id: "match-1v1-001",
  mode: "ONE_V_ONE",
  phase: "FINISHED",
  className: "Grade 3 • Maple",
  startedAt: "2026-10-27T10:00:00Z",
  finishedAt: "2026-10-27T10:12:30Z",
  createdAt: "2026-10-27T10:00:00Z",
  winnerTeamId: "team-1v1-b",
  teams: [
    {
      id: "team-1v1-a",
      label: "Player 1",
      scoreXp: 58,
      scoreKindness: 15,
      scoreBaskets: 3,
    },
    {
      id: "team-1v1-b",
      label: "Player 2",
      scoreXp: 88,
      scoreKindness: 25,
      scoreBaskets: 5,
    },
  ],
  participants: [
    {
      id: "part-1v1-1",
      teamId: "team-1v1-a",
      userId: "user-1",
      nickname: "Jonah Levt",
      jerseyNumber: 7,
      isConnected: true,
      powerUsed: true,
      shotsMade: 3,
      shotsMissed: 2,
      scoreXp: 58,
      kindnessPoints: 15,
      user: {
        id: "user-1",
        nickname: "Jonah Levt",
        realName: "Jonah Levt",
        username: "jonahl41",
        avatarUrl: null,
      },
      hero: {
        id: "hero-1",
        code: "SWIFT_WINGS",
        name: "Swift Wings",
        displayName: "Swift Wings",
        powerCode: "TIME_BOOST",
        powerLabel: "Time Boost",
      },
    },
    {
      id: "part-1v1-2",
      teamId: "team-1v1-b",
      userId: "user-2",
      nickname: "Maya Lin",
      jerseyNumber: 11,
      isConnected: true,
      powerUsed: false,
      shotsMade: 5,
      shotsMissed: 1,
      scoreXp: 88,
      kindnessPoints: 25,
      user: {
        id: "user-2",
        nickname: "Maya Lin",
        realName: "Maya Lin",
        username: "mayal22",
        avatarUrl: null,
      },
      hero: {
        id: "hero-2",
        code: "CRYSTAL_SHIELD",
        name: "Crystal Shield",
        displayName: "Crystal Shield",
        powerCode: "DOUBLE_POINTS",
        powerLabel: "Double Shot Points",
      },
    },
  ],
  rounds: [
    {
      id: "r1",
      number: 1,
      roundType: "KINDNESS_TRIVIA",
      phase: "COMPLETE",
      buzzWinnerId: "part-1v1-2",
      answersCount: 2,
      shootoutsCount: 2,
    },
    {
      id: "r2",
      number: 2,
      roundType: "SCENARIO_RESPONSE",
      phase: "COMPLETE",
      buzzWinnerId: "part-1v1-1",
      answersCount: 2,
      shootoutsCount: 2,
    },
  ],
};

export const SAMPLE_MATCH_5V5: GameMatchDetail = {
  id: "match-5v5-001",
  mode: "FIVE_V_FIVE",
  phase: "FINISHED",
  className: "Grade 3 • Maple",
  startedAt: "2026-10-27T11:00:00Z",
  finishedAt: "2026-10-27T11:15:45Z",
  createdAt: "2026-10-27T11:00:00Z",
  winnerTeamId: "team-5v5-b",
  teams: [
    {
      id: "team-5v5-a",
      label: "Team A",
      scoreXp: 58,
      scoreKindness: 45,
      scoreBaskets: 4,
    },
    {
      id: "team-5v5-b",
      label: "Team B",
      scoreXp: 88,
      scoreKindness: 70,
      scoreBaskets: 7,
    },
  ],
  participants: [
    // Team A
    {
      id: "p-a1",
      teamId: "team-5v5-a",
      userId: "u-a1",
      nickname: "Jonah Levt",
      jerseyNumber: 1,
      isConnected: true,
      powerUsed: true,
      shotsMade: 1,
      shotsMissed: 1,
      scoreXp: 12,
      kindnessPoints: 10,
      user: { id: "u-a1", nickname: "Jonah Levt", username: "jonahl41" },
      hero: { id: "h1", code: "HERO_1", displayName: "Faith Protector" },
    },
    {
      id: "p-a2",
      teamId: "team-5v5-a",
      userId: "u-a2",
      nickname: "Ethan Brooks",
      jerseyNumber: 3,
      isConnected: true,
      powerUsed: false,
      shotsMade: 1,
      shotsMissed: 0,
      scoreXp: 15,
      kindnessPoints: 10,
      user: { id: "u-a2", nickname: "Ethan Brooks", username: "ethanb" },
      hero: { id: "h2", code: "HERO_2", displayName: "Gabriel Courage" },
    },
    {
      id: "p-a3",
      teamId: "team-5v5-a",
      userId: "u-a3",
      nickname: "Chloe Davis",
      jerseyNumber: 5,
      isConnected: true,
      powerUsed: false,
      shotsMade: 1,
      shotsMissed: 2,
      scoreXp: 10,
      kindnessPoints: 5,
      user: { id: "u-a3", nickname: "Chloe Davis", username: "chloed" },
      hero: { id: "h3", code: "HERO_3", displayName: "Harmony Heart" },
    },
    {
      id: "p-a4",
      teamId: "team-5v5-a",
      userId: "u-a4",
      nickname: "Lucas Scott",
      jerseyNumber: 8,
      isConnected: true,
      powerUsed: true,
      shotsMade: 1,
      shotsMissed: 1,
      scoreXp: 11,
      kindnessPoints: 10,
      user: { id: "u-a4", nickname: "Lucas Scott", username: "lucass" },
      hero: { id: "h4", code: "HERO_4", displayName: "Justice Shield" },
    },
    {
      id: "p-a5",
      teamId: "team-5v5-a",
      userId: "u-a5",
      nickname: "Ava Ramirez",
      jerseyNumber: 12,
      isConnected: true,
      powerUsed: false,
      shotsMade: 0,
      shotsMissed: 1,
      scoreXp: 10,
      kindnessPoints: 10,
      user: { id: "u-a5", nickname: "Ava Ramirez", username: "avar" },
      hero: { id: "h5", code: "HERO_5", displayName: "Star Beacon" },
    },
    // Team B
    {
      id: "p-b1",
      teamId: "team-5v5-b",
      userId: "u-b1",
      nickname: "Sam Parker",
      jerseyNumber: 2,
      isConnected: true,
      powerUsed: true,
      shotsMade: 2,
      shotsMissed: 0,
      scoreXp: 20,
      kindnessPoints: 15,
      user: { id: "u-b1", nickname: "Sam Parker", username: "samp" },
      hero: { id: "h6", code: "HERO_6", displayName: "Sun Blaze" },
    },
    {
      id: "p-b2",
      teamId: "team-5v5-b",
      userId: "u-b2",
      nickname: "Zoe Chen",
      jerseyNumber: 4,
      isConnected: true,
      powerUsed: false,
      shotsMade: 1,
      shotsMissed: 1,
      scoreXp: 16,
      kindnessPoints: 15,
      user: { id: "u-b2", nickname: "Zoe Chen", username: "zoec" },
      hero: { id: "h7", code: "HERO_7", displayName: "Peace Dove" },
    },
    {
      id: "p-b3",
      teamId: "team-5v5-b",
      userId: "u-b3",
      nickname: "Noah Wilson",
      jerseyNumber: 9,
      isConnected: true,
      powerUsed: false,
      shotsMade: 2,
      shotsMissed: 1,
      scoreXp: 18,
      kindnessPoints: 15,
      user: { id: "u-b3", nickname: "Noah Wilson", username: "noahw" },
      hero: { id: "h8", code: "HERO_8", displayName: "Echo Wing" },
    },
    {
      id: "p-b4",
      teamId: "team-5v5-b",
      userId: "u-b4",
      nickname: "Mia Taylor",
      jerseyNumber: 10,
      isConnected: true,
      powerUsed: true,
      shotsMade: 1,
      shotsMissed: 0,
      scoreXp: 18,
      kindnessPoints: 15,
      user: { id: "u-b4", nickname: "Mia Taylor", username: "miat" },
      hero: { id: "h9", code: "HERO_9", displayName: "Brave Falcon" },
    },
    {
      id: "p-b5",
      teamId: "team-5v5-b",
      userId: "u-b5",
      nickname: "Oliver White",
      jerseyNumber: 14,
      isConnected: true,
      powerUsed: false,
      shotsMade: 1,
      shotsMissed: 0,
      scoreXp: 16,
      kindnessPoints: 10,
      user: { id: "u-b5", nickname: "Oliver White", username: "oliverw" },
      hero: { id: "h10", code: "HERO_10", displayName: "Golden Eagle" },
    },
  ],
};

export const SAMPLE_MATCHES: GameMatch[] = [
  {
    id: "match-001",
    mode: "FIVE_V_FIVE",
    phase: "FINISHED",
    className: "Grade 4 • Amber",
    createdAt: "2026-10-27T14:30:00Z",
    startedAt: "2026-10-27T14:30:00Z",
    finishedAt: "2026-10-27T14:45:00Z",
    winnerTeamId: "team-1-a",
    teams: [
      { id: "team-1-a", label: "Team A", scoreXp: 88, scoreKindness: 65, scoreBaskets: 6 },
      { id: "team-1-b", label: "Team B", scoreXp: 58, scoreKindness: 40, scoreBaskets: 3 },
    ],
    participants: [
      { id: "p1", teamId: "team-1-a", nickname: "Jonah Levt", isConnected: true },
      { id: "p2", teamId: "team-1-b", nickname: "Sam Parker", isConnected: true },
    ],
  },
  {
    id: "match-002",
    mode: "FIVE_V_FIVE",
    phase: "FINISHED",
    className: "Grade 4 • Amber",
    createdAt: "2026-10-27T13:15:00Z",
    startedAt: "2026-10-27T13:15:00Z",
    finishedAt: "2026-10-27T13:30:00Z",
    winnerTeamId: "team-2-a",
    teams: [
      { id: "team-2-a", label: "Team A", scoreXp: 88, scoreKindness: 70, scoreBaskets: 7 },
      { id: "team-2-b", label: "Team B", scoreXp: 64, scoreKindness: 45, scoreBaskets: 4 },
    ],
    participants: [
      { id: "p3", teamId: "team-2-a", nickname: "Ethan Brooks", isConnected: true },
      { id: "p4", teamId: "team-2-b", nickname: "Zoe Chen", isConnected: true },
    ],
  },
  {
    id: "match-003",
    mode: "ONE_V_ONE",
    phase: "FINISHED",
    className: "Grade 9 • Timber",
    createdAt: "2026-10-27T12:00:00Z",
    startedAt: "2026-10-27T12:00:00Z",
    finishedAt: "2026-10-27T12:12:00Z",
    winnerTeamId: "team-3-a",
    teams: [
      { id: "team-3-a", label: "Player 1", scoreXp: 88, scoreKindness: 30, scoreBaskets: 5 },
      { id: "team-3-b", label: "Player 2", scoreXp: 58, scoreKindness: 15, scoreBaskets: 2 },
    ],
    participants: [
      { id: "p5", teamId: "team-3-a", nickname: "Jonah Levt", isConnected: true },
      { id: "p6", teamId: "team-3-b", nickname: "Maya Lin", isConnected: true },
    ],
  },
  {
    id: "match-004",
    mode: "FIVE_V_FIVE",
    phase: "FINISHED",
    className: "Grade 4 • Amber",
    createdAt: "2026-10-27T11:20:00Z",
    startedAt: "2026-10-27T11:20:00Z",
    finishedAt: "2026-10-27T11:35:00Z",
    winnerTeamId: "team-4-a",
    teams: [
      { id: "team-4-a", label: "Team A", scoreXp: 88, scoreKindness: 55, scoreBaskets: 6 },
      { id: "team-4-b", label: "Team B", scoreXp: 72, scoreKindness: 50, scoreBaskets: 5 },
    ],
    participants: [
      { id: "p7", teamId: "team-4-a", nickname: "Chloe Davis", isConnected: true },
      { id: "p8", teamId: "team-4-b", nickname: "Noah Wilson", isConnected: true },
    ],
  },
  {
    id: "match-005",
    mode: "FIVE_V_FIVE",
    phase: "FINISHED",
    className: "Grade 6 • Oak",
    createdAt: "2026-10-27T10:10:00Z",
    startedAt: "2026-10-27T10:10:00Z",
    finishedAt: "2026-10-27T10:25:00Z",
    winnerTeamId: "team-5-a",
    teams: [
      { id: "team-5-a", label: "Team A", scoreXp: 88, scoreKindness: 60, scoreBaskets: 6 },
      { id: "team-5-b", label: "Team B", scoreXp: 58, scoreKindness: 35, scoreBaskets: 3 },
    ],
    participants: [
      { id: "p9", teamId: "team-5-a", nickname: "Lucas Scott", isConnected: true },
      { id: "p10", teamId: "team-5-b", nickname: "Mia Taylor", isConnected: true },
    ],
  },
  {
    id: "match-006",
    mode: "ONE_V_ONE",
    phase: "FINISHED",
    className: "Grade 4 • Amber",
    createdAt: "2026-10-27T09:00:00Z",
    startedAt: "2026-10-27T09:00:00Z",
    finishedAt: "2026-10-27T09:12:00Z",
    winnerTeamId: "team-6-a",
    teams: [
      { id: "team-6-a", label: "Player 1", scoreXp: 88, scoreKindness: 25, scoreBaskets: 5 },
      { id: "team-6-b", label: "Player 2", scoreXp: 58, scoreKindness: 15, scoreBaskets: 2 },
    ],
    participants: [
      { id: "p11", teamId: "team-6-a", nickname: "Ava Ramirez", isConnected: true },
      { id: "p12", teamId: "team-6-b", nickname: "Oliver White", isConnected: true },
    ],
  },
];
