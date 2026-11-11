import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AGE_GROUPS,
  buildCreateStoryPayload,
  createChapterSchema,
  createStorySchema,
  formatAgeGroup,
  formatChapterCount,
  formatStoryUpdated,
  STATUS_OPTIONS,
  STORIES_PER_PAGE,
  STORIES_SUBTITLE,
  storyListQuery,
  storyStatusVariant,
  toApiAgeGroup,
} from "./model";
import { StoriesChrome } from "./stories-chrome";
import { StoryTabs } from "./story-tabs";

describe("story age groups & decisions", () => {
  it("offers the three decision-2 bands", () => {
    expect(AGE_GROUPS.map((g) => g.value)).toEqual(["6-9", "10-13", "adults"]);
  });

  it("maps age groups to API enum values", () => {
    expect(toApiAgeGroup("6-9")).toBe("AGE_6_9");
    expect(toApiAgeGroup("10-13")).toBe("AGE_10_13");
    expect(toApiAgeGroup("adults")).toBe("ADULTS");
    expect(toApiAgeGroup("AGE_6_9")).toBe("AGE_6_9");
  });

  it("formats age group display strings", () => {
    expect(formatAgeGroup("AGE_6_9")).toBe("6–9");
    expect(formatAgeGroup("AGE_10_13")).toBe("10–13");
    expect(formatAgeGroup("ADULTS")).toBe("Adults");
    expect(formatAgeGroup("6-9")).toBe("6–9");
    expect(formatAgeGroup(null)).toBe("—");
  });
});

describe("story formatters & variants", () => {
  it("formats chapter counts with 2-digit padding", () => {
    expect(formatChapterCount(0)).toBe("00");
    expect(formatChapterCount(4)).toBe("04");
    expect(formatChapterCount(12)).toBe("12");
    expect(formatChapterCount(undefined)).toBe("00");
  });

  it("formats update dates cleanly", () => {
    expect(formatStoryUpdated(null)).toBe("—");
    const formatted = formatStoryUpdated("2026-10-21T10:00:00Z");
    expect(formatted).toContain("Oct");
  });

  it("maps story status to badge variant", () => {
    expect(STATUS_OPTIONS.map((s) => s.value)).toEqual(["PUBLISHED", "DRAFT"]);
    expect(storyStatusVariant("PUBLISHED")).toBe("published");
    expect(storyStatusVariant("DRAFT")).toBe("draft");
    expect(storyStatusVariant("ARCHIVED")).toBe("draft");
  });
});

describe("story query & payload builders", () => {
  it("builds query with search and filters", () => {
    expect(
      storyListQuery({
        page: 1,
        q: "golden",
        ageGroup: "AGE_6_9",
        status: "PUBLISHED",
      }),
    ).toEqual({
      page: 1,
      perPage: STORIES_PER_PAGE,
      q: "golden",
      ageGroup: "AGE_6_9",
      status: "PUBLISHED",
    });
  });

  it("builds create story payload", () => {
    const payload = buildCreateStoryPayload({
      title: "  The Golden Pearl Book 1  ",
      author: "  Audrey Cuff  ",
      category: "KINDNESS",
      ageGroup: "10-13",
      estimatedMinutes: 20,
      synopsis: "  A heartwarming tale.  ",
      coverUrl: "https://example.com/cover.png",
    });
    expect(payload).toEqual({
      title: "The Golden Pearl Book 1",
      author: "Audrey Cuff",
      category: "KINDNESS",
      ageGroup: "AGE_10_13",
      estimatedMinutes: 20,
      synopsis: "A heartwarming tale.",
      coverUrl: "https://example.com/cover.png",
    });
  });
});

describe("story schema validation", () => {
  it("validates createStorySchema successfully", () => {
    const valid = createStorySchema.safeParse({
      title: "City of Thieves",
      category: "COURAGE",
      ageGroup: "10-13",
      estimatedMinutes: 15,
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid age groups", () => {
    const invalid = createStorySchema.safeParse({
      title: "Story",
      category: "KINDNESS",
      ageGroup: "invalid-age",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects empty title", () => {
    const invalid = createStorySchema.safeParse({
      title: "   ",
      category: "KINDNESS",
      ageGroup: "6-9",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates createChapterSchema", () => {
    expect(createChapterSchema.safeParse({ title: "Chapter 1" }).success).toBe(true);
    expect(createChapterSchema.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("story static components", () => {
  it("renders StoryTabs with active library and disabled Kindness Corner", () => {
    const markup = renderToStaticMarkup(<StoryTabs current="library" storyCount={4} />);
    expect(markup).toContain("Storie Library");
    expect(markup).toContain("4");
    expect(markup).toContain("Kindness Corner");
    expect(markup).toContain('aria-disabled="true"');
  });

  it("renders StoriesChrome with title, subtitle and create button link", () => {
    const markup = renderToStaticMarkup(
      <StoriesChrome storyCount={10}>
        <div data-testid="child-content">Content</div>
      </StoriesChrome>,
    );
    expect(markup).toContain("Stories");
    expect(markup).toContain(STORIES_SUBTITLE);
    expect(markup).toContain("Create Storie");
    expect(markup).toContain("/admin/stories/new");
    expect(markup).toContain("child-content");
  });
});
