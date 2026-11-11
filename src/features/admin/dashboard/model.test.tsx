import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ErrorState } from "@/components/feedback/states";
import { ApiError } from "@/lib/api/envelope";
import { AdminDashboardView, dashboardErrorMessage } from "./admin-dashboard";
import {
  activityTime,
  attentionLine,
  donutSegments,
  greeting,
  reviewHrefs,
  weekBars,
  type AdminDashboard,
} from "./model";

const dashboard: AdminDashboard = {
  greetingName: "Sarah",
  attentionCount: 7,
  totalStudents: 248,
  totalTeachers: 18,
  totalClasses: 12,
  pendingStudents: 4,
  week: [
    { day: "Fri", readingHours: 9, listeningHours: 3 },
    { day: "Mon", readingHours: 6, listeningHours: 2 },
  ],
  storyCompletionPercent: 75,
  quizCompletionPercent: 84,
  stories: { published: 18, drafts: 5, archived: 18 },
  attention: {
    classRequests: 3,
    studentApprovals: 6,
    safeSpaceNew: 2,
    safeSpaceFollowUp: 1,
  },
  topStudents: [
    { name: "Sofia Alvarez", grade: "Grade 4", points: 500, kindness: 100 },
  ],
  students: { total: 486 },
  activity: [
    {
      actor: "Register",
      sentence: "enrolled a new student.",
      at: "20 minutes ago",
    },
  ],
};

describe("admin dashboard model", () => {
  it("greets by time of day", () => {
    expect(greeting("Sarah", 9)).toBe("Good morning, Sarah.");
    expect(greeting("Sarah", 15)).toBe("Good afternoon, Sarah.");
    expect(greeting("Sarah", 20)).toBe("Good evening, Sarah.");
  });

  it("uses the attention count from the API", () => {
    expect(attentionLine(7)).toBe("7 items need your attention today.");
    expect(attentionLine(1)).toBe("1 item needs your attention today.");
  });

  it("keeps the learning chart on Monday through Friday", () => {
    expect(weekBars(dashboard.week).map((point) => point.day)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ]);
    expect(weekBars(dashboard.week)[0]?.readingHours).toBe(6);
    expect(weekBars(dashboard.week)[4]?.listeningHours).toBe(3);
    expect(weekBars(dashboard.week)[2]?.readingHours).toBe(0);
  });

  it("omits donut labels when the payload has no segments", () => {
    expect(donutSegments({ total: 486 })).toEqual([]);
    expect(donutSegments({ total: 486, segments: [] })).toEqual([]);
  });

  it("shows the segment labels the API returns", () => {
    expect(
      donutSegments({
        total: 486,
        segments: [{ label: "Active", percent: 80 }],
      }),
    ).toEqual([{ label: "Active", percent: 80 }]);
  });

  it("keeps a display time that is not a timestamp", () => {
    expect(activityTime("20 minutes ago", 0)).toBe("20 minutes ago");
  });

  it("points the review actions at the admin queues", () => {
    expect(reviewHrefs.classRequests).toBe("/admin/classes/requests");
    expect(reviewHrefs.studentApprovals).toBe("/admin/users/pending");
    expect(reviewHrefs.safeSpace).toBe("/admin/safe-space");
    expect(reviewHrefs.stories).toBe("/admin/stories");
  });
});

describe("admin dashboard view", () => {
  it("shows the KPI cards and does not invent Boys or Girls", () => {
    const html = renderToStaticMarkup(
      <AdminDashboardView data={dashboard} greetingText="Good morning, Sarah." />,
    );
    expect(html).toContain("Total Students");
    expect(html).toContain("Total Teachers");
    expect(html).toContain("Total Classes");
    expect(html).toContain("Pending Student");
    expect(html).toContain("248");
    expect(html).toContain("04");
    expect(html).toContain("Review class requests");
    expect(html).not.toContain("Boys");
    expect(html).not.toContain("Girls");
  });

  it("shows the error state for a 500 dashboard response", () => {
    const message = dashboardErrorMessage(
      new ApiError(500, "Dashboard unavailable"),
    );
    const html = renderToStaticMarkup(
      <ErrorState message={message} onRetry={() => undefined} />,
    );
    expect(html).toContain("Dashboard unavailable");
    expect(html).toContain("Try again");
  });
});
