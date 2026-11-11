import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GamePacksList } from "./game-packs-list";
import { GamePackWizard } from "./game-pack-wizard";
import {
  FALLBACK_GAME_PACKS,
  ROUND_STEPS,
  createDefaultPackFormData,
  createDefaultRound1Questions,
  createDefaultRound2Question,
  createDefaultRound3Questions,
  createDefaultRound4Questions,
  detailToFormData,
  formatAgeGroup,
  normalizeGamePackDetail,
  normalizeGamePackRow,
  toAgeGroupEnum,
  toAgeGroupFormValue,
  toSavePackPayload,
  validatePackForm,
  type GamePackDetail,
} from "./model";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("game packs model & helpers", () => {
  describe("age group normalization", () => {
    it("formats age group labels correctly", () => {
      expect(formatAgeGroup("AGE_6_9")).toBe("6–9");
      expect(formatAgeGroup("6-9")).toBe("6–9");
      expect(formatAgeGroup("AGE_10_13")).toBe("10–13");
      expect(formatAgeGroup("10-13")).toBe("10–13");
      expect(formatAgeGroup("ADULTS")).toBe("Adults");
      expect(formatAgeGroup("adults")).toBe("Adults");
    });

    it("converts UI age groups to backend enums", () => {
      expect(toAgeGroupEnum("6-9")).toBe("AGE_6_9");
      expect(toAgeGroupEnum("10-13")).toBe("AGE_10_13");
      expect(toAgeGroupEnum("adults")).toBe("ADULTS");
      expect(toAgeGroupEnum("AGE_6_9")).toBe("AGE_6_9");
    });

    it("converts backend enums to form values", () => {
      expect(toAgeGroupFormValue("AGE_6_9")).toBe("6-9");
      expect(toAgeGroupFormValue("AGE_10_13")).toBe("10-13");
      expect(toAgeGroupFormValue("ADULTS")).toBe("adults");
    });
  });

  describe("default question & form creators", () => {
    it("creates 4 MCQ questions for Round 1, 3, and 4", () => {
      const r1 = createDefaultRound1Questions();
      const r3 = createDefaultRound3Questions();
      const r4 = createDefaultRound4Questions();

      expect(r1).toHaveLength(4);
      expect(r3).toHaveLength(4);
      expect(r4).toHaveLength(4);

      expect(r1[0].options).toHaveLength(4);
      expect(r1[0].correctIndex).toBeGreaterThanOrEqual(0);
      expect(r1[0].prompt).toBeTruthy();
    });

    it("creates Round 2 written story challenge question", () => {
      const r2 = createDefaultRound2Question();
      expect(r2.storyText).toContain("lantern");
      expect(r2.prompt).toBe("How did the lantern keeper save the boat?");
      expect(r2.sampleAnswer).toContain("lighthouse");
    });

    it("creates default pack form data with all 4 rounds", () => {
      const form = createDefaultPackFormData();
      expect(form.title).toBe("Anti-Bullying Game Pack");
      expect(form.ageGroup).toBe("6-9");
      expect(form.status).toBe("DRAFT");
      expect(form.stories).toHaveLength(2);
      expect(form.round1).toHaveLength(4);
      expect(form.round2.prompt).toBeTruthy();
      expect(form.round3).toHaveLength(4);
      expect(form.round4).toHaveLength(4);
    });
  });

  describe("step metadata", () => {
    it("defines 5 sequential wizard steps matching design screens", () => {
      expect(ROUND_STEPS).toHaveLength(5);
      expect(ROUND_STEPS[0].title).toBe("Create a New Game");
      expect(ROUND_STEPS[1].name).toBe("Round -1");
      expect(ROUND_STEPS[1].roundType).toBe("Q1_WARMUP");
      expect(ROUND_STEPS[2].name).toBe("Round -2");
      expect(ROUND_STEPS[2].roundType).toBe("Q2_DEFENSE");
      expect(ROUND_STEPS[3].name).toBe("Round -3");
      expect(ROUND_STEPS[3].roundType).toBe("Q3_HOBBY");
      expect(ROUND_STEPS[4].name).toBe("Round -4");
      expect(ROUND_STEPS[4].roundType).toBe("Q4_FINALS");
    });
  });

  describe("row & detail normalization", () => {
    it("normalizes row with snake_case and camelCase", () => {
      const raw = {
        id: "pack-101",
        title: "Test Pack",
        age_group: "AGE_10_13",
        status: "PUBLISHED",
        stories: [
          { story: { title: "Story A" } },
          { story: { title: "Story B" } },
        ],
        questions: [{ id: "q1" }, { id: "q2" }],
      };

      const normalized = normalizeGamePackRow(raw);
      expect(normalized.id).toBe("pack-101");
      expect(normalized.title).toBe("Test Pack");
      expect(normalized.ageGroupLabel).toBe("10–13");
      expect(normalized.status).toBe("PUBLISHED");
      expect(normalized.storyCount).toBe(2);
      expect(normalized.questionCount).toBe(2);
      expect(normalized.storiesSummary).toBe("Story A, Story B");
    });

    it("normalizes detail and maps to form data", () => {
      const detailRaw: GamePackDetail = {
        id: "pack-202",
        title: "Kindness Challenge Pack",
        ageGroup: "AGE_6_9",
        status: "DRAFT",
        stories: [
          {
            id: "s-ref-1",
            storyId: "story-1",
            story: { id: "story-1", title: "Story 1" },
          },
        ],
        questions: [
          {
            id: "q-r1",
            roundType: "Q1_WARMUP",
            sortOrder: 1,
            type: "MCQ",
            prompt: "What is kindness?",
            optionsJson: {
              options: ["Help others", "Ignore", "Leave", "Laugh"],
              correctIndex: 0,
            },
          },
          {
            id: "q-r2",
            roundType: "Q2_DEFENSE",
            sortOrder: 1,
            type: "FREE_TEXT",
            prompt: "Why was the lantern lit?",
            metaJson: {
              storyText: "A dark stormy night.",
              sampleAnswer: "To protect the boat.",
            },
          },
        ],
        createdAt: "2026-11-01T00:00:00Z",
        updatedAt: "2026-11-01T00:00:00Z",
      };

      const detail = normalizeGamePackDetail(detailRaw);
      expect(detail.id).toBe("pack-202");
      expect(detail.questions).toHaveLength(2);

      const form = detailToFormData(detail);
      expect(form.title).toBe("Kindness Challenge Pack");
      expect(form.ageGroup).toBe("6-9");
      expect(form.round1[0].prompt).toBe("What is kindness?");
      expect(form.round2.prompt).toBe("Why was the lantern lit?");
      expect(form.round2.storyText).toBe("A dark stormy night.");
    });
  });

  describe("payload builder & validation", () => {
    it("converts form data to backend payload with 4 rounds", () => {
      const form = createDefaultPackFormData();
      const payload = toSavePackPayload(form, "PUBLISHED");

      expect(payload.title).toBe("Anti-Bullying Game Pack");
      expect(payload.age_group).toBe("AGE_6_9");
      expect(payload.status).toBe("PUBLISHED");
      expect(payload.story_ids).toEqual([
        "story-lantern-keeper",
        "story-river-sings",
      ]);

      const roundTypes = payload.questions.map((q) => q.round_type);
      expect(roundTypes).toContain("Q1_WARMUP");
      expect(roundTypes).toContain("Q2_DEFENSE");
      expect(roundTypes).toContain("Q3_HOBBY");
      expect(roundTypes).toContain("Q4_FINALS");
      expect(payload.questions.length).toBe(13); // 4 + 1 + 4 + 4
    });

    it("validates pack title and round completeness", () => {
      const form = createDefaultPackFormData();
      expect(validatePackForm(form, "DRAFT").valid).toBe(true);

      form.title = "   ";
      const invalidTitle = validatePackForm(form, "DRAFT");
      expect(invalidTitle.valid).toBe(false);
      expect(invalidTitle.errors).toContain("Game pack title is required.");

      // Test published validation
      form.title = "Valid Title";
      form.round1[0].prompt = "";
      const invalidPublish = validatePackForm(form, "PUBLISHED");
      expect(invalidPublish.valid).toBe(false);
      expect(
        invalidPublish.errors.some((e) => e.includes("Round 1")),
      ).toBe(true);
    });
  });
});

describe("game packs UI static markup rendering", () => {
  it("renders game pack list view with items", () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    qc.setQueryData(["teacher-game-packs", 1, "", "ALL", "ALL"], {
      items: FALLBACK_GAME_PACKS,
      total: FALLBACK_GAME_PACKS.length,
      page: 1,
      perPage: 10,
      lastPage: 1,
    });

    const html = renderToStaticMarkup(
      <QueryClientProvider client={qc}>
        <GamePacksList />
      </QueryClientProvider>,
    );

    expect(html).toContain("Stories &amp; Questions");
    expect(html).toContain("Create Game Pack");
    expect(html).toContain("The Lantern Keeper Pack");
    expect(html).toContain("All Statuses");
    expect(html).toContain("All Ages");
  });

  it("renders game pack wizard initial step", () => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={qc}>
        <GamePackWizard />
      </QueryClientProvider>,
    );

    expect(html).toContain("Create a New Game");
    expect(html).toContain("Pack Title");
    expect(html).toContain("Age Group");
    expect(html).toContain("Storie");
    expect(html).toContain("Chapter");
    expect(html).toContain("Round -1");
    expect(html).toContain("Round -2");
    expect(html).toContain("Round -3");
    expect(html).toContain("Round -4");
    expect(html).toContain("Next");
    expect(html).toContain("Save Draft");
  });
});
