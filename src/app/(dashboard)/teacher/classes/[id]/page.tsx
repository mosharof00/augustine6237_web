import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherClassDetailView } from "@/features/teacher/classes/class-detail";

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherClassDetailView id={id} />
    </Suspense>
  );
}
