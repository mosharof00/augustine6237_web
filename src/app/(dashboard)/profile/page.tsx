import { Suspense } from "react";
import { ProfileView } from "@/features/profile/profile-view";

export default function CurrentUserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        </div>
      }
    >
      <ProfileView />
    </Suspense>
  );
}

