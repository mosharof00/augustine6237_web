import { Suspense } from "react";
import { ProfileView } from "@/features/profile/profile-view";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        </div>
      }
    >
      <ProfileView userId={id} />
    </Suspense>
  );
}

