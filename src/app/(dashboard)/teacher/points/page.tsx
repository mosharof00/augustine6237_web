import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { PointsBadgesView } from "@/features/teacher/points/points-badges-view";

export default function TeacherPointsPage() {
  return (
    <Suspense fallback={<LoadingState count={4} />}>
      <PointsBadgesView />
    </Suspense>
  );
}
