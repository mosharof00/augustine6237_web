import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { TeacherQuizEditor } from "@/features/teacher/quizzes/quiz-editor";

export default async function TeacherChapterQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ storyTitle?: string; chapterTitle?: string }>;
}) {
  const { chapterId } = await params;
  const { storyTitle, chapterTitle } = await searchParams;

  return (
    <Suspense fallback={<LoadingState count={3} />}>
      <TeacherQuizEditor
        chapterId={chapterId}
        storyTitle={storyTitle}
        chapterTitle={chapterTitle}
      />
    </Suspense>
  );
}

