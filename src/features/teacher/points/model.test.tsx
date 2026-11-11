import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AwardTab } from "./award-tab";
import { BadgeMonitorTab } from "./badge-monitor-tab";
import { HistoryTab } from "./history-tab";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));
import {
  ALLOWED_AMOUNTS,
  AWARD_CATEGORIES,
  awardPointsSchema,
  DEFAULT_BADGE_DEFINITIONS,
  formatAwardDate,
  formatShortDate,
  normalizeBadgeMonitorData,
  normalizePointsHistoryItem,
  SAMPLE_BADGE_STUDENTS,
  SAMPLE_RECENT_AWARDS,
} from "./model";
import { PointsBadgesView } from "./points-badges-view";

const mockClasses = [
  { id: "class-1", name: "Grade 4 · Amber", gradeLabel: "Grade 4" },
  { id: "class-2", name: "Grade 4 · Emerald", gradeLabel: "Grade 4" },
];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

describe("awardPointsSchema validation", () => {
  it("accepts valid award payloads with amounts between 1 and 5", () => {
    ALLOWED_AMOUNTS.forEach((amount) => {
      const result = awardPointsSchema.safeParse({
        studentId: "student-1",
        amount,
        category: "Kindness",
        reason: "Helped partner with reading",
      });
      expect(result.success).toBe(true);
    });
  });

  it("rejects amount below 1", () => {
    const result0 = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 0,
      category: "Kindness",
    });
    expect(result0.success).toBe(false);

    const resultNeg = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: -1,
      category: "Kindness",
    });
    expect(resultNeg.success).toBe(false);
  });

  it("rejects amount greater than 5", () => {
    const result6 = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 6,
      category: "Kindness",
    });
    expect(result6.success).toBe(false);

    const result10 = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 10,
      category: "Kindness",
    });
    expect(result10.success).toBe(false);
  });

  it("rejects non-integer amount", () => {
    const result = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 3.5,
      category: "Kindness",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty studentId", () => {
    const result = awardPointsSchema.safeParse({
      studentId: "",
      amount: 3,
      category: "Kindness",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty category", () => {
    const result = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 3,
      category: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional reason or empty string", () => {
    const noReason = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 2,
      category: "Effort",
    });
    expect(noReason.success).toBe(true);

    const emptyReason = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 2,
      category: "Effort",
      reason: "",
    });
    expect(emptyReason.success).toBe(true);
  });

  it("rejects reason longer than 300 characters", () => {
    const longReason = "a".repeat(301);
    const result = awardPointsSchema.safeParse({
      studentId: "student-1",
      amount: 2,
      category: "Effort",
      reason: longReason,
    });
    expect(result.success).toBe(false);
  });
});

describe("normalization functions", () => {
  it("normalizes points history item from nested user object", () => {
    const raw = {
      id: "ledger-1",
      user_id: "student-123",
      user: {
        real_name: "Maya Okafor",
        avatar_url: "/avatar.png",
      },
      amount: 4,
      label: "Helping a classmate",
      ref_id: "Assisted partner",
      created_at: "2026-10-21T10:05:00Z",
    };

    const item = normalizePointsHistoryItem(raw);
    expect(item.id).toBe("ledger-1");
    expect(item.studentId).toBe("student-123");
    expect(item.studentName).toBe("Maya Okafor");
    expect(item.avatarUrl).toBe("/avatar.png");
    expect(item.amount).toBe(4);
    expect(item.points).toBe(4);
    expect(item.category).toBe("Helping a classmate");
    expect(item.reason).toBe("Assisted partner");
  });

  it("normalizes points history item from flat fields", () => {
    const raw = {
      id: "ledger-2",
      studentId: "student-456",
      studentName: "Jonah Levy",
      amount: 5,
      category: "Kindness",
      reason: "Welcomed new student",
      createdAt: "2026-10-22T08:30:00Z",
    };

    const item = normalizePointsHistoryItem(raw);
    expect(item.id).toBe("ledger-2");
    expect(item.studentName).toBe("Jonah Levy");
    expect(item.amount).toBe(5);
    expect(item.category).toBe("Kindness");
  });

  it("handles empty or null history item with safe fallbacks", () => {
    const item = normalizePointsHistoryItem(null, 5);
    expect(item.id).toBe("history-5");
    expect(item.studentName).toBe("Student 6");
    expect(item.amount).toBe(1);
    expect(item.category).toBe("Kindness");
  });

  it("normalizes badge monitor data with 6 badges", () => {
    const raw = {
      total: 20,
      page: 1,
      perPage: 10,
      badges: DEFAULT_BADGE_DEFINITIONS,
      items: SAMPLE_BADGE_STUDENTS,
    };

    const normalized = normalizeBadgeMonitorData(raw);
    expect(normalized.total).toBe(20);
    expect(normalized.badges).toHaveLength(6);
    expect(normalized.items).toHaveLength(SAMPLE_BADGE_STUDENTS.length);

    const firstStudent = normalized.items[0];
    expect(firstStudent.name).toBe("Jonah Levy");
    expect(firstStudent.badges).toHaveLength(6);

    const kindnessBadge = firstStudent.badges.find(
      (b) => b.code === "KINDNESS_CHAMPION",
    );
    expect(kindnessBadge?.earned).toBe(true);
    expect(kindnessBadge?.earnedAt).toBe("2026-10-21T10:00:00Z");
  });

  it("handles empty or null badge monitor data", () => {
    const normalized = normalizeBadgeMonitorData(null);
    expect(normalized.items).toHaveLength(0);
    expect(normalized.total).toBe(0);
    expect(normalized.badges).toHaveLength(6);
  });
});

describe("date formatting helpers", () => {
  it("formats award date with month, day, and time", () => {
    const formatted = formatAwardDate("2026-10-21T10:05:00Z");
    expect(formatted).toContain("Oct");
    expect(formatted).toContain("21");
  });

  it("formats short date with year", () => {
    const formatted = formatShortDate("2026-10-21T10:05:00Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Oct");
    expect(formatted).toContain("21");
  });

  it("handles null or invalid date safely", () => {
    expect(formatShortDate(null)).toBe("");
    expect(formatAwardDate("invalid-date")).toBe("invalid-date");
  });
});

describe("Points and Badges markup rendering", () => {
  it("renders award tab with category buttons, points pills, and submit button", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["teacher-students-options", undefined], [
      { id: "s-1", name: "Sofia Alvarez", className: "Grade 4 · Amber" },
    ]);
    queryClient.setQueryData(["teacher-points-history", undefined], {
      items: SAMPLE_RECENT_AWARDS,
      total: SAMPLE_RECENT_AWARDS.length,
      page: 1,
      perPage: 10,
      lastPage: 1,
    });

    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <AwardTab
          classes={mockClasses}
          selectedClassId={undefined}
          onSelectClass={() => {}}
        />
      </QueryClientProvider>,
    );

    // Categories
    AWARD_CATEGORIES.forEach((cat) => {
      expect(markup).toContain(cat);
    });

    // Points pills
    ALLOWED_AMOUNTS.forEach((amount) => {
      expect(markup).toContain(`+${amount}`);
    });

    // Button and recent awards
    expect(markup).toContain("Review");
    expect(markup).toContain("Recent awards");
    expect(markup).toContain("Sofia Alvarez");
  });

  it("renders badge monitor tab with 6 summary cards and student matrix", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["teacher-badge-monitor", undefined, 1], {
      items: SAMPLE_BADGE_STUDENTS,
      total: SAMPLE_BADGE_STUDENTS.length,
      page: 1,
      perPage: 10,
      lastPage: 1,
      badges: DEFAULT_BADGE_DEFINITIONS,
    });

    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <BadgeMonitorTab
          classes={mockClasses}
          selectedClassId={undefined}
          onSelectClass={() => {}}
        />
      </QueryClientProvider>,
    );

    // Badges in cards/headers
    expect(markup).toContain("Kindness Champion");
    expect(markup).toContain("Story Explorer");
    expect(markup).toContain("Helping Hand");
    expect(markup).toContain("Speak Up");
    expect(markup).toContain("Positive Leader");
    expect(markup).toContain("Game Show Ready");

    // Students in matrix
    expect(markup).toContain("Jonah Levy");
    expect(markup).toContain("Maya Okafor");
    expect(markup).toContain("✓ Earned");
  });

  it("renders history tab with points log table", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["teacher-points-history", undefined, 1], {
      items: SAMPLE_RECENT_AWARDS,
      total: SAMPLE_RECENT_AWARDS.length,
      page: 1,
      perPage: 10,
      lastPage: 1,
    });

    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <HistoryTab
          classes={mockClasses}
          selectedClassId={undefined}
          onSelectClass={() => {}}
        />
      </QueryClientProvider>,
    );

    expect(markup).toContain("Points Log");
    expect(markup).toContain("Sofia Alvarez");
    expect(markup).toContain("Isla Thompson");
    expect(markup).toContain("Welcomed a new classmate");
    expect(markup).toContain("+3");
    expect(markup).toContain("+5");
  });

  it("renders main points badges view header and tabs", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["teacher-points-classes"], mockClasses);
    queryClient.setQueryData(["teacher-students-options", undefined], []);
    queryClient.setQueryData(["teacher-points-history", undefined], {
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
      lastPage: 1,
    });

    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <PointsBadgesView />
      </QueryClientProvider>,
    );

    expect(markup).toContain("Points &amp; badges");
    expect(markup).toContain("Recognise positive behaviour and monitor achievements.");
    expect(markup).toContain("Award points");
    expect(markup).toContain("Monitor badges");
    expect(markup).toContain("History");
  });
});
