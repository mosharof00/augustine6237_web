import { Suspense } from "react";
import { StoryEditor } from "@/features/admin/stories/story-editor";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <StoryEditor mode="edit" id={id} />
    </Suspense>
  );
}
