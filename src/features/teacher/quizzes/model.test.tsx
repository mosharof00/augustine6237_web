import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TeacherChapterPicker } from "./chapter-picker";
import { TeacherQuizEditor } from "./quiz-editor";
import {
  addOptionToQuestion,
  createEmptyOption,
  createEmptyQuestion,
  formatAgeGroup,
  moveQuestionDown,
  moveQuestionUp,
  normalizeChapterQuiz,
  normalizeTeacherStories,
  normalizeTeacherStory,
  normalizeTeacherStoryChapter,
  quizFormSchema,
  quizOptionSchema,
  quizQuestionSchema,
  removeOptionFromQuestion,
  setOptionCorrect,
  toSaveQuizPayload,
  type QuizQuestion,
} from "./model";

describe("teacher quiz model and validation", () => {
  describe("quizOptionSchema", () => {
    it("accepts valid option", () => {
      const res = quizOptionSchema.safeParse({
        label: "Be kind to others",
        isCorrect: true,
      });
      expect(res.success).toBe(true);
    });

    it("rejects empty option label", () => {
      const res = quizOptionSchema.safeParse({
        label: "   ",
        isCorrect: false,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Option text cannot be empty",
        );
      }
    });
  });

  describe("quizQuestionSchema", () => {
    it("accepts valid question with prompt, 2 options, and 1 correct option", () => {
      const valid = {
        prompt: "What should Liam do?",
        type: "MCQ",
        hint: "Think about friendship",
        options: [
          { label: "Invite Sam to sit together", isCorrect: true },
          { label: "Ignore the situation", isCorrect: false },
        ],
      };
      const res = quizQuestionSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects question with empty prompt", () => {
      const invalid = {
        prompt: "  ",
        type: "MCQ",
        options: [
          { label: "Option A", isCorrect: true },
          { label: "Option B", isCorrect: false },
        ],
      };
      const res = quizQuestionSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Question prompt is required",
        );
      }
    });

    it("rejects question with fewer than 2 options", () => {
      const invalid = {
        prompt: "What happened next?",
        options: [{ label: "Only one option", isCorrect: true }],
      };
      const res = quizQuestionSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(
          res.error.issues.some((i) =>
            i.message.includes("at least 2 options"),
          ),
        ).toBe(true);
      }
    });

    it("rejects question with 0 correct options", () => {
      const invalid = {
        prompt: "Which choice shows empathy?",
        options: [
          { label: "Walk away", isCorrect: false },
          { label: "Say something mean", isCorrect: false },
        ],
      };
      const res = quizQuestionSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(
          res.error.issues.some((i) =>
            i.message.includes("Exactly one option must be marked as correct"),
          ),
        ).toBe(true);
      }
    });

    it("rejects question with multiple correct options", () => {
      const invalid = {
        prompt: "Which choice shows empathy?",
        options: [
          { label: "Listen carefully", isCorrect: true },
          { label: "Offer comforting words", isCorrect: true },
          { label: "Walk away", isCorrect: false },
        ],
      };
      const res = quizQuestionSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(
          res.error.issues.some((i) =>
            i.message.includes("Exactly one option must be marked as correct"),
          ),
        ).toBe(true);
      }
    });
  });

  describe("quizFormSchema", () => {
    it("rejects empty questions array", () => {
      const res = quizFormSchema.safeParse({
        title: "Test Quiz",
        questions: [],
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(
          res.error.issues.some((i) =>
            i.message.includes("Add at least one question"),
          ),
        ).toBe(true);
      }
    });

    it("accepts valid quiz with multiple questions", () => {
      const res = quizFormSchema.safeParse({
        title: "Chapter 1 Comprehension",
        questions: [
          {
            prompt: "Question 1?",
            options: [
              { label: "A", isCorrect: true },
              { label: "B", isCorrect: false },
            ],
          },
          {
            prompt: "Question 2?",
            options: [
              { label: "C", isCorrect: false },
              { label: "D", isCorrect: true },
            ],
          },
        ],
      });
      expect(res.success).toBe(true);
    });
  });

  describe("reordering and option helpers", () => {
    it("createEmptyOption creates option with default false", () => {
      const opt = createEmptyOption();
      expect(opt.label).toBe("");
      expect(opt.isCorrect).toBe(false);
      const correctOpt = createEmptyOption(true);
      expect(correctOpt.isCorrect).toBe(true);
    });

    it("createEmptyQuestion creates valid 2-option MCQ", () => {
      const q = createEmptyQuestion();
      expect(q.prompt).toBe("");
      expect(q.type).toBe("MCQ");
      expect(q.options.length).toBe(2);
      expect(q.options[0]?.isCorrect).toBe(true);
      expect(q.options[1]?.isCorrect).toBe(false);
    });

    it("moves questions up and down safely", () => {
      const q1 = { ...createEmptyQuestion(), prompt: "Q1" };
      const q2 = { ...createEmptyQuestion(), prompt: "Q2" };
      const q3 = { ...createEmptyQuestion(), prompt: "Q3" };
      const list = [q1, q2, q3];

      // Move Q2 up
      const afterUp = moveQuestionUp(list, 1);
      expect(afterUp[0]?.prompt).toBe("Q2");
      expect(afterUp[1]?.prompt).toBe("Q1");

      // Boundary check: move first up does nothing
      expect(moveQuestionUp(list, 0)).toEqual(list);

      // Move Q2 down
      const afterDown = moveQuestionDown(list, 1);
      expect(afterDown[1]?.prompt).toBe("Q3");
      expect(afterDown[2]?.prompt).toBe("Q2");

      // Boundary check: move last down does nothing
      expect(moveQuestionDown(list, 2)).toEqual(list);
    });

    it("setOptionCorrect marks selected index true and others false", () => {
      const options = [
        { label: "A", isCorrect: true },
        { label: "B", isCorrect: false },
        { label: "C", isCorrect: false },
      ];
      const updated = setOptionCorrect(options, 2);
      expect(updated[0]?.isCorrect).toBe(false);
      expect(updated[1]?.isCorrect).toBe(false);
      expect(updated[2]?.isCorrect).toBe(true);
    });

    it("addOptionToQuestion adds option", () => {
      const q = createEmptyQuestion();
      const updated = addOptionToQuestion(q);
      expect(updated.options.length).toBe(3);
      expect(updated.options[2]?.isCorrect).toBe(false);
    });

    it("removeOptionFromQuestion removes option when > 2 and preserves correct option", () => {
      const q: QuizQuestion = {
        prompt: "Prompt",
        type: "MCQ",
        options: [
          { label: "A", isCorrect: true },
          { label: "B", isCorrect: false },
          { label: "C", isCorrect: false },
        ],
      };

      // Remove third option
      const res1 = removeOptionFromQuestion(q, 2);
      expect(res1.options.length).toBe(2);
      expect(res1.options[0]?.isCorrect).toBe(true);

      // Cannot remove when <= 2
      const res2 = removeOptionFromQuestion(res1, 1);
      expect(res2.options.length).toBe(2);

      // If removing the correct option, first remaining option becomes correct
      const res3 = removeOptionFromQuestion(q, 0);
      expect(res3.options.length).toBe(2);
      expect(res3.options[0]?.isCorrect).toBe(true);
    });
  });

  describe("normalizers", () => {
    it("formatAgeGroup formats known age groups", () => {
      expect(formatAgeGroup("AGE_6_9")).toBe("Age 6–9");
      expect(formatAgeGroup("6-9")).toBe("Age 6–9");
      expect(formatAgeGroup("AGE_10_13")).toBe("Age 10–13");
      expect(formatAgeGroup("10-13")).toBe("Age 10–13");
      expect(formatAgeGroup("ADULTS")).toBe("Adults");
      expect(formatAgeGroup("adults")).toBe("Adults");
      expect(formatAgeGroup(null)).toBe("All ages");
    });

    it("normalizeTeacherStoryChapter extracts chapter data", () => {
      const raw = {
        id: "ch-10",
        title: "The Big Game",
        order: 2,
      };
      const chapter = normalizeTeacherStoryChapter(raw);
      expect(chapter.id).toBe("ch-10");
      expect(chapter.title).toBe("The Big Game");
      expect(chapter.order).toBe(2);
    });

    it("normalizeTeacherStory normalizes story and nested chapters", () => {
      const raw = {
        id: "st-1",
        title: "Courage at Lunch",
        ageGroup: "AGE_6_9",
        chapters: [
          { id: "ch-1", title: "Chapter 1", order: 1 },
          { id: "ch-2", title: "Chapter 2", order: 2 },
        ],
      };
      const story = normalizeTeacherStory(raw);
      expect(story.id).toBe("st-1");
      expect(story.title).toBe("Courage at Lunch");
      expect(story.ageGroup).toBe("Age 6–9");
      expect(story.chapters.length).toBe(2);
    });

    it("normalizeTeacherStories handles array and items wrappers", () => {
      const arrayRaw = [{ id: "s1", title: "Story 1", chapters: [] }];
      expect(normalizeTeacherStories(arrayRaw).length).toBe(1);

      const itemsRaw = { items: [{ id: "s2", title: "Story 2", chapters: [] }] };
      expect(normalizeTeacherStories(itemsRaw).length).toBe(1);
    });

    it("normalizeChapterQuiz normalizes backend quiz payload", () => {
      const raw = {
        quiz: {
          id: "qz-1",
          title: "Chapter 1 Comprehension",
          questions: [
            {
              id: "q-1",
              prompt: "What did the character do?",
              type: "MCQ",
              hint: "Check page 3",
              options: [
                { id: "opt-1", label: "Option 1", is_correct: true },
                { id: "opt-2", label: "Option 2", is_correct: false },
              ],
            },
          ],
        },
      };

      const quiz = normalizeChapterQuiz(raw);
      expect(quiz.id).toBe("qz-1");
      expect(quiz.title).toBe("Chapter 1 Comprehension");
      expect(quiz.questions.length).toBe(1);
      expect(quiz.questions[0]?.prompt).toBe("What did the character do?");
      expect(quiz.questions[0]?.hint).toBe("Check page 3");
      expect(quiz.questions[0]?.options.length).toBe(2);
      expect(quiz.questions[0]?.options[0]?.isCorrect).toBe(true);
      expect(quiz.questions[0]?.options[1]?.isCorrect).toBe(false);
    });

    it("toSaveQuizPayload converts form values to PUT body shape", () => {
      const payload = toSaveQuizPayload({
        title: " Quiz Title ",
        questions: [
          {
            prompt: " Question 1? ",
            type: "MCQ",
            hint: " Some hint ",
            options: [
              { label: " Yes ", isCorrect: true },
              { label: " No ", isCorrect: false },
            ],
          },
        ],
      });

      expect(payload.title).toBe("Quiz Title");
      expect(payload.questions.length).toBe(1);
      expect(payload.questions[0]?.prompt).toBe("Question 1?");
      expect(payload.questions[0]?.hint).toBe("Some hint");
      expect(payload.questions[0]?.options[0]?.label).toBe("Yes");
      expect(payload.questions[0]?.options[0]?.isCorrect).toBe(true);
      expect(payload.questions[0]?.options[1]?.label).toBe("No");
      expect(payload.questions[0]?.options[1]?.isCorrect).toBe(false);
    });
  });

  describe("component rendering", () => {
    it("renders TeacherChapterPicker without crashing", () => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const html = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <TeacherChapterPicker />
        </QueryClientProvider>,
      );
      expect(html).toBeDefined();
    });

    it("renders TeacherQuizEditor without crashing", () => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const html = renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <TeacherQuizEditor
            chapterId="chap-1"
            storyTitle="Test Story"
            chapterTitle="Chapter 1"
          />
        </QueryClientProvider>,
      );
      expect(html).toBeDefined();
    });
  });
});
