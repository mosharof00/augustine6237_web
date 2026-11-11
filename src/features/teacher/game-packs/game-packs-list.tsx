"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, Plus, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "cn";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { DialogActions } from "@/components/feedback/dialog-actions";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTeacherGamePack, getTeacherGamePacks } from "./api";
import { type GamePackRow } from "./model";

export function GamePacksList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [ageFilter, setAgeFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [packToDelete, setPackToDelete] = useState<GamePackRow | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["teacher-game-packs", page, search, statusFilter, ageFilter],
    queryFn: () =>
      getTeacherGamePacks({
        page,
        perPage: 10,
        q: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        ageGroup: ageFilter !== "ALL" ? ageFilter : undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTeacherGamePack(id),
    onSuccess: () => {
      toast.success("Game pack deleted", {
        description: `Successfully removed ${packToDelete?.title ?? "game pack"}.`,
      });
      setPackToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["teacher-game-packs"] });
    },
    onError: (err: unknown) => {
      toast.error("Failed to delete pack", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    },
  });

  const columns = useMemo<ColumnDef<DataTableFeatures, GamePackRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Pack Title",
        cell: ({ row }) => (
          <div className="flex flex-col py-1">
            <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
              <Link href={`/teacher/game-packs/${row.original.id}`}>
                {row.original.title}
              </Link>
            </span>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.storiesSummary}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "ageGroupLabel",
        header: "Age Group",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal text-xs">
            {row.original.ageGroupLabel}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            variant={row.original.status === "PUBLISHED" ? "published" : "draft"}
          />
        ),
      },
      {
        accessorKey: "questionCount",
        header: "Questions",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.questionCount} Questions (4 rounds)
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/teacher/game-packs/${row.original.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 gap-1 rounded-lg text-xs",
              )}
            >
              <Edit3 className="size-3.5" />
              <span>Edit</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPackToDelete(row.original)}
              className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg text-xs"
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return <LoadingState count={4} />;
  }

  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Failed to load game packs"}
        onRetry={() => refetch()}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Stories &amp; Questions
          </h1>
          <p className="text-sm text-muted-foreground">
            Build and manage interactive four-round question packs for classroom game shows.
          </p>
        </div>
        <Link
          href="/teacher/game-packs/new"
          className="inline-flex items-center justify-center bg-[#e05638] hover:bg-[#c94529] text-white rounded-xl shadow-sm gap-2 h-10 px-4 py-2 text-sm font-medium"
        >
          <Plus className="size-4" />
          <span>Create Game Pack</span>
        </Link>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
        <DataTable
          columns={columns}
          data={items}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search packs by title..."
          filters={
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring"
                aria-label="Filter by status"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>

              <select
                value={ageFilter}
                onChange={(e) => {
                  setAgeFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring"
                aria-label="Filter by age group"
              >
                <option value="ALL">All Ages</option>
                <option value="AGE_6_9">Age 6–9</option>
                <option value="AGE_10_13">Age 10–13</option>
                <option value="ADULTS">Adults</option>
              </select>
            </div>
          }
          page={page}
          perPage={data?.perPage ?? 10}
          total={data?.total ?? items.length}
          lastPage={data?.lastPage ?? 1}
          onPageChange={setPage}
          empty={
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Sparkles className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No game question packs found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                Create a four-round game pack covering warmup knowledge, story challenges, hobby trivia, and team finals.
              </p>
              <Link
                href="/teacher/game-packs/new"
                className="inline-flex items-center justify-center bg-[#e05638] hover:bg-[#c94529] text-white rounded-xl h-9 px-3 text-sm font-medium"
              >
                Create Your First Pack
              </Link>
            </div>
          }
        />
      </div>

      <Dialog
        open={packToDelete !== null}
        onOpenChange={(open) => !open && setPackToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Game Pack</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{packToDelete?.title}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogActions
            onCancel={() => setPackToDelete(null)}
            cancelLabel="Cancel"
            actionLabel="Delete"
            pending={deleteMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
