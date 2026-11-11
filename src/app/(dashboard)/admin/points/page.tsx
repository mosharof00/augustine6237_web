import { Suspense } from "react";
import { PointsView } from "@/features/admin/points/points-view";

export default function AdminPointsPage() {
  return (
    <Suspense>
      <PointsView />
    </Suspense>
  );
}
