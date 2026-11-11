import { describe, expect, it } from "vitest";
import {
  adminNav,
  pageTitle,
  roleFromLocation,
  studentsSearchPath,
  teacherNav,
} from "./nav";

describe("dashboard nav", () => {
  it("keeps the admin screenshot spelling and disables Analytics and Settings", () => {
    expect(adminNav.map((item) => item.label)).toContain("Storie");
    const disabled = adminNav.filter((item) => item.disabled);
    expect(disabled.map((item) => item.label)).toEqual([
      "Analytics",
      "Settings",
    ]);
    expect(disabled.every((item) => item.href === undefined)).toBe(true);
  });

  it("enables teacher Stories & Questions and keeps Profile and Settings", () => {
    const stories = teacherNav.find(
      (item) => item.label === "Stories & Questions",
    );
    expect(stories?.disabled).toBeUndefined();
    expect(stories?.href).toBe("/teacher/game-packs");
    expect(
      teacherNav.find((item) => item.label === "Profile")?.href,
    ).toBe("/teacher/profile");
    expect(
      teacherNav.find((item) => item.label === "Settings")?.href,
    ).toBe("/teacher/settings");
  });

  it("chooses the rail from the path", () => {
    expect(roleFromLocation("/admin")).toBe("admin");
    expect(roleFromLocation("/teacher")).toBe("teacher");
    expect(roleFromLocation("/teacher/classes")).toBe("teacher");
  });

  it("sends search to that role’s student list", () => {
    expect(studentsSearchPath("admin", "maya")).toBe(
      "/admin/users/students?q=maya",
    );
    expect(studentsSearchPath("teacher", "")).toBe("/teacher/students?q=");
    expect(pageTitle("admin", "/admin")).toBe("Dashboard");
  });
});
