"use client";

import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { pageTitle, roleFromLocation } from "./nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = roleFromLocation(pathname);
  const title = pageTitle(role, pathname);
  const session = useSession();
  const displayName = session.user?.name?.trim() || session.user?.email || "Staff";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={role}
        pathname={pathname}
        onLogout={() => {
          void session.logout();
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
        <TopBar
          title={title}
          role={role}
          displayName={displayName}
          initial={initial}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
