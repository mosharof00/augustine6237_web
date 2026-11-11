import { describe, expect, it } from "vitest";
import { acceptInviteBody, schoolBody, signUpBody } from "./payloads";
import {
  markPendingSchool,
  readPendingEmail,
  readPendingSchool,
  clearPendingSchool,
} from "./pending-school";
import { staffHome, userHasSchool, userHome } from "./routing";
import { signInSchema, signUpSchema } from "./schemas";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("staffHome", () => {
  it("sends a teacher to the teacher home", () => {
    expect(
      staffHome({ role: "TEACHER", hasSchool: false, pendingSchool: true }),
    ).toBe("/teacher");
  });

  it("skips school setup when me already includes a school", () => {
    expect(
      staffHome({ role: "ADMIN", hasSchool: true, pendingSchool: true }),
    ).toBe("/admin");
  });

  it("sends a newly registered admin through school onboarding once", () => {
    expect(
      staffHome({ role: "ADMIN", hasSchool: false, pendingSchool: true }),
    ).toBe("/onboarding/school");
  });

  it("opens the admin home when school setup is not pending", () => {
    expect(
      staffHome({ role: "ADMIN", hasSchool: false, pendingSchool: false }),
    ).toBe("/admin");
  });
});

describe("userHome", () => {
  it("routes ADMIN to /admin and regular users to /", () => {
    expect(userHome("ADMIN")).toBe("/admin");
    expect(userHome("CLIENT")).toBe("/");
    expect(userHome(undefined)).toBe("/");
  });
});

describe("userHasSchool", () => {
  it("is false when me has no school field", () => {
    expect(userHasSchool({ role: "ADMIN" })).toBe(false);
  });

  it("is true when me includes a school", () => {
    expect(userHasSchool({ school: { id: "school-1" } })).toBe(true);
  });
});

describe("auth payloads", () => {
  it("omits the confirm password from registration", () => {
    expect(
      signUpBody({
        name: "Ada Admin",
        email: "ada@school.org",
        password: "correct-horse",
      }),
    ).toEqual({
      name: "Ada Admin",
      email: "ada@school.org",
      password: "correct-horse",
    });
  });

  it("posts the invite token, name, and password", () => {
    expect(
      acceptInviteBody({
        token: "invite-token",
        name: "Jordan Lee",
        password: "correct-horse",
      }),
    ).toEqual({
      token: "invite-token",
      name: "Jordan Lee",
      password: "correct-horse",
    });
  });

  it("posts the school name as name", () => {
    expect(schoolBody("North Primary")).toEqual({ name: "North Primary" });
  });
});

describe("auth schemas", () => {
  it("requires every sign-up field", () => {
    const result = signUpSchema.safeParse({
      name: "",
      email: "",
      password: "",
      confirm: "",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages).toContain("Full name is required");
    expect(messages).toContain("Email is required");
    expect(messages).toContain("Password is required");
    expect(messages).toContain("Confirm password is required");
  });

  it("keeps remember-me out of the sign-in field list used by the API", () => {
    const parsed = signInSchema.parse({
      email: "ada@school.org",
      password: "secret",
      remember: true,
    });
    expect(parsed.remember).toBe(true);
    expect(parsed).not.toHaveProperty("token");
  });
});

describe("pending school", () => {
  it("remembers a new admin until the school profile is saved", () => {
    const storage = memory();
    markPendingSchool("ada@school.org", storage);
    expect(readPendingSchool(storage)).toBe(true);
    expect(readPendingEmail(storage)).toBe("ada@school.org");
    clearPendingSchool(storage);
    expect(readPendingSchool(storage)).toBe(false);
  });
});
