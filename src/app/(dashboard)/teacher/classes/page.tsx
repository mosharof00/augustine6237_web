import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherClassesList } from "@/features/teacher/classes/class-list";

export default function TeacherClassesPage() {
  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherClassesList />
    </Suspense>
  );
}
