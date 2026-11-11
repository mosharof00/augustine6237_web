import { Suspense, use } from "react";
import { InviteView } from "@/features/bets/invite-view";

function InviteContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <InviteView code={code} />;
}

export default function InviteBetPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#0B1222] text-slate-100">
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          </div>
        }
      >
        <InviteContent params={params} />
      </Suspense>
    </div>
  );
}
