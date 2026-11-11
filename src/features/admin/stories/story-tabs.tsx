import Link from "next/link";
import { cn } from "cn";

export function StoryTabs({
  current = "library",
  storyCount,
}: {
  current?: "library" | "kindness";
  storyCount?: number;
}) {
  return (
    <nav aria-label="Stories" className="flex gap-6 border-b">
      <Link
        href="/admin/stories"
        aria-current={current === "library" ? "page" : undefined}
        className={cn(
          "-mb-px flex items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium",
          current === "library"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <span>Storie Library</span>
        {storyCount !== undefined ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {storyCount}
          </span>
        ) : null}
      </Link>

      <span
        aria-disabled="true"
        title="Kindness Corner (Coming soon in Task 021)"
        className="-mb-px flex cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-1 pb-2 text-sm text-muted-foreground/60"
      >
        Kindness Corner
      </span>
    </nav>
  );
}
