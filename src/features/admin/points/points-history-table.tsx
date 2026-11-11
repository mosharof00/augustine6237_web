"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import type {
  ClassOption,
  PointHistoryItem,
  PointHistoryList,
} from "./model";

type PointsHistoryTableProps = {
  data: PointHistoryList;
  search: string;
  onSearchChange: (search: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  classId: string;
  onClassIdChange: (classId: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  classOptions?: ClassOption[];
};

const columns: ColumnDef<DataTableFeatures, PointHistoryItem>[] = [
  {
    accessorKey: "studentName",
    header: "Student",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.studentName}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.category}
      </span>
    ),
  },
  {
    accessorKey: "points",
    header: "Points",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-[#E7F7ED] px-3 py-0.5 text-xs font-semibold text-[#1D8A4E]">
        +{row.original.points}
      </span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.reason || "——"}
      </span>
    ),
  },
  {
    accessorKey: "awardedBy",
    header: "Awarded By",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.awardedBy || "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.createdAt}
      </span>
    ),
  },
];

export function PointsHistoryTable({
  data,
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  classId,
  onClassIdChange,
  page,
  onPageChange,
  isLoading = false,
  classOptions = [],
}: PointsHistoryTableProps) {
  return (
    <section
      aria-label="Points History"
      className="rounded-2xl border border-border bg-card p-6 shadow-xs"
    >
      <div className="mb-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Points History
        </h2>
        <p className="text-xs text-muted-foreground">
          Classroom gameshow history
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by class or play mode"
        page={page}
        perPage={data.perPage}
        total={data.total}
        lastPage={data.lastPage}
        onPageChange={onPageChange}
        isLoading={isLoading}
        filters={
          <div className="flex items-center gap-2">
            <select
              aria-label="Date Range"
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="h-10 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Date Range</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>

            <select
              aria-label="All classes"
              value={classId}
              onChange={(e) => onClassIdChange(e.target.value)}
              className="h-10 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All classes</option>
              {classOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </section>
  );
}
