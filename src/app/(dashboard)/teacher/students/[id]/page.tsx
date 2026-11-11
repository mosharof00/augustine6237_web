import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherStudentDetailView } from "@/features/teacher/students/student-detail";

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherStudentDetailView id={id} />
    </Suspense>
  );
}
