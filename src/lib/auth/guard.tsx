"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { dashboardRedirect } from "./redirect";
import { useSession } from "./session";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const destination =
    session.status === "loading"
      ? null
      : dashboardRedirect({
          role: session.user?.role ?? session.user?.type ?? null,
          pathname,
        });

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  if (session.status === "loading" || destination) return null;

  // BetSocial profile pages should not use the leftover school dashboard chrome.
  const isProfile =
    pathname === "/profile" || pathname.startsWith("/profile/");
  if (isProfile) return <>{children}</>;

  return <DashboardShell>{children}</DashboardShell>;
}
