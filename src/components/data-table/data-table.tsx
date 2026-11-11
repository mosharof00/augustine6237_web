"use client";

import {
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  nextPage,
  pageLabel,
  previousPage,
  showingLabel,
} from "./pagination";
import { scheduleSearch } from "./search";

export const dataTableFeatures = tableFeatures({});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  empty?: React.ReactNode;
  rowAction?: (row: TData) => React.ReactNode;
  getRowId?: (row: TData, index: number) => string;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  filters,
  page,
  perPage,
  total,
  lastPage,
  onPageChange,
  isLoading = false,
  empty,
  rowAction,
  getRowId,
}: DataTableProps<TData>) {
  const [draft, setDraft] = useState(search);
  const [seenSearch, setSeenSearch] = useState(search);
  if (search !== seenSearch) {
    setSeenSearch(search);
    setDraft(search);
  }

  useEffect(() => {
    if (draft === search) return;
    return scheduleSearch(onSearchChange, draft);
  }, [draft, onSearchChange, search]);

  const tableColumns = useMemo(() => {
    if (!rowAction) return columns;
    const actionColumn: ColumnDef<DataTableFeatures, TData> = {
      id: "row-action",
      header: "Action",
      cell: ({ row }) => rowAction(row.original),
    };
    return [...columns, actionColumn];
  }, [columns, rowAction]);

  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data,
    getRowId,
  });

  const columnCount = Math.max(table.getAllLeafColumns().length, 1);
  const previous = previousPage(page);
  const next = nextPage(page, lastPage);

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 rounded-full bg-background pl-9"
          />
        </div>
        {filters ? <div className="ml-auto flex items-center gap-2">{filters}</div> : null}
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead key={header.id} className="text-muted-foreground">
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: Math.min(Math.max(perPage, 1), 12) }, (_, index) => (
              <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                <TableCell colSpan={columnCount}>
                  <div className="h-4 animate-pulse rounded bg-muted" />
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="py-10 text-center text-muted-foreground"
              >
                {empty ?? "Nothing to show."}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <footer className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-muted-foreground">
        <p>{showingLabel(page, perPage, total)}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Previous page"
            disabled={previous === null}
            onClick={() => {
              if (previous !== null) onPageChange(previous);
            }}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-12 text-center text-foreground">
            {pageLabel(page, lastPage)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Next page"
            disabled={next === null}
            onClick={() => {
              if (next !== null) onPageChange(next);
            }}
          >
            <ChevronRight />
          </Button>
        </div>
      </footer>
    </section>
  );
}
