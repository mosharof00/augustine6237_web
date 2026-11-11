export type DashboardDestination = "/sign-in" | "/admin" | "/teacher" | "/";

export function dashboardRedirect(input: {
  role: string | null;
  pathname: string;
}): DashboardDestination | null {
  const teacherPath =
    input.pathname === "/teacher" || input.pathname.startsWith("/teacher/");
  const adminPath =
    input.pathname === "/admin" || input.pathname.startsWith("/admin/");
  const profilePath =
    input.pathname === "/profile" || input.pathname.startsWith("/profile/");

  // Profile is a BetSocial feature for any signed-in user (CLIENT / ADMIN).
  if (profilePath) {
    if (!input.role) return "/sign-in";
    return null;
  }

  // Leftover school dashboards — keep role gates, but bounce CLIENT home.
  if (!input.role) return "/sign-in";
  if (input.role !== "ADMIN" && input.role !== "TEACHER") {
    return "/";
  }
  if (input.role === "ADMIN" && teacherPath) return "/admin";
  if (input.role === "TEACHER" && adminPath) return "/teacher";
  return null;
}
