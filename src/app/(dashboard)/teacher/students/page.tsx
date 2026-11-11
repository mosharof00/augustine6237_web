import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherStudentsList } from "@/features/teacher/students/student-list";

export default function TeacherStudentsPage() {
  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherStudentsList />
    </Suspense>
  );
}
