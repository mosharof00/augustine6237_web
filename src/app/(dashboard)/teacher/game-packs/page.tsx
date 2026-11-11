import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { GamePacksList } from "@/features/teacher/game-packs/game-packs-list";

export default function TeacherGamePacksPage() {
  return (
    <Suspense fallback={<LoadingState count={4} />}>
      <GamePacksList />
    </Suspense>
  );
}
