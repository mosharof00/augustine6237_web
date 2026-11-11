import { describe, expect, it } from "vitest";
import { dashboardRedirect } from "./redirect";

describe("dashboardRedirect", () => {
  it("sends an anonymous session to sign-in", () => {
    expect(dashboardRedirect({ role: null, pathname: "/admin" })).toBe(
      "/sign-in",
    );
  });

  it("sends a teacher who opens admin to the teacher home", () => {
    expect(
      dashboardRedirect({ role: "TEACHER", pathname: "/admin/users/staff" }),
    ).toBe("/teacher");
  });

  it("sends an admin who opens teacher to the admin home", () => {
    expect(
      dashboardRedirect({ role: "ADMIN", pathname: "/teacher/settings" }),
    ).toBe("/admin");
  });

  it("sends any other role to sign-in and leaves a matching role in place", () => {
    expect(dashboardRedirect({ role: "STUDENT", pathname: "/admin" })).toBe(
      "/sign-in",
    );
    expect(dashboardRedirect({ role: "ADMIN", pathname: "/admin" })).toBeNull();
  });
});
