import { Suspense } from "react";
import { AcceptInviteForm } from "@/features/auth/accept-invite-form";

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
