"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronRight,
  FileQuestion,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTeacherStories } from "./api";

export function TeacherChapterPicker() {
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["teacher-stories"],
    queryFn: () => getTeacherStories(),
    retry: false,
  });

  const stories = useMemo(() => query.data ?? [], [query.data]);

  const filteredStories = useMemo(() => {
    if (!search.trim()) return stories;
    const term = search.toLowerCase().trim();
    return stories
      .map((story) => {
        const storyMatches = story.title.toLowerCase().includes(term);
        const matchedChapters = story.chapters.filter((ch) =>
          ch.title.toLowerCase().includes(term),
        );
        if (storyMatches) return story;
        if (matchedChapters.length > 0) {
          return {
            ...story,
            chapters: matchedChapters,
          };
        }
        return null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [stories, search]);

  if (query.isPending) {
    return <LoadingState count={3} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Could not load stories and chapters. Please try again."
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chapter Quizzes
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a published story chapter to view or edit its comprehension quiz.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stories or chapters…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stories list */}
      {filteredStories.length === 0 ? (
        <EmptyState
          title={search ? "No matching chapters found" : "No published stories"}
          description={
            search
              ? "Try adjusting your search query to find published chapters."
              : "There are currently no published stories available to attach quizzes to."
          }
        />
      ) : (
        <div className="grid gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow"
            >
              {/* Story Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {story.title}
                    </h2>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {story.ageGroup}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {story.chapters.length}{" "}
                        {story.chapters.length === 1 ? "chapter" : "chapters"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapters List */}
              <div className="mt-4 divide-y divide-border/50">
                {story.chapters.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No chapters in this story yet.
                  </p>
                ) : (
                  story.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/30 px-2 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                          {chapter.order}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {chapter.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Chapter {chapter.order}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        render={
                          <Link
                            href={`/teacher/chapters/${chapter.id}/quiz?storyTitle=${encodeURIComponent(
                              story.title,
                            )}&chapterTitle=${encodeURIComponent(chapter.title)}`}
                          />
                        }
                      >
                        <FileQuestion className="size-3.5 text-primary" />
                        <span>Edit Quiz</span>
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
