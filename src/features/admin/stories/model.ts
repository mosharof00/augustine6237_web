import { z } from "zod";
import type { Page } from "@/lib/api/envelope";
import type { StatusBadgeVariant } from "@/components/feedback/status-badge";

export const STORIES_PER_PAGE = 15;
export const STORIES_SUBTITLE = "Create, publish and manage reading and audio contents.";

export const AGE_GROUPS = [
  { value: "6-9", label: "6–9", apiValue: "AGE_6_9" },
  { value: "10-13", label: "10–13", apiValue: "AGE_10_13" },
  { value: "adults", label: "Adults", apiValue: "ADULTS" },
] as const;

export const STORY_CATEGORIES = [
  { value: "KINDNESS", label: "Kindness" },
  { value: "BULLYING", label: "Bullying Prevention" },
  { value: "EMPATHY", label: "Empathy" },
  { value: "FRIENDSHIP", label: "Friendship" },
  { value: "RESPECT", label: "Respect" },
  { value: "COURAGE", label: "Courage" },
] as const;

export const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
] as const;

export type PublishStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export type StoryListItem = {
  id: string;
  title: string;
  coverUrl?: string | null;
  author?: string | null;
  chapterCount: number;
  ageGroup: string;
  status: PublishStatus;
  updatedAt: string;
  category?: string;
  synopsis?: string | null;
  estimatedMinutes?: number | null;
};

export type StoryList = Page<StoryListItem>;

export type StoryChapterPage = {
  id?: string;
  number: number;
  bodyText?: string | null;
  imageUrl?: string | null;
};

export type ChapterAudio = {
  id?: string;
  audioUrl: string;
  durationMs?: number | null;
};

export type StoryChapter = {
  id: string;
  number: number;
  title: string;
  pageCount: number;
  pages: StoryChapterPage[];
  audio?: ChapterAudio | null;
};

export type StoryDetail = StoryListItem & {
  chapters: StoryChapter[];
};

export const createStorySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().optional(),
  category: z.string().min(1, "Select a category"),
  ageGroup: z.enum(["6-9", "10-13", "adults"], {
    error: "Select an age group",
  }),
  estimatedMinutes: z.coerce.number().int().min(1).optional().nullable(),
  synopsis: z.string().trim().optional(),
  coverUrl: z.string().optional().nullable(),
});

export type CreateStoryValues = z.infer<typeof createStorySchema>;

export const createChapterSchema = z.object({
  title: z.string().trim().min(1, "Chapter title is required"),
  number: z.coerce.number().int().min(1).optional(),
});

export type CreateChapterValues = z.infer<typeof createChapterSchema>;

export function toApiAgeGroup(value: string): string {
  if (value === "6-9" || value === "AGE_6_9") return "AGE_6_9";
  if (value === "10-13" || value === "AGE_10_13") return "AGE_10_13";
  if (value === "adults" || value === "ADULTS") return "ADULTS";
  return value;
}

export function formatAgeGroup(value?: string | null): string {
  if (!value) return "—";
  if (value === "AGE_6_9" || value === "6-9") return "6–9";
  if (value === "AGE_10_13" || value === "10-13") return "10–13";
  if (value === "ADULTS" || value === "adults") return "Adults";
  return value;
}

export function formatChapterCount(count?: number | null): string {
  const num = count ?? 0;
  return num < 10 ? `0${num}` : String(num);
}

export function formatStoryUpdated(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function storyStatusVariant(status: PublishStatus): StatusBadgeVariant {
  if (status === "PUBLISHED") return "published";
  return "draft";
}

export type StoryListQuery = {
  page: number;
  perPage?: number;
  q?: string;
  ageGroup?: string;
  status?: string;
};

export function storyListQuery(input: {
  page: number;
  q?: string;
  ageGroup?: string;
  status?: string;
}): StoryListQuery {
  return {
    page: input.page,
    perPage: STORIES_PER_PAGE,
    q: input.q || undefined,
    ageGroup: input.ageGroup || undefined,
    status: input.status || undefined,
  };
}

export function buildCreateStoryPayload(values: CreateStoryValues) {
  return {
    title: values.title.trim(),
    synopsis: values.synopsis?.trim() || undefined,
    coverUrl: values.coverUrl || undefined,
    category: values.category,
    ageGroup: toApiAgeGroup(values.ageGroup),
    estimatedMinutes: values.estimatedMinutes ?? undefined,
    author: values.author?.trim() || undefined,
  };
}
