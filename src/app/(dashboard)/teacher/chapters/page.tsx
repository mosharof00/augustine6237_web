import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherChapterPicker } from "@/features/teacher/quizzes/chapter-picker";

export default function TeacherChaptersPage() {
  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherChapterPicker />
    </Suspense>
  );
}

