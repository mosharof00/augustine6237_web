import {
  Award,
  BookOpen,
  ChartLine,
  FileText,
  LayoutGrid,
  Library,
  Settings,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NavIcon } from "./nav";

const navIcons: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutGrid,
  users: Users,
  classes: BookOpen,
  stories: Library,
  badges: Award,
  game: Trophy,
  reports: FileText,
  analytics: ChartLine,
  settings: Settings,
  students: Users,
  profile: User,
};

export function NavIconGlyph({ name }: { name: NavIcon }) {
  const Icon = navIcons[name];
  return <Icon className="size-4 shrink-0" aria-hidden="true" />;
}
