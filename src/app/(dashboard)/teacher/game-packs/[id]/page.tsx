import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/states";
import { GamePackWizard } from "@/features/teacher/game-packs/game-pack-wizard";

export default async function EditGamePackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingState count={4} />}>
      <GamePackWizard packId={id} />
    </Suspense>
  );
}
