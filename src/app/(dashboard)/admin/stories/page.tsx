import { Suspense } from "react";
import { StoriesList } from "@/features/admin/stories/stories-list";

export default function StoriesPage() {
  return (
    <Suspense>
      <StoriesList />
    </Suspense>
  );
}
