import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { SafeSpaceList } from "@/features/teacher/safe-space/safe-space-list";

export default function TeacherSafeSpacePage() {
  return (
    <Suspense fallback={<LoadingState count={4} />}>
      <SafeSpaceList />
    </Suspense>
  );
}
