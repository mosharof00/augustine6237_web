"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/states";
import { toastSuccess } from "@/components/feedback/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getChapterQuiz, saveChapterQuiz } from "./api";
import {
  addOptionToQuestion,
  createEmptyQuestion,
  moveQuestionDown,
  moveQuestionUp,
  quizFormSchema,
  removeOptionFromQuestion,
  setOptionCorrect,
  type ChapterQuiz,
  type QuizQuestion,
} from "./model";

export function TeacherQuizEditor({
  chapterId,
  storyTitle,
  chapterTitle,
}: {
  chapterId: string;
  storyTitle?: string;
  chapterTitle?: string;
}) {
  const query = useQuery({
    queryKey: ["chapter-quiz", chapterId],
    queryFn: () => getChapterQuiz(chapterId),
    retry: false,
  });

  if (query.isPending) {
    return <LoadingState count={3} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Could not load chapter quiz. Please try again."
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <QuizEditorForm
      key={query.dataUpdatedAt}
      chapterId={chapterId}
      initialQuiz={query.data}
      storyTitle={storyTitle}
      chapterTitle={chapterTitle}
    />
  );
}

function QuizEditorForm({
  chapterId,
  initialQuiz,
  storyTitle,
  chapterTitle,
}: {
  chapterId: string;
  initialQuiz: ChapterQuiz | null;
  storyTitle?: string;
  chapterTitle?: string;
}) {
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    if (initialQuiz?.questions && initialQuiz.questions.length > 0) {
      return initialQuiz.questions;
    }
    return [createEmptyQuestion()];
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<number, { prompt?: string; options?: string }>
  >({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: (values: { questions: QuizQuestion[] }) =>
      saveChapterQuiz(chapterId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-quiz", chapterId] });
      toastSuccess({
        title: "Quiz saved",
        description: "Comprehension quiz updated successfully.",
      });
      setGlobalError(null);
      setValidationErrors({});
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to save quiz. Please try again.";
      setGlobalError(msg);
      toast.error(msg);
    },
  });

  // Handlers for question operations
  function handleAddQuestion() {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
    setGlobalError(null);
  }

  function handleDeleteQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  function handleMoveUp(index: number) {
    setQuestions((prev) => moveQuestionUp(prev, index));
  }

  function handleMoveDown(index: number) {
    setQuestions((prev) => moveQuestionDown(prev, index));
  }

  function handlePromptChange(index: number, prompt: string) {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], prompt };
      return next;
    });
    if (validationErrors[index]?.prompt) {
      setValidationErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], prompt: undefined },
      }));
    }
  }

  function handleHintChange(index: number, hint: string) {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], hint };
      return next;
    });
  }

  function handleOptionLabelChange(
    qIndex: number,
    optIndex: number,
    label: string,
  ) {
    setQuestions((prev) => {
      const next = [...prev];
      const nextOptions = [...next[qIndex].options];
      nextOptions[optIndex] = { ...nextOptions[optIndex], label };
      next[qIndex] = { ...next[qIndex], options: nextOptions };
      return next;
    });
  }

  function handleSetCorrect(qIndex: number, optIndex: number) {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = {
        ...next[qIndex],
        options: setOptionCorrect(next[qIndex].options, optIndex),
      };
      return next;
    });
    if (validationErrors[qIndex]?.options) {
      setValidationErrors((prev) => ({
        ...prev,
        [qIndex]: { ...prev[qIndex], options: undefined },
      }));
    }
  }

  function handleAddOption(qIndex: number) {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = addOptionToQuestion(next[qIndex]);
      return next;
    });
  }

  function handleRemoveOption(qIndex: number, optIndex: number) {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = removeOptionFromQuestion(next[qIndex], optIndex);
      return next;
    });
  }

  function handleSave() {
    setGlobalError(null);
    setValidationErrors({});

    if (questions.length === 0) {
      setGlobalError("Please add at least one question before saving.");
      return;
    }

    // Validate using Zod schema
    const result = quizFormSchema.safeParse({ questions });
    if (!result.success) {
      const errors: Record<number, { prompt?: string; options?: string }> = {};
      const firstErrorMsg = "Please fix the validation errors before saving.";

      result.error.issues.forEach((issue) => {
        // path is ["questions", qIndex, ...]
        if (issue.path[0] === "questions" && typeof issue.path[1] === "number") {
          const qIdx = issue.path[1];
          if (!errors[qIdx]) errors[qIdx] = {};
          if (issue.path[2] === "prompt") {
            errors[qIdx].prompt = issue.message;
          } else if (
            issue.path[2] === "options" ||
            issue.path.includes("options")
          ) {
            errors[qIdx].options = issue.message;
          } else {
            errors[qIdx].options = issue.message;
          }
        }
      });

      // Also verify each question individually
      questions.forEach((q, idx) => {
        if (!q.prompt.trim()) {
          if (!errors[idx]) errors[idx] = {};
          errors[idx].prompt = "Question prompt is required.";
        }
        if (q.options.length < 2) {
          if (!errors[idx]) errors[idx] = {};
          errors[idx].options = "Question must have at least 2 options.";
        } else if (!q.options.some((o) => o.isCorrect)) {
          if (!errors[idx]) errors[idx] = {};
          errors[idx].options = "Mark exactly one option as the correct answer.";
        }
      });

      setValidationErrors(errors);
      setGlobalError(firstErrorMsg);
      toast.error(firstErrorMsg);
      return;
    }

    saveMutation.mutate({ questions });
  }

  const titleDisplay = chapterTitle || "Chapter Quiz";

  return (
    <div className="space-y-6 pb-12">
      {/* Back button and page header */}
      <div>
        <Link
          href="/teacher/chapters"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Chapters</span>
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {titleDisplay}
            </h1>
            <p className="text-sm text-muted-foreground">
              {storyTitle ? `${storyTitle} · ` : ""}
              Comprehension quiz questions and answers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddQuestion}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              <span>Add Question</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-1.5"
            >
              <Check className="size-4" />
              <span>{saveMutation.isPending ? "Saving…" : "Save Quiz"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Global error banner */}
      {globalError ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{globalError}</span>
        </div>
      ) : null}

      {/* Questions list */}
      {questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="This chapter does not have any comprehension quiz questions yet. Add questions to test student reading comprehension."
          action={
            <Button
              type="button"
              onClick={handleAddQuestion}
              className="mt-2 gap-1.5"
            >
              <Plus className="size-4" />
              <span>Add First Question</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {questions.map((question, qIdx) => {
            const error = validationErrors[qIdx];
            return (
              <div
                key={question.id || `q-${qIdx}`}
                className={`rounded-2xl border bg-card p-6 shadow-xs transition-colors ${error ? "border-destructive/60" : "border-border"
                  }`}
              >
                {/* Question Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {qIdx + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      Question {qIdx + 1}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Multiple Choice
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleMoveUp(qIdx)}
                      disabled={qIdx === 0}
                      title="Move question up"
                      aria-label="Move question up"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleMoveDown(qIdx)}
                      disabled={qIdx === questions.length - 1}
                      title="Move question down"
                      aria-label="Move question down"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Delete question"
                      aria-label="Delete question"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Question Form Body */}
                <div className="mt-5 space-y-5">
                  {/* Prompt */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`prompt-${qIdx}`}
                      className="text-xs font-medium text-foreground"
                    >
                      Question Prompt <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`prompt-${qIdx}`}
                      type="text"
                      placeholder="e.g. What did the hero do when the teammate dropped the ball?"
                      value={question.prompt}
                      onChange={(e) => handlePromptChange(qIdx, e.target.value)}
                      className={
                        error?.prompt
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                    {error?.prompt ? (
                      <p className="text-xs text-destructive">{error.prompt}</p>
                    ) : null}
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-foreground">
                        Options <span className="text-destructive">*</span>{" "}
                        <span className="font-normal text-muted-foreground">
                          (Select the radio button for the single correct answer)
                        </span>
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleAddOption(qIdx)}
                        className="gap-1 text-primary hover:text-primary"
                      >
                        <Plus className="size-3" />
                        <span>Add Option</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => (
                        <div
                          key={option.id || `opt-${optIdx}`}
                          className="flex items-center gap-2.5"
                        >
                          {/* Radio selector for correct answer */}
                          <label
                            className="flex cursor-pointer items-center justify-center p-1"
                            title="Mark as correct answer"
                          >
                            <input
                              type="radio"
                              name={`correct-option-${qIdx}`}
                              checked={option.isCorrect}
                              onChange={() => handleSetCorrect(qIdx, optIdx)}
                              className="size-4 text-primary focus:ring-primary"
                              aria-label={`Option ${optIdx + 1} is correct`}
                            />
                          </label>

                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder={`Option ${optIdx + 1}`}
                              value={option.label}
                              onChange={(e) =>
                                handleOptionLabelChange(
                                  qIdx,
                                  optIdx,
                                  e.target.value,
                                )
                              }
                              className={
                                option.isCorrect
                                  ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20"
                                  : ""
                              }
                            />
                          </div>

                          {option.isCorrect ? (
                            <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="size-3" />
                              <span>Correct</span>
                            </span>
                          ) : null}

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveOption(qIdx, optIdx)}
                            disabled={question.options.length <= 2}
                            className="text-muted-foreground hover:text-destructive"
                            title="Remove option"
                            aria-label="Remove option"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {error?.options ? (
                      <p className="text-xs text-destructive">{error.options}</p>
                    ) : null}
                  </div>

                  {/* Hint */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor={`hint-${qIdx}`}
                        className="text-xs font-medium text-foreground"
                      >
                        Optional Hint
                      </Label>
                      <HelpCircle className="size-3 text-muted-foreground" />
                    </div>
                    <Input
                      id={`hint-${qIdx}`}
                      type="text"
                      placeholder="e.g. Think about the conversation at the lunch table."
                      value={question.hint ?? ""}
                      onChange={(e) => handleHintChange(qIdx, e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Shown to students if they answer incorrectly on their attempt.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer bar with actions */}
      {questions.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {questions.length} {questions.length === 1 ? "question" : "questions"}{" "}
            configured
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddQuestion}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              <span>Add Question</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-1.5"
            >
              <Check className="size-4" />
              <span>{saveMutation.isPending ? "Saving…" : "Save Quiz"}</span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
