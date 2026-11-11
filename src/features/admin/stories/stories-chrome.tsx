import { Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { STORIES_SUBTITLE } from "./model";
import { StoryTabs } from "./story-tabs";

export function StoriesChrome({
  storyCount,
  children,
}: {
  storyCount?: number;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Stories</h2>
          <p className="text-sm text-muted-foreground">{STORIES_SUBTITLE}</p>
        </div>
        <Button render={<Link href="/admin/stories/new" />}>
          <Plus className="size-4" />
          Create Storie
        </Button>
      </div>
      <StoryTabs current="library" storyCount={storyCount} />
      {children}
    </div>
  );
}
