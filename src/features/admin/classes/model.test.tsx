import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/components/feedback/status-badge";
import { ClassTabs } from "./class-tabs";
import {
  AGE_GROUPS,
  CLASS_SUBTITLE,
  changeTeacherPayload,
  classListQuery,
  classReadyLine,
  classStatusVariant,
  createClassPayload,
  createClassSchema,
  requestBanner,
  teacherChoices,
} from "./model";

describe("class age groups", () => {
  it("offers the three decision-2 bands", () => {
    expect(AGE_GROUPS.map((group) => group.value)).toEqual(["6-9", "10-13", "adults"]);
  });
});

describe("class copy", () => {
  it("uses the classes subtitle and the creation banner", () => {
    expect(CLASS_SUBTITLE).toBe("Manage classes, join codes, and teacher assignment.");
    expect(requestBanner(3)).toBe("3 class creation requests waiting for approval");
  });

  it("keeps a renewal code on the class named by the renewal", () => {
    expect(classReadyLine("Grade 3 · Maple")).toBe("class [Grade 3 · Maple] is ready.");
  });
});

describe("class payloads", () => {
  it("searches with q and creates with the four fields", () => {
    expect(classListQuery({ page: 1, q: "maple" })).toEqual({
      page: 1,
      perPage: 15,
      q: "maple",
    });
    expect(
      createClassPayload({
        name: " Grade 4 · Amber ",
        grade: " Grade 4 ",
        ageGroup: "6-9",
        teacherId: "teacher-1",
      }),
    ).toEqual({
      name: "Grade 4 · Amber",
      grade: "Grade 4",
      ageGroup: "6-9",
      teacherId: "teacher-1",
    });
  });

  it("builds change-teacher payload", () => {
    expect(changeTeacherPayload("teacher-99")).toEqual({ teacherId: "teacher-99" });
  });

  it("validates createClassSchema correctly", () => {
    const valid = createClassSchema.safeParse({
      name: "Grade 3 · Maple",
      grade: "Grade 3",
      ageGroup: "6-9",
      teacherId: "teacher-1",
    });
    expect(valid.success).toBe(true);

    const invalidAge = createClassSchema.safeParse({
      name: "Grade 3 · Maple",
      grade: "Grade 3",
      ageGroup: "invalid-group",
      teacherId: "teacher-1",
    });
    expect(invalidAge.success).toBe(false);

    const missingName = createClassSchema.safeParse({
      name: "   ",
      grade: "Grade 3",
      ageGroup: "6-9",
      teacherId: "teacher-1",
    });
    expect(missingName.success).toBe(false);
  });

  it("maps class status to variant", () => {
    expect(classStatusVariant("ACTIVE")).toBe("active");
    expect(classStatusVariant("INACTIVE")).toBe("inactive");
  });

  it("offers active teachers only", () => {
    expect(
      teacherChoices([
        { id: "1", role: "TEACHER", status: "ACTIVE" },
        { id: "2", role: "TEACHER", status: "INVITED" },
        { id: "3", role: "ADMIN", status: "ACTIVE" },
      ]).map((member) => member.id),
    ).toEqual(["1"]);
  });
});

describe("class tabs", () => {
  it("links requests and marks an expired code", () => {
    const html = renderToStaticMarkup(
      <ClassTabs current="classes" classCount={24} requestCount={3} />,
    );
    expect(html).toContain('href="/admin/classes/requests"');
    expect(html).toContain("All Classes");
    const badge = renderToStaticMarkup(<StatusBadge variant="expired" />);
    expect(badge).toContain("Expired");
  });
});
