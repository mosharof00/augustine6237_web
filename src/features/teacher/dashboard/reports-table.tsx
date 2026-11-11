import { ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import type { RecentReport } from "./model";

export function ReportsTable({ reports }: { reports: RecentReport[] }) {
  return (
    <article className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Reports and approvals</h3>
        <Link
          href="/teacher/safe-space"
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          See All
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="py-6">
          <EmptyState
            title="No reports"
            description="Safe Space reports from your students will appear here."
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-medium text-muted-foreground">
                <th className="pb-3 pr-4 font-normal">Reference</th>
                <th className="pb-3 pr-4 font-normal">Student</th>
                <th className="pb-3 pr-4 font-normal">Class</th>
                <th className="pb-3 pr-4 font-normal">Submitted</th>
                <th className="pb-3 pr-4 font-normal">Status</th>
                <th className="pb-3 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/30">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {report.reference}
                  </td>
                  <td className="py-3 pr-4 text-foreground">{report.student}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {report.class || "—"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {report.submitted}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge variant={report.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href="/teacher/safe-space"
                      className="inline-flex size-7 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`View report ${report.reference}`}
                    >
                      <Eye className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
