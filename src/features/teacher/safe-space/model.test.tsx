import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { dashboardRedirect } from "@/lib/auth/redirect";
import {
  formatFeelSafe,
  formatReportDate,
  normalizeSafeSpaceReport,
  reportStatusLabel,
  reportStatusVariant,
  SAMPLE_TEACHER_REPORTS,
  STATUS_TABS,
} from "./model";
import { SafeSpaceList } from "./safe-space-list";
import {
  SafeSpacePreviewContent,
  SafeSpacePreviewModal,
} from "./safe-space-preview-modal";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Teacher Safe Space status mappings", () => {
  it("maps report status to correct badge variant", () => {
    expect(reportStatusVariant("NEW")).toBe("new");
    expect(reportStatusVariant("REVIEWING")).toBe("reviewing");
    expect(reportStatusVariant("ADDRESSED")).toBe("addressed");
    expect(reportStatusVariant("unknown")).toBe("pending");
  });

  it("maps report status to human display labels", () => {
    expect(reportStatusLabel("NEW")).toBe("New");
    expect(reportStatusLabel("REVIEWING")).toBe("Reviewing");
    expect(reportStatusLabel("ADDRESSED")).toBe("Addressed");
    expect(reportStatusLabel("custom")).toBe("custom");
  });
});

describe("Teacher Safe Space date formatting", () => {
  it("preserves formatted date strings", () => {
    expect(formatReportDate("Oct 17, 10:48 AM")).toBe("Oct 17, 10:48 AM");
    expect(formatReportDate("Oct 22, 7:15 AM")).toBe("Oct 22, 7:15 AM");
  });

  it("formats ISO timestamps into human readable strings", () => {
    const formatted = formatReportDate("2026-10-17T10:48:00Z");
    expect(formatted).toContain("Oct");
    expect(formatted).toContain("17");
  });

  it("gracefully returns input for empty or invalid dates", () => {
    expect(formatReportDate("")).toBe("");
    expect(formatReportDate("invalid-date")).toBe("invalid-date");
  });
});

describe("Teacher Safe Space feel-safe formatting", () => {
  it("formats feelSafe = true correctly", () => {
    const result = formatFeelSafe(true);
    expect(result.label).toBe("Feels safe at school");
    expect(result.shortLabel).toBe("Feels safe");
    expect(result.variant).toBe("safe");
  });

  it("formats feelSafe = false correctly", () => {
    const result = formatFeelSafe(false);
    expect(result.label).toBe("Does not feel safe");
    expect(result.shortLabel).toBe("Needs check-in");
    expect(result.variant).toBe("concern");
  });
});

describe("Teacher Safe Space normalization", () => {
  it("normalizes complete report payload with snake_case and nested objects", () => {
    const raw = {
      id: "rep-1",
      public_ref: "SSR-1046",
      student_id: "st-1",
      student_name: "Oscar Lindqvist",
      student_nickname: "oscar_l",
      class_id: "cls-1",
      class_name: "Grade 4 · Amber",
      category: "Hurtful Words & Teasing",
      body: "Pushed near lockers.",
      feel_safe: true,
      status: "NEW",
      submitted_at: "Oct 17, 10:48 AM",
      created_at: "2026-10-17T10:48:00Z",
      updated_at: "2026-10-17T10:48:00Z",
    };

    const normalized = normalizeSafeSpaceReport(raw);
    expect(normalized.id).toBe("rep-1");
    expect(normalized.publicRef).toBe("SSR-1046");
    expect(normalized.studentId).toBe("st-1");
    expect(normalized.studentName).toBe("Oscar Lindqvist");
    expect(normalized.studentNickname).toBe("oscar_l");
    expect(normalized.className).toBe("Grade 4 · Amber");
    expect(normalized.category).toBe("Hurtful Words & Teasing");
    expect(normalized.body).toBe("Pushed near lockers.");
    expect(normalized.feelSafe).toBe(true);
    expect(normalized.status).toBe("NEW");
    expect(normalized.submittedAt).toBe("Oct 17, 10:48 AM");
  });

  it("extracts info from nested student and class objects", () => {
    const raw = {
      id: "rep-2",
      publicRef: "SSR-1045",
      student: {
        id: "st-2",
        nickname: "ethan_k",
        realName: "Ethan Kowalski",
        avatarUrl: "https://example.com/avatar.jpg",
      },
      class: {
        id: "cls-2",
        name: "Cedar",
        gradeLabel: "Grade 4",
      },
      category: "Cyberbullying",
      feelSafe: false,
      status: "REVIEWING",
    };

    const normalized = normalizeSafeSpaceReport(raw);
    expect(normalized.studentName).toBe("Ethan Kowalski");
    expect(normalized.studentNickname).toBe("ethan_k");
    expect(normalized.avatarUrl).toBe("https://example.com/avatar.jpg");
    expect(normalized.className).toBe("Grade 4 · Cedar");
    expect(normalized.feelSafe).toBe(false);
    expect(normalized.status).toBe("REVIEWING");
  });

  it("provides sensible fallbacks for empty raw object", () => {
    const normalized = normalizeSafeSpaceReport({}, 2);
    expect(normalized.id).toBe("report-3");
    expect(normalized.publicRef).toBe("SSR-1042");
    expect(normalized.studentName).toBe("Student");
    expect(normalized.status).toBe("NEW");
    expect(normalized.feelSafe).toBe(true);
  });
});

describe("Teacher Safe Space sample dataset", () => {
  it("contains all reports from the design screens", () => {
    expect(SAMPLE_TEACHER_REPORTS.length).toBeGreaterThanOrEqual(8);

    const refs = SAMPLE_TEACHER_REPORTS.map((r) => r.publicRef);
    expect(refs).toContain("SSR-1046");
    expect(refs).toContain("SSR-1045");
    expect(refs).toContain("SSR-1044");
    expect(refs).toContain("SSR-1042");
    expect(refs).toContain("SSR-1041");

    const students = SAMPLE_TEACHER_REPORTS.map((r) => r.studentName);
    expect(students).toContain("Oscar Lindqvist");
    expect(students).toContain("Ethan Kowalski");
    expect(students).toContain("Jonah Levy");
    expect(students).toContain("Noah Bennett");
  });

  it("has status tabs matching requirements", () => {
    const values = STATUS_TABS.map((t) => t.value);
    expect(values).toEqual(["ALL", "NEW", "REVIEWING", "ADDRESSED"]);
  });
});

describe("SafeSpacePreviewModal component rendering", () => {
  it("renders report details and does not link to any detail page", () => {
    const report = SAMPLE_TEACHER_REPORTS[0]!;
    const markup = renderToStaticMarkup(
      <SafeSpacePreviewContent report={report} onClose={() => {}} />,
    );

    expect(markup).toContain("SSR-1046");
    expect(markup).toContain("Oscar Lindqvist");
    expect(markup).toContain("@oscar_l");
    expect(markup).toContain("Grade 4 · Amber");
    expect(markup).toContain("Hurtful Words &amp; Teasing");
    expect(markup).toContain("Feels safe at school");
    expect(markup).toContain("Close");

    // Confirms NO link to a detail route
    expect(markup).not.toContain('href="/teacher/safe-space/');
  });

  it("renders null when report is null in modal wrapper", () => {
    const markup = renderToStaticMarkup(
      <SafeSpacePreviewModal report={null} open={true} onOpenChange={() => {}} />,
    );
    expect(markup).toBe("");
  });
});

describe("SafeSpaceList static rendering", () => {
  it("renders privacy banner, status tabs, and reports table", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    queryClient.setQueryData(["teacher-safe-space-classes"], [
      { id: "class-amber", name: "Amber", gradeLabel: "Grade 4" },
    ]);
    queryClient.setQueryData(["teacher-safe-space-reports", "ALL", 1], {
      items: SAMPLE_TEACHER_REPORTS,
      total: SAMPLE_TEACHER_REPORTS.length,
      page: 1,
      perPage: 10,
      lastPage: 1,
    });

    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <SafeSpaceList />
      </QueryClientProvider>,
    );

    // Title and subtitle
    expect(markup).toContain("Safe Space reports");
    expect(markup).toContain(
      "Confidential reports from students. Open a report to review and follow up.",
    );

    // Privacy notice banner (exact copy from screens)
    expect(markup).toContain(
      "List rows show reference, class and status only. Report content opens on the detail page.",
    );

    // Status tabs
    expect(markup).toContain("All");
    expect(markup).toContain("New");
    expect(markup).toContain("Reviewing");
    expect(markup).toContain("Addressed");

    // Table card title
    expect(markup).toContain("Reports and approvals");

    // Table headers
    expect(markup).toContain("Reference");
    expect(markup).toContain("Student");
    expect(markup).toContain("Class");
    expect(markup).toContain("Category");
    expect(markup).toContain("Feel Safe");
    expect(markup).toContain("Submitted");
    expect(markup).toContain("Status");
    expect(markup).toContain("Action");

    // Sample data rows
    expect(markup).toContain("SSR-1046");
    expect(markup).toContain("Oscar Lindqvist");
    expect(markup).toContain("Ethan Kowalski");

    // Confirms no detail route is linked in the table
    expect(markup).not.toContain('href="/teacher/safe-space/');
  });

  it("renders empty state when report list is empty", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    queryClient.setQueryData(["teacher-safe-space-classes"], []);
    queryClient.setQueryData(["teacher-safe-space-reports", "ALL", 1], {
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
      lastPage: 1,
    });

    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <SafeSpaceList />
      </QueryClientProvider>,
    );

    expect(markup).toContain("No Safe Space reports");
    expect(markup).toContain(
      "Safe Space reports from your students will appear here.",
    );
  });
});

describe("Role authorization for Teacher Safe Space", () => {
  it("allows teacher access to /teacher/safe-space", () => {
    expect(
      dashboardRedirect({
        role: "TEACHER",
        pathname: "/teacher/safe-space",
      }),
    ).toBeNull();
  });

  it("redirects admin accessing /teacher/safe-space to /admin", () => {
    expect(
      dashboardRedirect({
        role: "ADMIN",
        pathname: "/teacher/safe-space",
      }),
    ).toBe("/admin");
  });

  it("redirects unauthenticated or non-staff users to /sign-in", () => {
    expect(
      dashboardRedirect({
        role: "STUDENT",
        pathname: "/teacher/safe-space",
      }),
    ).toBe("/sign-in");

    expect(
      dashboardRedirect({
        role: null,
        pathname: "/teacher/safe-space",
      }),
    ).toBe("/sign-in");
  });
});
