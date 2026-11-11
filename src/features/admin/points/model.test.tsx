import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_BADGES,
  DEFAULT_POINT_RULES,
  DEFAULT_SUMMARY,
  HISTORY_PER_PAGE,
  badgeThresholdSchema,
  buildSampleHistory,
  loadLocalBadges,
  loadLocalPointRules,
  pointRulesSchema,
  saveLocalBadges,
  saveLocalPointRules,
} from "./model";
import { PointsSummary } from "./points-summary";
import { PointRulesSection } from "./point-rules-section";
import { BadgesSection } from "./badges-section";

describe("point rules defaults (Decision D8)", () => {
  it("has the locked defaults: STORY_QUESTION=1, KINDNESS_ROUND=50, TEACHER_AWARD_MAX=5", () => {
    expect(DEFAULT_POINT_RULES.storyPoints).toBe(1);
    expect(DEFAULT_POINT_RULES.kindnessPoints).toBe(50);
    expect(DEFAULT_POINT_RULES.teacherAward).toBe(5);
  });

  it("validates point rules schema correctly", () => {
    const valid = pointRulesSchema.safeParse({
      storyPoints: 2,
      kindnessPoints: 50,
      teacherAward: 10,
    });
    expect(valid.success).toBe(true);

    const invalid = pointRulesSchema.safeParse({
      storyPoints: -1,
      kindnessPoints: 50,
      teacherAward: 5,
    });
    expect(invalid.success).toBe(false);
  });
});

describe("summary cards defaults", () => {
  it("matches screenshot totals: 4897, 5000, 6", () => {
    expect(DEFAULT_SUMMARY.totalPositivePoints).toBe(4897);
    expect(DEFAULT_SUMMARY.totalKindnessPoints).toBe(5000);
    expect(DEFAULT_SUMMARY.totalBadges).toBe(6);
  });

  it("renders summary markup correctly", () => {
    const markup = renderToStaticMarkup(
      <PointsSummary summary={DEFAULT_SUMMARY} />,
    );
    expect(markup).toContain("Total Positive Point Awarded");
    expect(markup).toContain("4897");
    expect(markup).toContain("Total Kindness points Awarded");
    expect(markup).toContain("5000");
    expect(markup).toContain("Total Badges");
    expect(markup).toContain("06");
  });
});

describe("six badges specification", () => {
  it("has exactly six badges with the exact names from screenshot", () => {
    expect(DEFAULT_BADGES).toHaveLength(6);
    const names = DEFAULT_BADGES.map((b) => b.name);
    expect(names).toEqual([
      "Kindness Champion",
      "Story Explorer",
      "Game Show Ready",
      "Helping Hand",
      "Speak Up",
      "Positive Leader",
    ]);
  });

  it("has correct automatic vs given by teacher award types", () => {
    const autoBadges = DEFAULT_BADGES.filter((b) => b.awardType === "AUTOMATIC");
    const teacherBadges = DEFAULT_BADGES.filter((b) => b.awardType === "TEACHER");

    expect(autoBadges.map((b) => b.name)).toEqual([
      "Kindness Champion",
      "Story Explorer",
      "Game Show Ready",
    ]);

    expect(teacherBadges.map((b) => b.name)).toEqual([
      "Helping Hand",
      "Speak Up",
      "Positive Leader",
    ]);
  });

  it("has editable thresholds for Kindness Champion and Story Explorer", () => {
    const kindnessChamp = DEFAULT_BADGES.find((b) => b.code === "KINDNESS_CHAMPION")!;
    expect(kindnessChamp.threshold).toBe(500);
    expect(kindnessChamp.thresholdUnit).toBe("kindness point");

    const storyExplorer = DEFAULT_BADGES.find((b) => b.code === "STORY_EXPLORER")!;
    expect(storyExplorer.threshold).toBe(2);
    expect(storyExplorer.thresholdUnit).toBe("Stories");

    const gameShow = DEFAULT_BADGES.find((b) => b.code === "GAME_SHOW_READY")!;
    expect(gameShow.threshold).toBeNull();
    expect(gameShow.criteriaDescription).toContain("Complete 2 stories or 6 chapters");
  });

  it("validates badge threshold schema", () => {
    expect(badgeThresholdSchema.safeParse({ threshold: 500 }).success).toBe(true);
    expect(badgeThresholdSchema.safeParse({ threshold: 0 }).success).toBe(false);
    expect(badgeThresholdSchema.safeParse({ threshold: -5 }).success).toBe(false);
  });

  it("renders badges section markup with all badge names and labels", () => {
    const markup = renderToStaticMarkup(
      <BadgesSection badges={DEFAULT_BADGES} onSaveBadges={() => {}} />,
    );
    expect(markup).toContain("Kindness Champion");
    expect(markup).toContain("Story Explorer");
    expect(markup).toContain("Game Show Ready");
    expect(markup).toContain("Helping Hand");
    expect(markup).toContain("Speak Up");
    expect(markup).toContain("Positive Leader");
    expect(markup).toContain("Automatic");
    expect(markup).toContain("Given by Teacher");
    expect(markup).toContain("10 of 20 earned");
  });
});

describe("points history generator and pagination", () => {
  it("generates 80 history records matching 7 pages at 12 items per page", () => {
    const items = buildSampleHistory();
    expect(items).toHaveLength(80);
    expect(HISTORY_PER_PAGE).toBe(12);

    const totalPages = Math.ceil(items.length / HISTORY_PER_PAGE);
    expect(totalPages).toBe(7);
  });

  it("includes all categories from screenshot including Game Points", () => {
    const items = buildSampleHistory();
    const categories = new Set(items.map((i) => i.category));
    expect(categories.has("Kindness Points")).toBe(true);
    expect(categories.has("Positive Points")).toBe(true);
    expect(categories.has("Game Points")).toBe(true);
  });
});

describe("point rules component", () => {
  it("renders the three editable rule cards and initial values", () => {
    const markup = renderToStaticMarkup(
      <PointRulesSection initialRules={DEFAULT_POINT_RULES} onSave={() => {}} />,
    );
    expect(markup).toContain("Story Points");
    expect(markup).toContain("Kindness Points");
    expect(markup).toContain("Teacher Award");
    expect(markup).toContain("points/question");
    expect(markup).toContain("points/round");
    expect(markup).toContain("points");
  });
});

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("local storage fallback persistence", () => {
  it("saves and loads point rules correctly", () => {
    const store = memory();
    saveLocalPointRules({ storyPoints: 3, kindnessPoints: 75, teacherAward: 10 }, store);
    const loaded = loadLocalPointRules(store);
    expect(loaded).toEqual({ storyPoints: 3, kindnessPoints: 75, teacherAward: 10 });
  });

  it("saves and loads badges correctly", () => {
    const store = memory();
    const modified = DEFAULT_BADGES.map((b) =>
      b.code === "KINDNESS_CHAMPION" ? { ...b, threshold: 600 } : b,
    );
    saveLocalBadges(modified, store);
    const loaded = loadLocalBadges(store);
    expect(loaded.find((b) => b.code === "KINDNESS_CHAMPION")?.threshold).toBe(600);
  });
});
