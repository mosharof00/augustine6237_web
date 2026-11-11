import { describe, expect, it } from "vitest";
import {
  normalizeStudentDetail,
  normalizeStudentItem,
  studentStatusVariant,
} from "./model";

describe("teacher students model", () => {
  it("normalizes student item with fallback name and class", () => {
    const raw = {
      id: "usr-1",
      username: "jonahl41",
      realName: "Jonah Levy",
      avatarUrl: "https://example.com/avatar.png",
      status: "ACTIVE",
      class: { id: "cls-1", name: "Grade 4 · Amber" },
    };

    const item = normalizeStudentItem(raw, 0);
    expect(item.id).toBe("usr-1");
    expect(item.name).toBe("Jonah Levy");
    expect(item.username).toBe("jonahl41");
    expect(item.className).toBe("Grade 4 · Amber");
    expect(item.status).toBe("ACTIVE");
    expect(item.points).toBeGreaterThan(0);
    expect(item.progressPercent).toBeGreaterThan(0);
    expect(item.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("handles nickname and missing real name", () => {
    const raw = {
      id: "usr-2",
      username: "maya35",
      nickname: "Maya",
      status: "PENDING",
    };
    const item = normalizeStudentItem(raw, 1);
    expect(item.name).toBe("Maya");
    expect(item.status).toBe("PENDING");
  });

  it("returns correct status variants", () => {
    expect(studentStatusVariant("ACTIVE")).toBe("active");
    expect(studentStatusVariant("PENDING")).toBe("pending");
    expect(studentStatusVariant("INACTIVE")).toBe("inactive");
    expect(studentStatusVariant("unknown")).toBe("inactive");
  });

  it("normalizes student detail with progress, badges, and points history", () => {
    const raw = {
      user: {
        id: "usr-1",
        username: "jonahl41",
        realName: "Jonah Levy",
        role: "STUDENT",
        status: "ACTIVE",
      },
      membership: {
        id: "mem-1",
        classId: "cls-1",
        className: "Grade 4 · Amber",
        status: "APPROVED",
      },
      points: [
        {
          id: "pt-1",
          reason: "Kindness in playground",
          category: "Teacher award",
          points: 10,
          createdAt: "Today",
        },
      ],
      badges: [
        {
          id: "bg-1",
          name: "Kindness Champion",
          description: "Helpful student",
          earned: true,
          earnedDate: "Oct 10, 2026",
        },
      ],
      progress: [
        {
          id: "pr-1",
          story: "Why the River Sings",
          chaptersCompleted: 3,
          chaptersTotal: 4,
          progressPercent: 75,
          quizScore: "88%",
          status: "IN_PROGRESS",
        },
      ],
    };

    const detail = normalizeStudentDetail(raw);
    expect(detail.id).toBe("usr-1");
    expect(detail.name).toBe("Jonah Levy");
    expect(detail.className).toBe("Grade 4 · Amber");
    expect(detail.status).toBe("ACTIVE");
    expect(detail.badgeCount).toBe(1);
    expect(detail.progress.length).toBe(1);
    expect(detail.progress[0]?.story).toBe("Why the River Sings");
    expect(detail.pointsHistory.length).toBe(1);
    expect(detail.pointsHistory[0]?.amount).toBe(10);
  });
});
