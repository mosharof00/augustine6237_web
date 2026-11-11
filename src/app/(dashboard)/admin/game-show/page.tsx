import { Suspense } from "react";
import { GameShowList } from "@/features/admin/game-show/game-show-list";

export default function AdminGameShowPage() {
  return (
    <Suspense>
      <GameShowList />
    </Suspense>
  );
}
