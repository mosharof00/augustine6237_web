import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { dashboardRedirect } from "@/lib/auth/redirect";
import {
  addNoteSchema,
  calculateSummary,
  changeStatusSchema,
  changeTeacherSchema,
  CONCERN_CATEGORIES,
  formatReportDate,
  reportStatusLabel,
  reportStatusVariant,
  SAMPLE_REPORTS,
} from "./model";
import { SafeSpaceSummarySection } from "./safe-space-summary";

describe("Safe space status mappings", () => {
  it("maps report status to correct badge variant", () => {
    expect(reportStatusVariant("NEW")).toBe("new");
    expect(reportStatusVariant("REVIEWING")).toBe("reviewing");
    expect(reportStatusVariant("ADDRESSED")).toBe("addressed");
    expect(reportStatusVariant("OTHER")).toBe("pending");
  });

  it("maps report status to human labels", () => {
    expect(reportStatusLabel("NEW")).toBe("New");
    expect(reportStatusLabel("REVIEWING")).toBe("Reviewing");
    expect(reportStatusLabel("ADDRESSED")).toBe("Addressed");
    expect(reportStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

describe("Safe space date formatting", () => {
  it("preserves already formatted dates", () => {
    expect(formatReportDate("Oct 17, 10:48 AM")).toBe("Oct 17, 10:48 AM");
  });

  it("formats ISO timestamps correctly", () => {
    const formatted = formatReportDate("2026-10-17T10:48:00Z");
    expect(formatted).toContain("Oct");
    expect(formatted).toContain("17");
  });

  it("handles empty or invalid dates gracefully", () => {
    expect(formatReportDate("")).toBe("");
    expect(formatReportDate("invalid-date")).toBe("invalid-date");
  });
});

describe("Safe space summary calculation", () => {
  it("calculates correct summary counts matching design screens", () => {
    const summary = calculateSummary(SAMPLE_REPORTS);
    expect(summary.newReports).toBe(3);
    expect(summary.reviewingReports).toBe(3);
    expect(summary.addressedReports).toBe(3);
    expect(summary.flaggedReports).toBe(3);
    expect(summary.concernCategories).toHaveLength(4);

    const categories = summary.concernCategories.map((c) => c.category);
    expect(categories).toEqual([
      "Hurtful Words & Teasing",
      "Cyberbullying",
      "Physical Push or Unsafe Behavior",
      "Something Else",
    ]);
  });

  it("calculates summary for custom report sets", () => {
    const reports = [
      {
        ...SAMPLE_REPORTS[0],
        id: "r1",
        status: "NEW" as const,
        feelSafe: false,
        category: "Cyberbullying",
      },
      {
        ...SAMPLE_REPORTS[0],
        id: "r2",
        status: "NEW" as const,
        feelSafe: true,
        category: "Cyberbullying",
      },
      {
        ...SAMPLE_REPORTS[0],
        id: "r3",
        status: "REVIEWING" as const,
        feelSafe: false,
        category: "Hurtful Words & Teasing",
      },
      {
        ...SAMPLE_REPORTS[0],
        id: "r4",
        status: "ADDRESSED" as const,
        feelSafe: true,
        category: "Something Else",
      },
    ];

    const summary = calculateSummary(reports);
    expect(summary.newReports).toBe(2);
    expect(summary.reviewingReports).toBe(1);
    expect(summary.addressedReports).toBe(1);
    expect(summary.flaggedReports).toBe(2);

    const cyber = summary.concernCategories.find(
      (c) => c.category === "Cyberbullying",
    );
    expect(cyber?.count).toBe(2);
  });
});

describe("Safe space form schemas", () => {
  it("validates add note schema", () => {
    expect(addNoteSchema.safeParse({ body: "Spoke with student." }).success).toBe(
      true,
    );
    expect(addNoteSchema.safeParse({ body: "   " }).success).toBe(false);
    expect(addNoteSchema.safeParse({ body: "" }).success).toBe(false);
  });

  it("validates change teacher schema", () => {
    expect(
      changeTeacherSchema.safeParse({ teacherId: "teacher-123" }).success,
    ).toBe(true);
    expect(changeTeacherSchema.safeParse({ teacherId: "" }).success).toBe(false);
  });

  it("validates change status schema", () => {
    expect(changeStatusSchema.safeParse({ status: "NEW" }).success).toBe(true);
    expect(changeStatusSchema.safeParse({ status: "REVIEWING" }).success).toBe(
      true,
    );
    expect(changeStatusSchema.safeParse({ status: "ADDRESSED" }).success).toBe(
      true,
    );
    expect(changeStatusSchema.safeParse({ status: "INVALID" }).success).toBe(
      false,
    );
  });
});

describe("Safe space summary component rendering", () => {
  it("renders summary cards with labels, counts, and categories", () => {
    const summary = calculateSummary(SAMPLE_REPORTS);
    const markup = renderToStaticMarkup(
      <SafeSpaceSummarySection summary={summary} />,
    );

    expect(markup).toContain("New Reports");
    expect(markup).toContain("Reviewing Reports");
    expect(markup).toContain("Reports Addressed");
    expect(markup).toContain("Flagged Report");
    expect(markup).toContain("Concern Categories");

    for (const cat of CONCERN_CATEGORIES) {
      expect(markup).toContain(cat.replace("&", "&amp;"));
    }
  });
});

describe("Role authorization for safe space", () => {
  it("allows admin access to /admin/safe-space", () => {
    expect(
      dashboardRedirect({
        role: "ADMIN",
        pathname: "/admin/safe-space",
      }),
    ).toBeNull();

    expect(
      dashboardRedirect({
        role: "ADMIN",
        pathname: "/admin/safe-space/ssr-1046",
      }),
    ).toBeNull();
  });

  it("redirects teacher accessing /admin/safe-space to /teacher", () => {
    expect(
      dashboardRedirect({
        role: "TEACHER",
        pathname: "/admin/safe-space",
      }),
    ).toBe("/teacher");

    expect(
      dashboardRedirect({
        role: "TEACHER",
        pathname: "/admin/safe-space/ssr-1046",
      }),
    ).toBe("/teacher");
  });

  it("redirects unauthorized or unauthenticated user to /sign-in", () => {
    expect(
      dashboardRedirect({
        role: null,
        pathname: "/admin/safe-space",
      }),
    ).toBe("/sign-in");
  });
});
