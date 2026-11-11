import { Suspense } from "react";
import { StoryEditor } from "@/features/admin/stories/story-editor";

export default function NewStoryPage() {
  return (
    <Suspense>
      <StoryEditor mode="create" />
    </Suspense>
  );
}
