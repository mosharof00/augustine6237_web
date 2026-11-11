export type DashboardDestination = "/sign-in" | "/admin" | "/teacher";

export function dashboardRedirect(input: {
  role: string | null;
  pathname: string;
}): DashboardDestination | null {
  if (input.role !== "ADMIN" && input.role !== "TEACHER") {
    return "/sign-in";
  }
  const teacherPath =
    input.pathname === "/teacher" || input.pathname.startsWith("/teacher/");
  const adminPath =
    input.pathname === "/admin" || input.pathname.startsWith("/admin/");
  if (input.role === "ADMIN" && teacherPath) return "/admin";
  if (input.role === "TEACHER" && adminPath) return "/teacher";
  return null;
}
