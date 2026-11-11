import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavIconGlyph } from "./nav-icons";
import { isNavActive, navForRole, type DashboardRole } from "./nav";

export function Sidebar({
  role,
  pathname,
  onLogout,
}: {
  role: DashboardRole;
  pathname: string;
  onLogout: () => void;
}) {
  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 pt-6 pb-4">
        <p className="text-sm leading-tight font-semibold text-white">
          Wings of <span className="text-primary">Power</span>
        </p>
        <p className="mt-1 text-[11px] leading-snug text-white/70">
          Faith & Gabriel Against Bullying
        </p>
      </div>
      <Separator className="bg-white/15" />
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navForRole(role).map((item) => {
          const painted =
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground";
          if (item.disabled || item.href === undefined) {
            return (
              <span key={item.label} aria-disabled="true" className={painted}>
                <NavIconGlyph name={item.icon} />
                {item.label}
              </span>
            );
          }
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-accent-foreground"
                  : `${painted} hover:bg-white/10`
              }
            >
              <NavIconGlyph name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <Button
          type="button"
          variant="outline"
          onClick={onLogout}
          className="h-10 w-full border-destructive bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </aside>
  );
}
