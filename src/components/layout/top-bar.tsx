import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { studentsListPath, type DashboardRole } from "./nav";

export function TopBar({
  title,
  role,
  displayName,
  initial,
}: {
  title: string;
  role: DashboardRole;
  displayName: string;
  initial: string;
}) {
  return (
    <header className="flex items-center gap-4 rounded-2xl bg-card px-5 py-3">
      <h1 className="text-lg font-semibold text-primary">{title}</h1>
      <form
        action={studentsListPath(role)}
        method="get"
        role="search"
        className="ml-auto"
      >
        <div className="relative w-72">
          <button
            type="submit"
            aria-label="Search"
            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
          <Input
            name="q"
            type="search"
            placeholder="Search students…"
            aria-label="Search students"
            className="h-10 rounded-full bg-background pl-9"
          />
        </div>
      </form>
      <button
        type="button"
        aria-label="Notifications"
        className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground"
      >
        <Bell className="size-5" aria-hidden="true" />
        <span className="absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-medium text-primary-foreground">
          3
        </span>
      </button>
      <div className="flex items-center gap-2">
        <Avatar className="size-9 after:border-0">
          <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">
          {displayName}
        </span>
      </div>
    </header>
  );
}
