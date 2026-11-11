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

  it("sends non-staff away from school dashboards and leaves staff in place", () => {
    expect(dashboardRedirect({ role: "CLIENT", pathname: "/admin" })).toBe("/");
    expect(dashboardRedirect({ role: "ADMIN", pathname: "/admin" })).toBeNull();
  });

  it("allows any signed-in role onto profile routes", () => {
    expect(dashboardRedirect({ role: "CLIENT", pathname: "/profile" })).toBeNull();
    expect(
      dashboardRedirect({ role: "CLIENT", pathname: "/profile/abc" }),
    ).toBeNull();
    expect(dashboardRedirect({ role: null, pathname: "/profile" })).toBe(
      "/sign-in",
    );
  });
});
