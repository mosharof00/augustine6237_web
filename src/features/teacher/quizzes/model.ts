import { z } from "zod";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "FREE_TEXT";

export type TeacherStoryChapter = {
  id: string;
  title: string;
  order: number;
};

export type TeacherStory = {
  id: string;
  title: string;
  ageGroup: string;
  chapters: TeacherStoryChapter[];
};

export type QuizOption = {
  id?: string;
  label: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id?: string;
  prompt: string;
  type: QuestionType;
  hint?: string;
  explanation?: string;
  options: QuizOption[];
};

export type ChapterQuiz = {
  id?: string;
  chapterId?: string;
  title?: string;
  questions: QuizQuestion[];
};

export const quizOptionSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean().default(false),
});

export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().trim().min(1, "Question prompt is required"),
  type: z.enum(["MCQ", "TRUE_FALSE", "FREE_TEXT"]).default("MCQ"),
  hint: z.string().trim().optional(),
  explanation: z.string().trim().optional(),
  options: z
    .array(quizOptionSchema)
    .min(2, "Each question must have at least 2 options")
    .refine(
      (opts) => opts.filter((o) => o.isCorrect).length === 1,
      "Exactly one option must be marked as correct",
    ),
});

export const quizFormSchema = z.object({
  title: z.string().trim().optional(),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "Add at least one question to save the quiz"),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;

export function createEmptyOption(isCorrect = false): QuizOption {
  return {
    label: "",
    isCorrect,
  };
}

export function createEmptyQuestion(): QuizQuestion {
  return {
    prompt: "",
    type: "MCQ",
    hint: "",
    options: [
      { label: "", isCorrect: true },
      { label: "", isCorrect: false },
    ],
  };
}

export function moveQuestionUp(
  questions: QuizQuestion[],
  index: number,
): QuizQuestion[] {
  if (index <= 0 || index >= questions.length) return questions;
  const next = [...questions];
  const [removed] = next.splice(index, 1);
  next.splice(index - 1, 0, removed);
  return next;
}

export function moveQuestionDown(
  questions: QuizQuestion[],
  index: number,
): QuizQuestion[] {
  if (index < 0 || index >= questions.length - 1) return questions;
  const next = [...questions];
  const [removed] = next.splice(index, 1);
  next.splice(index + 1, 0, removed);
  return next;
}

export function setOptionCorrect(
  options: QuizOption[],
  correctIndex: number,
): QuizOption[] {
  return options.map((opt, i) => ({
    ...opt,
    isCorrect: i === correctIndex,
  }));
}

export function addOptionToQuestion(question: QuizQuestion): QuizQuestion {
  return {
    ...question,
    options: [...question.options, createEmptyOption(false)],
  };
}

export function removeOptionFromQuestion(
  question: QuizQuestion,
  optionIndex: number,
): QuizQuestion {
  if (question.options.length <= 2) return question;
  const filtered = question.options.filter((_, i) => i !== optionIndex);
  const hasCorrect = filtered.some((o) => o.isCorrect);
  if (!hasCorrect && filtered.length > 0) {
    filtered[0] = { ...filtered[0], isCorrect: true };
  }
  return {
    ...question,
    options: filtered,
  };
}

export function formatAgeGroup(value?: string | null): string {
  if (!value) return "All ages";
  if (value === "AGE_6_9" || value === "6-9") return "Age 6–9";
  if (value === "AGE_10_13" || value === "10-13") return "Age 10–13";
  if (value === "ADULTS" || value === "adults") return "Adults";
  return value;
}

export function normalizeTeacherStoryChapter(
  raw: unknown,
  fallbackIndex = 1,
): TeacherStoryChapter {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const order =
    typeof obj.order === "number"
      ? obj.order
      : typeof obj.sort_order === "number"
        ? obj.sort_order
        : typeof obj.sortOrder === "number"
          ? obj.sortOrder
          : typeof obj.number === "number"
            ? obj.number
            : fallbackIndex;

  return {
    id: String(obj.id ?? `ch-${fallbackIndex}`),
    title:
      typeof obj.title === "string" && obj.title.trim()
        ? obj.title.trim()
        : `Chapter ${order}`,
    order,
  };
}

export function normalizeTeacherStory(
  raw: unknown,
  fallbackIndex = 1,
): TeacherStory {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const chaptersRaw = Array.isArray(obj.chapters) ? obj.chapters : [];
  const chapters = chaptersRaw.map((ch, idx) =>
    normalizeTeacherStoryChapter(ch, idx + 1),
  );

  return {
    id: String(obj.id ?? `story-${fallbackIndex}`),
    title:
      typeof obj.title === "string" && obj.title.trim()
        ? obj.title.trim()
        : `Story ${fallbackIndex}`,
    ageGroup: formatAgeGroup(
      typeof obj.ageGroup === "string"
        ? obj.ageGroup
        : (obj.age_group as string),
    ),
    chapters,
  };
}

export function normalizeTeacherStories(raw: unknown): TeacherStory[] {
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => normalizeTeacherStory(item, idx + 1));
  }
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const items = Array.isArray(obj.items)
    ? obj.items
    : Array.isArray(obj.stories)
      ? obj.stories
      : [];
  return items.map((item, idx) => normalizeTeacherStory(item, idx + 1));
}

export function normalizeChapterQuiz(raw: unknown): ChapterQuiz {
  const root = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const quizObj = (root.quiz && typeof root.quiz === "object"
    ? root.quiz
    : root) as Record<string, unknown>;
  const questionsRaw = Array.isArray(quizObj.questions)
    ? quizObj.questions
    : [];

  const questions: QuizQuestion[] = questionsRaw.map((q, qIdx) => {
    const qObj = (q && typeof q === "object" ? q : {}) as Record<
      string,
      unknown
    >;
    const optionsRaw = Array.isArray(qObj.options) ? qObj.options : [];
    const options: QuizOption[] = optionsRaw.map((o, oIdx) => {
      const oObj = (o && typeof o === "object" ? o : {}) as Record<
        string,
        unknown
      >;
      const isCorrect = Boolean(oObj.isCorrect ?? oObj.is_correct);
      return {
        id: oObj.id ? String(oObj.id) : undefined,
        label:
          typeof oObj.label === "string" ? oObj.label : `Option ${oIdx + 1}`,
        isCorrect,
      };
    });

    return {
      id: qObj.id ? String(qObj.id) : undefined,
      prompt:
        typeof qObj.prompt === "string"
          ? qObj.prompt
          : `Question ${qIdx + 1}`,
      type: (qObj.type as QuestionType) || "MCQ",
      hint: typeof qObj.hint === "string" ? qObj.hint : undefined,
      explanation:
        typeof qObj.explanation === "string" ? qObj.explanation : undefined,
      options:
        options.length > 0
          ? options
          : [
              { label: "", isCorrect: true },
              { label: "", isCorrect: false },
            ],
    };
  });

  return {
    id: quizObj.id ? String(quizObj.id) : undefined,
    chapterId: quizObj.chapterId
      ? String(quizObj.chapterId)
      : quizObj.chapter_id
        ? String(quizObj.chapter_id)
        : undefined,
    title: typeof quizObj.title === "string" ? quizObj.title : undefined,
    questions,
  };
}

export function toSaveQuizPayload(values: QuizFormValues) {
  return {
    title: values.title?.trim() || undefined,
    questions: values.questions.map((q) => ({
      prompt: q.prompt.trim(),
      type: q.type || "MCQ",
      hint: q.hint?.trim() || undefined,
      explanation: q.explanation?.trim() || undefined,
      options: q.options.map((o) => ({
        label: o.label.trim(),
        isCorrect: Boolean(o.isCorrect),
      })),
    })),
  };
}

