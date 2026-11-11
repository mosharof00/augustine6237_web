export type DashboardRole = "admin" | "teacher";

export type NavIcon =
  | "dashboard"
  | "users"
  | "classes"
  | "stories"
  | "badges"
  | "game"
  | "reports"
  | "analytics"
  | "settings"
  | "students"
  | "profile";

export type NavItem = {
  label: string;
  title: string;
  href?: string;
  icon: NavIcon;
  disabled?: boolean;
};

export const adminNav: NavItem[] = [
  {
    label: "dashboard",
    title: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "User Management",
    title: "User Management",
    href: "/admin/users/staff",
    icon: "users",
  },
  {
    label: "Classes",
    title: "Classes",
    href: "/admin/classes",
    icon: "classes",
  },
  {
    label: "Storie",
    title: "Storie",
    href: "/admin/stories",
    icon: "stories",
  },
  {
    label: "Badges & Points",
    title: "Badges & Points",
    href: "/admin/points",
    icon: "badges",
  },
  {
    label: "Game Show Activity",
    title: "Game Show Activity",
    href: "/admin/game-show",
    icon: "game",
  },
  {
    label: "Safe Space Reports",
    title: "Safe Space Reports",
    href: "/admin/safe-space",
    icon: "reports",
  },
  {
    label: "Analytics",
    title: "Analytics",
    icon: "analytics",
    disabled: true,
  },
  {
    label: "Settings",
    title: "Settings",
    icon: "settings",
    disabled: true,
  },
];

export const teacherNav: NavItem[] = [
  {
    label: "dashboard",
    title: "Dashboard",
    href: "/teacher",
    icon: "dashboard",
  },
  {
    label: "Classes",
    title: "Classes",
    href: "/teacher/classes",
    icon: "classes",
  },
  {
    label: "Students",
    title: "Students",
    href: "/teacher/students",
    icon: "students",
  },
  {
    label: "Safe Space Reports",
    title: "Safe Space Reports",
    href: "/teacher/safe-space",
    icon: "reports",
  },
  {
    label: "Points & Badges",
    title: "Points & Badges",
    href: "/teacher/points",
    icon: "badges",
  },
  {
    label: "Stories & Questions",
    title: "Stories & Questions",
    href: "/teacher/game-packs",
    icon: "stories",
  },
  {
    label: "Profile",
    title: "Profile",
    href: "/teacher/profile",
    icon: "profile",
  },
  {
    label: "Settings",
    title: "Settings",
    href: "/teacher/settings",
    icon: "settings",
  },
];

export function navForRole(role: DashboardRole): NavItem[] {
  return role === "teacher" ? teacherNav : adminNav;
}

export function roleFromLocation(pathname: string): DashboardRole {
  if (pathname === "/teacher" || pathname.startsWith("/teacher/")) {
    return "teacher";
  }
  return "admin";
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/teacher") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function pageTitle(role: DashboardRole, pathname: string): string {
  const active = navForRole(role).find(
    (item) => item.href !== undefined && isNavActive(pathname, item.href),
  );
  return active?.title ?? "Dashboard";
}

export function studentsListPath(role: DashboardRole): string {
  return role === "admin" ? "/admin/users/students" : "/teacher/students";
}

export function studentsSearchPath(role: DashboardRole, query: string): string {
  const params = new URLSearchParams();
  params.set("q", query);
  return `${studentsListPath(role)}?${params.toString()}`;
}
