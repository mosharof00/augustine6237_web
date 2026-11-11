import Link from "next/link";
import { cn } from "cn";

export function ClassTabs({
  current,
  classCount,
  requestCount,
}: {
  current: "classes" | "requests";
  classCount?: number;
  requestCount?: number;
}) {
  const tabs = [
    { id: "classes" as const, href: "/admin/classes", label: "All Classes", count: classCount },
    {
      id: "requests" as const,
      href: "/admin/classes/requests",
      label: "Class Requests",
      count: requestCount,
    },
  ];
  return (
    <nav aria-label="Classes" className="flex gap-6 border-b">
      {tabs.map((tab) => {
        const active = tab.id === current;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-1 pb-2 text-sm",
              active
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className="rounded-full bg-muted px-1.5 text-xs">{tab.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
