import { api, callApi } from "@/lib/api/client";
import type { Envelope } from "@/lib/api/envelope";
import {
  normalizeChapterQuiz,
  normalizeTeacherStories,
  toSaveQuizPayload,
  type ChapterQuiz,
  type QuizFormValues,
  type TeacherStory,
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
  PUT: (path: string, init?: { body?: unknown }) => Callish<never>;
  POST: (path: string, init?: { body?: unknown }) => Callish<never>;
};

function asCall<T>(value: Callish<never>) {
  return value as unknown as Callish<T>;
}

function client() {
  return api as unknown as LooseClient;
}

export const FALLBACK_PUBLISHED_STORIES: TeacherStory[] = [
  {
    id: "story-courage",
    title: "The Courage to Speak Up",
    ageGroup: "Age 6–9",
    chapters: [
      { id: "chap-courage-1", title: "A New Day at Maple Elementary", order: 1 },
      { id: "chap-courage-2", title: "Recess Whispers", order: 2 },
      { id: "chap-courage-3", title: "Finding Your Voice", order: 3 },
    ],
  },
  {
    id: "story-kindness",
    title: "Wings Over Willow Creek",
    ageGroup: "Age 10–13",
    chapters: [
      { id: "chap-kindness-1", title: "The Empty Cafeteria Table", order: 1 },
      { id: "chap-kindness-2", title: "An Unexpected Team", order: 2 },
      { id: "chap-kindness-3", title: "The Game-Winning Pass", order: 3 },
    ],
  },
];

export async function getTeacherStories(): Promise<TeacherStory[]> {
  try {
    const raw = await callApi<unknown>(() =>
      asCall(client().GET("/teacher/stories")),
    );
    const stories = normalizeTeacherStories(raw);
    if (stories.length > 0) return stories;
    return FALLBACK_PUBLISHED_STORIES;
  } catch {
    // If backend endpoint is not yet deployed, fallback gracefully
    return FALLBACK_PUBLISHED_STORIES;
  }
}

export async function getChapterQuiz(chapterId: string): Promise<ChapterQuiz> {
  const raw = await callApi<unknown>(() =>
    asCall(client().GET(`/teacher/chapters/${chapterId}/quiz`)),
  );
  return normalizeChapterQuiz(raw);
}

export async function saveChapterQuiz(
  chapterId: string,
  values: QuizFormValues,
): Promise<{ quizId?: string }> {
  const body = toSaveQuizPayload(values);
  const raw = await callApi<
    { quizId?: string } | { data?: { quizId?: string } }
  >(() => asCall(client().PUT(`/teacher/chapters/${chapterId}/quiz`, { body })));

  const rawObj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const dataObj = (rawObj.data && typeof rawObj.data === "object"
    ? rawObj.data
    : rawObj) as Record<string, unknown>;
  return {
    quizId: typeof dataObj.quizId === "string" ? dataObj.quizId : undefined,
  };
}

