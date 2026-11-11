import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { dashboardRedirect } from "@/lib/auth/redirect";
import { EligibilityCards } from "./eligibility-cards";
import {
  DEFAULT_ELIGIBILITY,
  formatMatchDate,
  formatMatchDuration,
  formatModeLabel,
  getMatchScoreDisplay,
  getWinnerLabel,
  getWinnerTeam,
  loadLocalEligibility,
  SAMPLE_MATCH_1V1,
  SAMPLE_MATCH_5V5,
  SAMPLE_MATCHES,
  saveLocalEligibility,
  STORAGE_KEY_ELIGIBILITY,
  updateEligibilitySchema,
  type EligibilityConfig,
  type StorageLike,
} from "./model";

class MockStorage implements StorageLike {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

describe("Game show eligibility config storage", () => {
  it("loads default eligibility config when storage is empty", () => {
    const storage = new MockStorage();
    const config = loadLocalEligibility(storage);
    expect(config).toEqual(DEFAULT_ELIGIBILITY);
    expect(config.requiredStories).toBe(2);
    expect(config.requiredChapters).toBe(6);
    expect(config.minQuizPercent).toBe(70);
  });

  it("saves and loads custom eligibility config", () => {
    const storage = new MockStorage();
    const custom: EligibilityConfig = {
      requiredStories: 3,
      requiredChapters: 10,
      minQuizPercent: 80,
      updatedAt: "2026-10-27T12:00:00Z",
    };
    saveLocalEligibility(custom, storage);
    const loaded = loadLocalEligibility(storage);
    expect(loaded.requiredStories).toBe(3);
    expect(loaded.requiredChapters).toBe(10);
    expect(loaded.minQuizPercent).toBe(80);
    expect(loaded.updatedAt).toBe("2026-10-27T12:00:00Z");
  });

  it("handles snake_case properties from backend in storage", () => {
    const storage = new MockStorage();
    storage.setItem(
      STORAGE_KEY_ELIGIBILITY,
      JSON.stringify({
        required_stories: 4,
        required_chapters: 12,
        min_quiz_percent: 75,
      }),
    );
    const loaded = loadLocalEligibility(storage);
    expect(loaded.requiredStories).toBe(4);
    expect(loaded.requiredChapters).toBe(12);
    expect(loaded.minQuizPercent).toBe(75);
  });
});

describe("Game show eligibility validation schema", () => {
  it("accepts valid eligibility input", () => {
    const parsed = updateEligibilitySchema.safeParse({
      requiredStories: 2,
      requiredChapters: 6,
      minQuizPercent: 70,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiredStories).toBe(2);
      expect(parsed.data.requiredChapters).toBe(6);
      expect(parsed.data.minQuizPercent).toBe(70);
    }
  });

  it("rejects negative numbers", () => {
    const parsed = updateEligibilitySchema.safeParse({
      requiredStories: -1,
      requiredChapters: 6,
      minQuizPercent: 70,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects minQuizPercent above 100", () => {
    const parsed = updateEligibilitySchema.safeParse({
      requiredStories: 2,
      requiredChapters: 6,
      minQuizPercent: 105,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("Game match formatting helpers", () => {
  it("formats mode labels correctly", () => {
    expect(formatModeLabel("ONE_V_ONE")).toBe("Single Player");
    expect(formatModeLabel("SINGLE")).toBe("Single Player");
    expect(formatModeLabel("FIVE_V_FIVE")).toBe("Multi Player");
  });

  it("formats dates gracefully", () => {
    expect(formatMatchDate("October 27, 2026")).toBe("October 27, 2026");
    const formatted = formatMatchDate("2026-10-27T14:30:00Z");
    expect(formatted).toContain("October");
    expect(formatted).toContain("27");
    expect(formatted).toContain("2026");
  });

  it("formats match durations", () => {
    expect(
      formatMatchDuration("2026-10-27T10:00:00Z", "2026-10-27T10:12:30Z"),
    ).toBe("12m 30s");
    expect(formatMatchDuration(null, null)).toBe("12m 30s");
  });
});

describe("Score and winner calculations", () => {
  it("calculates match scores and winning score", () => {
    const scores = getMatchScoreDisplay(SAMPLE_MATCH_1V1);
    expect(scores.teamA).toBe(58);
    expect(scores.teamB).toBe(88);
    expect(scores.winningScore).toBe(88);
  });

  it("identifies winner team in 1v1 and 5v5", () => {
    const winner1v1 = getWinnerTeam(SAMPLE_MATCH_1V1);
    expect(winner1v1?.id).toBe("team-1v1-b");
    expect(winner1v1?.scoreXp).toBe(88);

    const winner5v5 = getWinnerTeam(SAMPLE_MATCH_5V5);
    expect(winner5v5?.id).toBe("team-5v5-b");
    expect(winner5v5?.scoreXp).toBe(88);
  });

  it("returns winner label", () => {
    // In 1v1, returns winning participant nickname
    expect(getWinnerLabel(SAMPLE_MATCH_1V1)).toBe("Maya Lin");
    // In 5v5, returns winning team label
    expect(getWinnerLabel(SAMPLE_MATCH_5V5)).toBe("Team B");
  });
});

describe("Sample match fixtures integrity", () => {
  it("has valid 1v1 match fixture", () => {
    expect(SAMPLE_MATCH_1V1.mode).toBe("ONE_V_ONE");
    expect(SAMPLE_MATCH_1V1.participants).toHaveLength(2);
    expect(SAMPLE_MATCH_1V1.teams).toHaveLength(2);
  });

  it("has valid 5v5 match fixture with 10 players", () => {
    expect(SAMPLE_MATCH_5V5.mode).toBe("FIVE_V_FIVE");
    expect(SAMPLE_MATCH_5V5.participants).toHaveLength(10);
    expect(SAMPLE_MATCH_5V5.teams).toHaveLength(2);

    const teamAPlayers = SAMPLE_MATCH_5V5.participants.filter(
      (p) => p.teamId === "team-5v5-a",
    );
    const teamBPlayers = SAMPLE_MATCH_5V5.participants.filter(
      (p) => p.teamId === "team-5v5-b",
    );
    expect(teamAPlayers).toHaveLength(5);
    expect(teamBPlayers).toHaveLength(5);
  });

  it("has 6 sample matches matching the design list", () => {
    expect(SAMPLE_MATCHES).toHaveLength(6);
    expect(SAMPLE_MATCHES[0].mode).toBe("FIVE_V_FIVE");
    expect(SAMPLE_MATCHES[2].mode).toBe("ONE_V_ONE");
  });
});

describe("EligibilityCards component", () => {
  it("renders metric cards with correct numbers and copy", () => {
    const html = renderToStaticMarkup(
      <EligibilityCards
        config={DEFAULT_ELIGIBILITY}
        onEdit={() => {}}
      />,
    );
    expect(html).toContain("Game Show Rules");
    expect(html).toContain("Manage students game show eligibility");
    expect(html).toContain("Required Stories");
    expect(html).toContain("Story completed");
    expect(html).toContain("Required Chapters");
    expect(html).toContain("Chapters completes");
    expect(html).toContain("Minimum Comprehension %");
    expect(html).toContain("% average quiz score");
    expect(html).toContain("2");
    expect(html).toContain("6");
    expect(html).toContain("70");
  });
});

describe("Admin game show route access redirect", () => {
  it("redirects TEACHER from /admin/game-show to /teacher", () => {
    const dest = dashboardRedirect({
      role: "TEACHER",
      pathname: "/admin/game-show",
    });
    expect(dest).toBe("/teacher");
  });

  it("redirects TEACHER from /admin/game-show/match-123 to /teacher", () => {
    const dest = dashboardRedirect({
      role: "TEACHER",
      pathname: "/admin/game-show/match-123",
    });
    expect(dest).toBe("/teacher");
  });

  it("allows ADMIN to access /admin/game-show", () => {
    const dest = dashboardRedirect({
      role: "ADMIN",
      pathname: "/admin/game-show",
    });
    expect(dest).toBeNull();
  });
});
