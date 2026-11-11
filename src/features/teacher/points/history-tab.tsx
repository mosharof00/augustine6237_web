"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassSwitcher, type ClassSwitcherOption } from "@/features/teacher/classes/class-switcher";
import { getTeacherPointsHistory } from "./api";
import { formatAwardDate, type TeacherPointsHistoryItem } from "./model";

export interface HistoryTabProps {
  classes: ClassSwitcherOption[];
  selectedClassId?: string;
  onSelectClass: (classId: string | undefined) => void;
}

export function HistoryTab({
  classes,
  selectedClassId,
  onSelectClass,
}: HistoryTabProps) {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const historyQuery = useQuery({
    queryKey: ["teacher-points-history", selectedClassId, page],
    queryFn: () => getTeacherPointsHistory({ classId: selectedClassId, page, perPage }),
  });

  const items: TeacherPointsHistoryItem[] = historyQuery.data?.items ?? [];
  const total = historyQuery.data?.total ?? items.length;
  const totalPages =
    historyQuery.data?.lastPage ?? Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-6">
      {/* Class Switcher Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Points Log</h3>
        <ClassSwitcher
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={(newClass) => {
            onSelectClass(newClass);
            setPage(1);
          }}
        />
      </div>

      {historyQuery.isLoading ? (
        <div className="py-8">
          <LoadingState kind="table" count={5} columns={5} />
        </div>
      ) : historyQuery.isError ? (
        <div className="py-8">
          <ErrorState
            message="Unable to load points history"
            onRetry={() => historyQuery.refetch()}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card py-10">
          <EmptyState
            title="No points awarded yet"
            description="When you award positive kindness points to students, they will appear in this history log."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">
                  Student
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Category
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-foreground">
                  Points
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Reason
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-foreground">
                  When
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0">
                        {item.avatarUrl && (
                          <AvatarImage src={item.avatarUrl} alt={item.studentName} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {item.studentName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {item.studentName}
                        </p>
                        {item.className && (
                          <p className="text-[11px] text-muted-foreground">
                            {item.className}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground py-3">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      +{item.amount}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3 max-w-xs truncate">
                    {item.reason && item.reason.trim() ? item.reason : "——"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground py-3 whitespace-nowrap">
                    {formatAwardDate(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <div>
              Showing {items.length === 0 ? 0 : (page - 1) * perPage + 1}–
              {Math.min(page * perPage, total)} of {total}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="font-medium text-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
