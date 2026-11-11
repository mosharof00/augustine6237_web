import { Suspense } from "react";
import { SafeSpaceDetail } from "@/features/admin/safe-space/safe-space-detail";

export default async function AdminSafeSpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <SafeSpaceDetail id={id} />
    </Suspense>
  );
}
