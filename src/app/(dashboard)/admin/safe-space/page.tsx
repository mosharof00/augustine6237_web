import { Suspense } from "react";
import { SafeSpaceList } from "@/features/admin/safe-space/safe-space-list";

export default function AdminSafeSpacePage() {
  return (
    <Suspense>
      <SafeSpaceList />
    </Suspense>
  );
}
