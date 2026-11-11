import { api, apiBaseUrl, callApi } from "@/lib/api/client";
import { ApiError, type Envelope } from "@/lib/api/envelope";
import { readAccessToken } from "@/lib/auth/storage";
import type {
  StoryDetail,
  StoryList,
  StoryListQuery,
  StoryListItem,
  StoryChapter,
} from "./model";

type Callish<T> = Promise<{
  data?: Envelope<T>;
  error?: Envelope<T>;
  response: Response;
}>;

type LooseClient = {
  GET: (
    path: string,
    init?: { params?: { query?: Record<string, string | number | undefined> } },
  ) => Callish<never>;
  POST: (path: string, init?: { body?: unknown }) => Callish<never>;
  PATCH: (path: string, init?: { body?: unknown }) => Callish<never>;
  PUT: (path: string, init?: { body?: unknown }) => Callish<never>;
  DELETE: (path: string, init?: { body?: unknown }) => Callish<never>;
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

export function getStories(query: StoryListQuery) {
  return callApi<StoryList>(() =>
    asCall(
      client().GET("/admin/stories", {
        params: {
          query: {
            page: query.page,
            perPage: query.perPage,
            q: query.q,
            search: query.q,
            status: query.status,
            ageGroup: query.ageGroup,
          },
        },
      }),
    ),
  );
}

export function getStory(id: string) {
  return callApi<StoryDetail>(() =>
    asCall(client().GET(`/admin/stories/${id}`)),
  );
}

export function createStory(body: {
  title: string;
  category: string;
  ageGroup: string;
  synopsis?: string;
  coverUrl?: string;
  estimatedMinutes?: number;
  author?: string;
}) {
  return callApi<StoryListItem>(() =>
    asCall(client().POST("/admin/stories", { body })),
  );
}

export function updateStory(
  id: string,
  body: {
    title?: string;
    category?: string;
    ageGroup?: string;
    status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
    synopsis?: string;
    coverUrl?: string;
    estimatedMinutes?: number;
    author?: string;
  },
) {
  return callApi<StoryListItem>(() =>
    asCall(client().PATCH(`/admin/stories/${id}`, { body })),
  );
}

export function deleteStory(id: string) {
  return callApi<{ success: boolean; message?: string }>(() =>
    asCall(client().DELETE(`/admin/stories/${id}`)),
  );
}

export function addChapter(
  storyId: string,
  body: { title: string; number?: number },
) {
  return callApi<StoryChapter>(() =>
    asCall(client().POST(`/admin/stories/${storyId}/chapters`, { body })),
  );
}

export function replacePages(
  chapterId: string,
  pages: { number: number; bodyText?: string; imageUrl?: string }[],
) {
  return callApi<{ success: boolean }>(() =>
    asCall(client().PUT(`/admin/chapters/${chapterId}/pages`, { body: { pages } })),
  );
}

export function putAudio(
  chapterId: string,
  body: { audioUrl: string; durationMs?: number },
) {
  return callApi<{ success: boolean }>(() =>
    asCall(client().PUT(`/admin/chapters/${chapterId}/audio`, { body })),
  );
}

export type UploadPurpose =
  | "STORY_COVER"
  | "PAGE_IMAGE"
  | "CHAPTER_AUDIO"
  | "BADGE_ART"
  | "HERO_ART"
  | "KINDNESS_MEDIA";

export type UploadResult = {
  url: string;
  key: string;
  mime: string;
  size: number;
};

export async function uploadFile(
  file: File,
  purpose: UploadPurpose,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);

  const token = readAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}/uploads`, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      json?.message ??
      json?.error ??
      `Upload failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }
  return (json?.data ?? json) as UploadResult;
}
