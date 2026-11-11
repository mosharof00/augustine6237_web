import { Suspense } from "react";
import { DashboardGuard } from "@/lib/auth/guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <DashboardGuard>{children}</DashboardGuard>
    </Suspense>
  );
}
