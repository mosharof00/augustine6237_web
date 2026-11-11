import Link from "next/link";
import { cn } from "cn";

const tabs = [
  { id: "staff", href: "/admin/users/staff", label: "Staff" },
  { id: "students", href: "/admin/users/students", label: "Students" },
  { id: "pending", href: "/admin/users/pending", label: "Pending Approvals" },
] as const;

export type UserManagementTab = (typeof tabs)[number]["id"];

export function UserManagementTabs({ current }: { current: UserManagementTab }) {
  return (
    <nav aria-label="User management" className="flex gap-6 border-b">
      {tabs.map((tab) => {
        const active = tab.id === current;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-1 pb-2 text-sm",
              active
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
