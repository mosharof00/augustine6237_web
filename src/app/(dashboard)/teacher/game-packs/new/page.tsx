import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { GamePackWizard } from "@/features/teacher/game-packs/game-pack-wizard";

export default function NewGamePackPage() {
  return (
    <Suspense fallback={<LoadingState count={4} />}>
      <GamePackWizard />
    </Suspense>
  );
}
