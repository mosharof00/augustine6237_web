import { describe, expect, it } from "vitest";
import {
  formatClassCode,
  formatClassName,
  formatRequestDate,
  normalizeClassDetail,
  normalizeClassRow,
  normalizeClassStudent,
  normalizeJoinRequest,
  pendingBannerText,
} from "./model";

describe("teacher classes model", () => {
  it("formats class name with grade label correctly", () => {
    expect(formatClassName("Maple", "Grade 3")).toBe("Grade 3 · Maple");
    expect(formatClassName("Grade 4 · Amber", "Grade 4")).toBe("Grade 4 · Amber");
    expect(formatClassName("Oak", null)).toBe("Oak");
    expect(formatClassName("", null)).toBe("Class");
  });

  it("formats class codes", () => {
    expect(formatClassCode("MPL-3R1")).toBe("MPL-3R1");
    expect(formatClassCode(null)).toBe("—");
    expect(formatClassCode("")).toBe("—");
  });

  it("formats pending banner texts", () => {
    expect(pendingBannerText(1)).toBe("1 student is waiting for approval");
    expect(pendingBannerText(4)).toBe("4 students are waiting for approval");
  });

  it("formats request date string", () => {
    expect(formatRequestDate()).toBe("Recently");
    const formatted = formatRequestDate("2026-10-20T09:41:00Z");
    expect(formatted).toContain("Oct");
  });

  it("normalizes class row from backend envelope shape", () => {
    const raw = {
      id: "cls-1",
      name: "Maple",
      gradeLabel: "Grade 3",
      ageGroup: "6-9",
      activeCode: { code: "MPL-3R1" },
      membershipCounts: { approved: 24, pending: 2, rejected: 1 },
    };

    const row = normalizeClassRow(raw);
    expect(row.id).toBe("cls-1");
    expect(row.name).toBe("Maple");
    expect(row.gradeLabel).toBe("Grade 3");
    expect(row.code).toBe("MPL-3R1");
    expect(row.studentCount).toBe(24);
    expect(row.pendingCount).toBe(2);
    expect(row.progressPercent).toBeGreaterThan(0);
  });

  it("normalizes class detail with default stories and students", () => {
    const raw = {
      id: "cls-1",
      name: "Maple",
      gradeLabel: "Grade 3",
      ageGroup: "6-9",
      code: "MPL-3R1",
      studentCount: 24,
      pendingCount: 1,
      students: [
        {
          id: "st-1",
          username: "jonahl41",
          realName: "Jonah Levy",
          studentCode: "84658",
          points: 88,
          progressPercent: 68,
          gameShowEligible: false,
        },
      ],
    };

    const detail = normalizeClassDetail(raw);
    expect(detail.id).toBe("cls-1");
    expect(detail.avgQuizScore).toBe(89);
    expect(detail.readingProgressPercent).toBe(92);
    expect(detail.stories.length).toBe(3);
    expect(detail.students.length).toBe(1);
    expect(detail.students[0]?.name).toBe("Jonah Levy");
    expect(detail.students[0]?.points).toBe(88);
  });

  it("normalizes class student item", () => {
    const item = normalizeClassStudent({
      id: "st-2",
      username: "ethank38",
      nickname: "Ethan Kowalski",
      points: 140,
    });
    expect(item.id).toBe("st-2");
    expect(item.name).toBe("Ethan Kowalski");
    expect(item.points).toBe(140);
    expect(item.gameShowEligible).toBe(true);
  });

  it("normalizes join request", () => {
    const raw = {
      id: "req-1",
      status: "PENDING",
      createdAt: "2026-10-20T09:41:00Z",
      student: {
        id: "usr-1",
        username: "mina42",
        realName: "Mina Kapoor",
        status: "PENDING",
      },
    };
    const req = normalizeJoinRequest(raw);
    expect(req.id).toBe("req-1");
    expect(req.student.realName).toBe("Mina Kapoor");
    expect(req.student.username).toBe("mina42");
    expect(req.status).toBe("PENDING");
  });
});
