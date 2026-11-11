import { Suspense } from "react";
import { GameMatchDetailView } from "@/features/admin/game-show/game-match-detail";

export default async function AdminGameMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <GameMatchDetailView id={id} />
    </Suspense>
  );
}
