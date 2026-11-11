"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type DataTableFeatures } from "@/components/data-table/data-table";
import { ErrorState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/envelope";
import { getStories, updateStory } from "./api";
import { DeleteStoryDialog } from "./delete-story-dialog";
import {
  AGE_GROUPS,
  formatAgeGroup,
  formatChapterCount,
  formatStoryUpdated,
  STATUS_OPTIONS,
  STORIES_PER_PAGE,
  storyListQuery,
  storyStatusVariant,
  toApiAgeGroup,
  type StoryListItem,
} from "./model";
import { StoriesChrome } from "./stories-chrome";

export function StoriesList() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();

  const search = params.get("q") ?? "";
  const ageGroup = params.get("ageGroup") ?? "";
  const status = params.get("status") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const [deletingStory, setDeletingStory] = useState<StoryListItem | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-stories", page, search, ageGroup, status],
    queryFn: () =>
      getStories(
        storyListQuery({
          page,
          q: search,
          ageGroup: ageGroup ? toApiAgeGroup(ageGroup) : undefined,
          status: status || undefined,
        }),
      ),
    retry: false,
  });

  function replaceQuery(next: {
    q?: string;
    ageGroup?: string;
    status?: string;
    page?: number;
  }) {
    const value = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) value.set("q", next.q);
      else value.delete("q");
      value.delete("page");
    }
    if (next.ageGroup !== undefined) {
      if (next.ageGroup) value.set("ageGroup", next.ageGroup);
      else value.delete("ageGroup");
      value.delete("page");
    }
    if (next.status !== undefined) {
      if (next.status) value.set("status", next.status);
      else value.delete("status");
      value.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) value.set("page", String(next.page));
      else value.delete("page");
    }
    const queryString = value.toString();
    router.replace(queryString ? `/admin/stories?${queryString}` : "/admin/stories");
  }

  async function handlePublish(story: StoryListItem) {
    setPublishingId(story.id);
    try {
      await updateStory(story.id, { status: "PUBLISHED" });
      toastSuccess({
        title: "Story published",
        description: `"${story.title}" is now published.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not publish this story.",
      );
    } finally {
      setPublishingId(null);
    }
  }

  const columns: ColumnDef<DataTableFeatures, StoryListItem>[] = [
    {
      id: "cover",
      header: "Cover Image",
      cell: ({ row }) => {
        const cover = row.original.coverUrl;
        return (
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
            {cover ? (
              <Image
                src={cover}
                alt={row.original.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <BookOpen className="size-5" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Storie Title",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.title}</span>
      ),
    },
    {
      id: "author",
      header: "Author",
      cell: ({ row }) => <span>{row.original.author || "—"}</span>,
    },
    {
      id: "chapter",
      header: "Chapter",
      cell: ({ row }) => <span>{formatChapterCount(row.original.chapterCount)}</span>,
    },
    {
      id: "ageGroup",
      header: "Age Group",
      cell: ({ row }) => <span>{formatAgeGroup(row.original.ageGroup)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge variant={storyStatusVariant(row.original.status)} />
      ),
    },
    {
      id: "updated",
      header: "Updated",
      cell: ({ row }) => <span>{formatStoryUpdated(row.original.updatedAt)}</span>,
    },
  ];

  return (
    <StoriesChrome storyCount={query.data?.total}>
      {query.isError ? (
        <ErrorState
          message={
            query.error instanceof ApiError
              ? query.error.message
              : "Could not load stories."
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={query.data?.items ?? []}
          search={search}
          onSearchChange={(value) => replaceQuery({ q: value })}
          searchPlaceholder="Search stories"
          filters={
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="All Age Group"
                value={ageGroup}
                onChange={(e) => replaceQuery({ ageGroup: e.target.value })}
                className="h-10 rounded-full border bg-background px-3 text-sm"
              >
                <option value="">All Age Group</option>
                {AGE_GROUPS.map((group) => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="All Status"
                value={status}
                onChange={(e) => replaceQuery({ status: e.target.value })}
                className="h-10 rounded-full border bg-background px-3 text-sm"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          }
          page={query.data?.page ?? page}
          perPage={STORIES_PER_PAGE}
          total={query.data?.total ?? 0}
          lastPage={query.data?.lastPage ?? 1}
          onPageChange={(nextPage) => replaceQuery({ page: nextPage })}
          isLoading={query.isPending}
          getRowId={(row) => row.id}
          rowAction={(row) => {
            const isDraft = row.status === "DRAFT";
            return (
              <div className="flex items-center gap-2">
                {isDraft ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={publishingId === row.id}
                    onClick={() => void handlePublish(row)}
                  >
                    Publish
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${row.title}`}
                  render={<Link href={`/admin/stories/${row.id}`} />}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${row.title}`}
                  onClick={() => setDeletingStory(row)}
                >
                  <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            );
          }}
        />
      )}

      <DeleteStoryDialog
        story={deletingStory}
        open={Boolean(deletingStory)}
        onOpenChange={(open) => {
          if (!open) setDeletingStory(null);
        }}
        onDeleted={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
        }}
      />
    </StoriesChrome>
  );
}
