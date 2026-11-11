import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherProfileView } from "@/features/teacher/profile/teacher-profile-view";

export default function TeacherProfilePage() {
  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherProfileView />
    </Suspense>
  );
}
