import { describe, expect, it } from "vitest";
import {
  normalizeTeacherProfile,
  updateProfileSchema,
} from "./model";

describe("Teacher Profile Model", () => {
  it("normalizes empty or null payload to sensible defaults", () => {
    const profile = normalizeTeacherProfile(null);
    expect(profile.id).toBe("teacher-1");
    expect(profile.realName).toBe("Teacher");
    expect(profile.email).toBe("teacher@school.edu");
    expect(profile.status).toBe("Active");
    expect(profile.classCount).toBe(8);
    expect(profile.studentCount).toBe(240);
    expect(profile.phone).toBe("+1 (555) 123-4567");
    expect(profile.title).toBe("Senior Mathematics Teacher");
    expect(profile.department).toBe("Mathematics");
    expect(profile.qualification).toBe("M.Sc. in Mathematics");
    expect(profile.experience).toBe("8 years");
    expect(profile.gender).toBe("Female");
  });

  it("normalizes backend teacher payload accurately", () => {
    const payload = {
      id: "usr-42",
      realName: "Sarah Mitchell",
      email: "sarah@school.org",
      status: "ACTIVE",
      avatarUrl: "https://example.com/sarah.png",
      role: "TEACHER",
      classCount: 3,
      studentCount: 88,
    };

    const profile = normalizeTeacherProfile(payload);
    expect(profile.id).toBe("usr-42");
    expect(profile.realName).toBe("Sarah Mitchell");
    expect(profile.email).toBe("sarah@school.org");
    expect(profile.status).toBe("ACTIVE");
    expect(profile.avatarUrl).toBe("https://example.com/sarah.png");
    expect(profile.classCount).toBe(3);
    expect(profile.studentCount).toBe(88);
  });

  it("merges cached local extra fields over default values", () => {
    const payload = {
      id: "usr-10",
      realName: "John Doe",
      email: "john@school.org",
    };

    const cachedExtra = {
      phone: "+1 800 555 0199",
      title: "Science Instructor",
      department: "Physics",
      experience: "12 years",
    };

    const profile = normalizeTeacherProfile(payload, cachedExtra);
    expect(profile.realName).toBe("John Doe");
    expect(profile.phone).toBe("+1 800 555 0199");
    expect(profile.title).toBe("Science Instructor");
    expect(profile.department).toBe("Physics");
    expect(profile.experience).toBe("12 years");
  });

  it("validates updateProfileSchema correctly", () => {
    const valid = {
      realName: "Sarah Mitchell",
      email: "sarah.mitchell@school.edu",
      phone: "+1 (555) 123-4567",
      title: "Senior Mathematics Teacher",
    };

    const parseResult = updateProfileSchema.safeParse(valid);
    expect(parseResult.success).toBe(true);
  });

  it("rejects invalid input in updateProfileSchema", () => {
    const invalidName = {
      realName: "   ",
      email: "sarah@school.edu",
    };
    const res1 = updateProfileSchema.safeParse(invalidName);
    expect(res1.success).toBe(false);

    const invalidEmail = {
      realName: "Sarah Mitchell",
      email: "not-an-email",
    };
    const res2 = updateProfileSchema.safeParse(invalidEmail);
    expect(res2.success).toBe(false);
  });
});
