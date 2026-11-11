import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ErrorState } from "@/components/feedback/states";
import { ApiError } from "@/lib/api/envelope";
import {
  attentionLine,
  formatCount,
  greeting,
  normalizeDashboard,
  normalizeWeek,
  type TeacherClass,
  type TeacherDashboard,
} from "./model";
import {
  dashboardErrorMessage,
  TeacherDashboardView,
} from "./teacher-dashboard";

const mockDashboard: TeacherDashboard = {
  safeSpaceReports: {
    new: 2,
    reviewing: 2,
    total: 4,
  },
  pendingStudents: 4,
  eligibleStudents: 4,
  flaggedResponses: {
    count: 0,
    caption: "Criteria not configured",
  },
  leaderboard: [
    {
      userId: "u1",
      nickname: "Mili",
      avatarUrl: null,
      kindnessPoints: 3486,
      rank: 1,
    },
    {
      userId: "u2",
      nickname: "Faith",
      avatarUrl: null,
      kindnessPoints: 3249,
      rank: 2,
    },
    {
      userId: "u3",
      nickname: "Frank",
      avatarUrl: null,
      kindnessPoints: 2950,
      rank: 3,
    },
  ],
  week: [
    { day: "Mon", date: "2026-11-02", reports: 1, points: 20, quizAverage: 70 },
    { day: "Tue", date: "2026-11-03", reports: 0, points: 25, quizAverage: 75 },
    { day: "Wed", date: "2026-11-04", reports: 2, points: 15, quizAverage: 40 },
    { day: "Thu", date: "2026-11-05", reports: 1, points: 30, quizAverage: 85 },
    { day: "Fri", date: "2026-11-06", reports: 0, points: 20, quizAverage: 65 },
  ],
  classProgress: {
    total: 3,
    segments: [
      { name: "Year 5 · Maple", share: 40 },
      { name: "Year 3 · Oak", share: 35 },
      { name: "Year 4 · Willow", share: 25 },
    ],
  },
  recentReports: [
    {
      id: "r1",
      reference: "SSR-1046",
      student: "Oscar Lindqvist",
      class: "Grade 4 · Amber",
      submitted: "Oct 17, 10:48 AM",
      status: "addressed",
    },
    {
      id: "r2",
      reference: "SSR-1045",
      student: "Oscar Lindqvist",
      class: "Grade 4 · Cedar",
      submitted: "Oct 22, 7:15 AM",
      status: "new",
    },
    {
      id: "r3",
      reference: "SSR-1044",
      student: "Jonah Levy",
      class: "Grade 3 · Maple",
      submitted: "Oct 21, 5:02 PM",
      status: "reviewing",
    },
  ],
  recentAwards: [
    {
      id: "a1",
      student: "Sofia Alvarez",
      category: "Kindness",
      points: 3,
      time: "Oct 21, 10:05 AM",
    },
    {
      id: "a2",
      student: "Isla Thompson",
      category: "Effort",
      points: 5,
      time: "Oct 21, 10:05 AM",
    },
    {
      id: "a3",
      student: "Alvarez Okafor",
      category: "Badge",
      points: "Quiz Whiz",
      time: "Yesterday",
    },
  ],
};

const mockClasses: TeacherClass[] = [
  { id: "c1", name: "Year 3 · Oak" },
  { id: "c2", name: "Year 5 · Maple" },
];

describe("teacher dashboard model", () => {
  it("greets according to the time of day", () => {
    expect(greeting("Sarah", 9)).toBe("Good morning, Sarah.");
    expect(greeting("Sarah", 14)).toBe("Good afternoon, Sarah.");
    expect(greeting("Sarah", 20)).toBe("Good evening, Sarah.");
    expect(greeting("", 9)).toBe("Good morning, there.");
  });

  it("formats the attention line correctly", () => {
    expect(attentionLine(7)).toBe("7 items need your attention today.");
    expect(attentionLine(1)).toBe("1 item needs your attention today.");
    expect(attentionLine(0)).toBe("No items need your attention today.");
  });

  it("pads single digit counts with leading zero", () => {
    expect(formatCount(4)).toBe("04");
    expect(formatCount(0)).toBe("00");
    expect(formatCount(12)).toBe("12");
  });

  it("guarantees Monday to Friday order in week array", () => {
    const raw = [
      { day: "Fri", points: 20 },
      { day: "Mon", points: 10 },
    ];
    const normalized = normalizeWeek(raw);
    expect(normalized.map((p) => p.day)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ]);
    expect(normalized[0]?.points).toBe(10);
    expect(normalized[4]?.points).toBe(20);
    expect(normalized[1]?.points).toBe(0);
  });

  it("normalizes backend dashboard response safely", () => {
    const backendData = {
      safeSpaceReports: { new: 3, reviewing: 1, total: 4 },
      pendingJoinRequests: 2,
      gameEligibleStudents: 5,
      leaderboard: [
        { userId: "u1", nickname: "Mili", kindnessPoints: 100, rank: 1 },
      ],
      week: [{ day: "Mon", reports: 2, points: 15 }],
    };

    const res = normalizeDashboard(backendData);
    expect(res.safeSpaceReports.total).toBe(4);
    expect(res.pendingStudents).toBe(2);
    expect(res.eligibleStudents).toBe(5);
    expect(res.flaggedResponses.count).toBe(0);
    expect(res.flaggedResponses.caption).toBe("Criteria not configured");
    expect(res.leaderboard[0]?.nickname).toBe("Mili");
    expect(res.week[0]?.day).toBe("Mon");
    expect(res.recentReports).toEqual([]);
    expect(res.recentAwards).toEqual([]);
  });
});

describe("teacher dashboard view", () => {
  it("renders metric cards with correct counts, links, and captions", () => {
    const html = renderToStaticMarkup(
      <TeacherDashboardView
        data={mockDashboard}
        classes={mockClasses}
        teacherName="Sarah"
      />,
    );

    expect(html).toContain("Safe Reports");
    expect(html).toContain("04");
    expect(html).toContain('href="/teacher/safe-space"');

    expect(html).toContain("Flagged Responses");
    expect(html).toContain("00");
    expect(html).toContain("Criteria not configured");

    expect(html).toContain("Pending Student");
    expect(html).toContain('href="/teacher/classes"');

    expect(html).toContain("Game Eligible Students");
    expect(html).toContain("04");

    // Quick action link to award points
    expect(html).toContain('href="/teacher/points"');
    expect(html).toContain("Award points");
  });

  it("renders leaderboard with student avatar and nickname per decision 5", () => {
    const html = renderToStaticMarkup(
      <TeacherDashboardView
        data={mockDashboard}
        classes={mockClasses}
        teacherName="Sarah"
      />,
    );

    expect(html).toContain("Leaderboard");
    expect(html).toContain("Mili");
    expect(html).toContain("Faith");
    expect(html).toContain("Frank");
    expect(html).toContain("3,486");
    expect(html).toContain("3,249");
    expect(html).toContain("2,950");

    // Verify decision 5: no hero characters (e.g. Gabriel, Faith Hero character art)
    expect(html).not.toContain("hero-art");
  });

  it("renders class switcher when multiple classes exist", () => {
    const html = renderToStaticMarkup(
      <TeacherDashboardView
        data={mockDashboard}
        classes={mockClasses}
        teacherName="Sarah"
        selectedClassId="c1"
      />,
    );

    expect(html).toContain("<select");
    expect(html).toContain("Year 3 · Oak");
    expect(html).toContain("Year 5 · Maple");
  });

  it("renders static badge when teacher has single class", () => {
    const html = renderToStaticMarkup(
      <TeacherDashboardView
        data={mockDashboard}
        classes={[{ id: "c1", name: "Year 3 · Oak" }]}
        teacherName="Sarah"
      />,
    );

    expect(html).not.toContain("<select");
    expect(html).toContain("Year 3 · Oak");
  });

  it("renders reports and approvals table", () => {
    const html = renderToStaticMarkup(
      <TeacherDashboardView
        data={mockDashboard}
        classes={mockClasses}
        teacherName="Sarah"
      />,
    );

    expect(html).toContain("Reports and approvals");
    expect(html).toContain("SSR-1046");
    expect(html).toContain("Oscar Lindqvist");
    expect(html).toContain("Grade 4 · Amber");
    expect(html).toContain("Addressed");
    expect(html).toContain("New");
    expect(html).toContain("Reviewing");
    expect(html).toContain("See All");
  });

  it("renders empty states gracefully when arrays are empty", () => {
    const emptyDashboard: TeacherDashboard = {
      safeSpaceReports: { new: 0, reviewing: 0, total: 0 },
      pendingStudents: 0,
      eligibleStudents: 0,
      flaggedResponses: { count: 0, caption: "Criteria not configured" },
      leaderboard: [],
      week: normalizeWeek([]),
      classProgress: { total: 0, segments: [] },
      recentReports: [],
      recentAwards: [],
    };

    const html = renderToStaticMarkup(
      <TeacherDashboardView
        data={emptyDashboard}
        classes={[]}
        teacherName="Sarah"
      />,
    );

    expect(html).toContain("No leaderboard data");
    expect(html).toContain("No reports");
    expect(html).toContain("No recent awards");
    expect(html).toContain("No class progress");
  });

  it("renders error state when dashboard query fails", () => {
    const message = dashboardErrorMessage(
      new ApiError(500, "Teacher dashboard service unavailable"),
    );
    const html = renderToStaticMarkup(
      <ErrorState message={message} onRetry={() => undefined} />,
    );

    expect(html).toContain("Teacher dashboard service unavailable");
    expect(html).toContain("Try again");
  });
});
