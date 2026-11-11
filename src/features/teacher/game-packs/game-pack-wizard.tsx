"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTeacherGamePack,
  getTeacherGamePack,
  updateTeacherGamePack,
} from "./api";
import {
  AVAILABLE_STORIES,
  ROUND_STEPS,
  createDefaultPackFormData,
  detailToFormData,
  validatePackForm,
  type AgeGroup,
  type GamePackFormData,
  type PublishStatus,
} from "./model";

export function GamePackWizard({ packId }: { packId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  // Load existing pack if packId is provided
  const { data: existingPack, isLoading: isPackLoading, error: packError } = useQuery({
    queryKey: ["teacher-game-pack", packId],
    queryFn: () => getTeacherGamePack(packId!),
    enabled: Boolean(packId),
  });

  const [formData, setFormData] = useState<GamePackFormData>(() =>
    createDefaultPackFormData(),
  );

  // Sync loaded pack data into form
  const [syncedId, setSyncedId] = useState<string | null>(null);
  if (existingPack && syncedId !== existingPack.id) {
    setFormData(detailToFormData(existingPack));
    setSyncedId(existingPack.id);
  }

  const saveMutation = useMutation({
    mutationFn: async (targetStatus: PublishStatus) => {
      const val = validatePackForm(formData, targetStatus);
      if (!val.valid) {
        throw new Error(val.errors.join("\n"));
      }

      if (packId) {
        return updateTeacherGamePack(packId, formData, targetStatus);
      }
      return createTeacherGamePack(formData, targetStatus);
    },
    onSuccess: (_, targetStatus) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-game-packs"] });
      if (packId) {
        queryClient.invalidateQueries({ queryKey: ["teacher-game-pack", packId] });
      }
      toast.success(
        targetStatus === "PUBLISHED" ? "Game pack published!" : "Draft saved",
        {
          description:
            targetStatus === "PUBLISHED"
              ? "Pack is now ready for classroom game shows."
              : "Your question pack draft has been saved.",
        },
      );
      router.push("/teacher/game-packs");
    },
    onError: (err: unknown) => {
      toast.error("Could not save game pack", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    },
  });

  if (packId && isPackLoading) {
    return <LoadingState count={4} />;
  }

  if (packId && packError) {
    return (
      <ErrorState
        message={packError instanceof Error ? packError.message : "Failed to load game pack"}
        onRetry={() => router.push("/teacher/game-packs")}
      />
    );
  }

  const handleNext = () => {
    if (currentStep === 0 && !formData.title.trim()) {
      toast.error("Title required", {
        description: "Please enter a title for the game pack.",
      });
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/teacher/game-packs");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb matching screenshots */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/teacher/game-packs"
          className="hover:text-foreground transition-colors"
        >
          Stories &amp; Questions
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">Game Questions</span>
      </nav>

      {/* Step Stepper navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ROUND_STEPS.map((s) => {
          const isActive = currentStep === s.stepIndex;
          const isDone = currentStep > s.stepIndex;
          return (
            <button
              key={s.stepIndex}
              type="button"
              onClick={() => setCurrentStep(s.stepIndex)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-[#e05638] text-white border-[#e05638] shadow-sm"
                  : isDone
                  ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <span className="size-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                  {s.stepIndex === 0 ? "0" : s.stepIndex}
                </span>
              )}
              <span>{s.stepIndex === 0 ? "Pack Info" : s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Step Content Card */}
      <div className="rounded-2xl border bg-card p-6 sm:p-10 shadow-sm transition-all">
        {currentStep === 0 && (
          <Step0PackSetup
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {currentStep === 1 && (
          <Step1RoundWarmup
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {currentStep === 2 && (
          <Step2RoundStoryChallenge
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {currentStep === 3 && (
          <Step3RoundHobby
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {currentStep === 4 && (
          <Step4RoundFinals
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="w-full sm:w-auto rounded-xl px-6 h-10 border-border"
          >
            <ArrowLeft className="size-4 mr-2" />
            <span>Back</span>
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => saveMutation.mutate("DRAFT")}
              disabled={saveMutation.isPending}
              className="rounded-xl px-5 h-10"
            >
              <Save className="size-4 mr-2" />
              <span>Save Draft</span>
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#e05638] hover:bg-[#c94529] text-white rounded-xl px-7 h-10 shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => saveMutation.mutate("PUBLISHED")}
                disabled={saveMutation.isPending}
                className="bg-[#e05638] hover:bg-[#c94529] text-white rounded-xl px-7 h-10 shadow-sm"
              >
                <span>Publish Game Pack</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Step 0: Pack Setup & Age Group & Stories (teacher_stories_list.png)         */
/* ========================================================================= */
function Step0PackSetup({
  formData,
  setFormData,
}: {
  formData: GamePackFormData;
  setFormData: React.Dispatch<React.SetStateAction<GamePackFormData>>;
}) {
  const addStoryRow = () => {
    const unused = AVAILABLE_STORIES.find(
      (s) => !formData.stories.some((sel) => sel.storyId === s.id),
    );
    const s = unused ?? AVAILABLE_STORIES[0];
    setFormData((prev) => ({
      ...prev,
      stories: [
        ...prev.stories,
        {
          storyId: s.id,
          storyTitle: s.title,
          chapters: "All Chapter",
        },
      ],
    }));
  };

  const removeStoryRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stories: prev.stories.filter((_, i) => i !== index),
    }));
  };

  const updateStoryRow = (
    index: number,
    field: "storyId" | "chapters",
    val: string,
  ) => {
    setFormData((prev) => {
      const next = [...prev.stories];
      if (field === "storyId") {
        const found = AVAILABLE_STORIES.find((s) => s.id === val);
        next[index] = {
          ...next[index],
          storyId: val,
          storyTitle: found?.title ?? val,
        };
      } else {
        next[index] = {
          ...next[index],
          chapters: val,
        };
      }
      return { ...prev, stories: next };
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Create a New Game
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your stories, select chapters, and set the age group to create an engaging quiz experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Pack Title */}
        <div className="space-y-2">
          <label
            htmlFor="pack-title-input"
            className="text-sm font-semibold text-foreground"
          >
            Pack Title
          </label>
          <Input
            id="pack-title-input"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g. Anti-Bullying Awareness Game Pack"
            className="h-11 rounded-xl bg-background border-input text-sm"
          />
        </div>

        {/* Age Group */}
        <div className="space-y-2">
          <label
            htmlFor="pack-age-group-select"
            className="text-sm font-semibold text-foreground"
          >
            Age Group
          </label>
          <select
            id="pack-age-group-select"
            value={formData.ageGroup}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                ageGroup: e.target.value as AgeGroup,
              }))
            }
            className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-ring transition-colors"
          >
            <option value="6-9">6-9</option>
            <option value="10-13">10-13</option>
            <option value="adults">Adults</option>
          </select>
        </div>

        {/* Stories & Chapters rows */}
        <div className="space-y-4 pt-2">
          {formData.stories.map((storySel, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/20 relative group"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Storie
                </label>
                <select
                  value={storySel.storyId}
                  onChange={(e) => updateStoryRow(index, "storyId", e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
                >
                  {AVAILABLE_STORIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Chapter
                  </label>
                  {formData.stories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStoryRow(index)}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="size-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <Input
                  value={storySel.chapters}
                  onChange={(e) =>
                    updateStoryRow(index, "chapters", e.target.value)
                  }
                  placeholder="e.g. All Chapter, or 1,2"
                  className="h-11 rounded-xl bg-background border-input text-sm"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addStoryRow}
            className="w-full h-11 border-dashed rounded-xl gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" />
            <span>Add Another Story</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Step 1: Round -1: Test Your Knowledge (teacher_story_chapter_select.png)  */
/* ========================================================================= */
function Step1RoundWarmup({
  formData,
  setFormData,
}: {
  formData: GamePackFormData;
  setFormData: React.Dispatch<React.SetStateAction<GamePackFormData>>;
}) {
  const updateQuestionPrompt = (qIndex: number, prompt: string) => {
    setFormData((prev) => {
      const next = [...prev.round1];
      next[qIndex] = { ...next[qIndex], prompt };
      return { ...prev, round1: next };
    });
  };

  const updateQuestionOption = (
    qIndex: number,
    optIndex: number,
    optValue: string,
  ) => {
    setFormData((prev) => {
      const next = [...prev.round1];
      const opts = [...next[qIndex].options];
      opts[optIndex] = optValue;
      next[qIndex] = { ...next[qIndex], options: opts };
      return { ...prev, round1: next };
    });
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setFormData((prev) => {
      const next = [...prev.round1];
      next[qIndex] = { ...next[qIndex], correctIndex: optIndex };
      return { ...prev, round1: next };
    });
  };

  return (
    <div className="space-y-8">
      {/* Round Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Round -1
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Answer four multiple-choice questions to begin your adventure.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary self-start">
          4 Questions · MCQ
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">
          Test Your Knowledge
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Answer four multiple-choice questions to begin your adventure.
        </p>
      </div>

      {/* 2x2 Questions Grid matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {formData.round1.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4 rounded-xl border p-5 bg-card/50">
            <div className="space-y-1.5">
              <label
                htmlFor={`round1-prompt-${qIndex}`}
                className="text-xs font-semibold text-foreground"
              >
                {qIndex + 1}. Question
              </label>
              <Input
                id={`round1-prompt-${qIndex}`}
                value={q.prompt}
                onChange={(e) => updateQuestionPrompt(qIndex, e.target.value)}
                placeholder="Enter question prompt..."
                className="h-10 rounded-xl bg-background border-input text-xs"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Answers · select the correct one
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctIndex === optIndex;
                  return (
                    <div
                      key={optIndex}
                      onClick={() => setCorrectOption(qIndex, optIndex)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-pointer transition-all ${
                        isCorrect
                          ? "border-[#e05638] bg-[#e05638]/5 ring-1 ring-[#e05638]"
                          : "border-input bg-background hover:border-primary/50"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Option ${optIndex + 1} for question ${qIndex + 1}`}
                        className={`size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isCorrect
                            ? "border-[#e05638] bg-[#e05638]"
                            : "border-muted-foreground/40 bg-background"
                        }`}
                      >
                        {isCorrect && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          updateQuestionOption(qIndex, optIndex, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Option ${optIndex + 1}`}
                        className="w-full bg-transparent text-xs text-foreground outline-none font-normal"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Step 2: Round -2: Story Challenge (teacher_quiz_question_create.png)       */
/* ========================================================================= */
function Step2RoundStoryChallenge({
  formData,
  setFormData,
}: {
  formData: GamePackFormData;
  setFormData: React.Dispatch<React.SetStateAction<GamePackFormData>>;
}) {
  return (
    <div className="space-y-8">
      {/* Round Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Round -2
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Answer four multiple-choice questions to begin your adventure.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary self-start">
          1 Story · 1 Question
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">
          Story Challenge
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Read the story carefully and answer the question based on what you discover.
        </p>
      </div>

      <div className="space-y-6">
        {/* Story Text */}
        <div className="space-y-2">
          <label
            htmlFor="round2-story-excerpt"
            className="text-xs font-semibold text-foreground"
          >
            Story
          </label>
          <textarea
            id="round2-story-excerpt"
            rows={4}
            value={formData.round2.storyText}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                round2: { ...prev.round2, storyText: e.target.value },
              }))
            }
            placeholder="Paste or write the story passage for students to read..."
            className="w-full rounded-xl border border-input bg-background p-4 text-xs leading-relaxed text-foreground outline-none focus:border-ring resize-y"
          />
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <label
            htmlFor="round2-question-prompt"
            className="text-xs font-semibold text-foreground"
          >
            Question
          </label>
          <Input
            id="round2-question-prompt"
            value={formData.round2.prompt}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                round2: { ...prev.round2, prompt: e.target.value },
              }))
            }
            placeholder="e.g. How did the lantern keeper save the boat?"
            className="h-11 rounded-xl bg-background border-input text-xs"
          />
        </div>

        {/* Written Answer */}
        <div className="space-y-2">
          <label
            htmlFor="round2-sample-answer"
            className="text-xs font-semibold text-foreground"
          >
            Write Your Answer
          </label>
          <textarea
            id="round2-sample-answer"
            rows={3}
            value={formData.round2.sampleAnswer}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                round2: { ...prev.round2, sampleAnswer: e.target.value },
              }))
            }
            placeholder="Model written response for scoring or guidance..."
            className="w-full rounded-xl border border-input bg-background p-4 text-xs leading-relaxed text-foreground outline-none focus:border-ring resize-y"
          />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Step 3: Round -3: Think Beyond the Story (teacher_quiz_question_list.png)  */
/* ========================================================================= */
function Step3RoundHobby({
  formData,
  setFormData,
}: {
  formData: GamePackFormData;
  setFormData: React.Dispatch<React.SetStateAction<GamePackFormData>>;
}) {
  const updateQuestionPrompt = (qIndex: number, prompt: string) => {
    setFormData((prev) => {
      const next = [...prev.round3];
      next[qIndex] = { ...next[qIndex], prompt };
      return { ...prev, round3: next };
    });
  };

  const updateQuestionOption = (
    qIndex: number,
    optIndex: number,
    optValue: string,
  ) => {
    setFormData((prev) => {
      const next = [...prev.round3];
      const opts = [...next[qIndex].options];
      opts[optIndex] = optValue;
      next[qIndex] = { ...next[qIndex], options: opts };
      return { ...prev, round3: next };
    });
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setFormData((prev) => {
      const next = [...prev.round3];
      next[qIndex] = { ...next[qIndex], correctIndex: optIndex };
      return { ...prev, round3: next };
    });
  };

  return (
    <div className="space-y-8">
      {/* Round Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Round -3
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Answer four multiple-choice questions to begin your adventure.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary self-start">
          MCQ · 4 Options
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">
          Think Beyond the Story
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Use your understanding and reasoning skills to answer the question.
        </p>
      </div>

      {/* 2x2 Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {formData.round3.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4 rounded-xl border p-5 bg-card/50">
            <div className="space-y-1.5">
              <label
                htmlFor={`round3-prompt-${qIndex}`}
                className="text-xs font-semibold text-foreground"
              >
                {qIndex + 1}. Question
              </label>
              <Input
                id={`round3-prompt-${qIndex}`}
                value={q.prompt}
                onChange={(e) => updateQuestionPrompt(qIndex, e.target.value)}
                placeholder="Enter question prompt..."
                className="h-10 rounded-xl bg-background border-input text-xs"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Answers · select the correct one
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctIndex === optIndex;
                  return (
                    <div
                      key={optIndex}
                      onClick={() => setCorrectOption(qIndex, optIndex)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-pointer transition-all ${
                        isCorrect
                          ? "border-[#e05638] bg-[#e05638]/5 ring-1 ring-[#e05638]"
                          : "border-input bg-background hover:border-primary/50"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Option ${optIndex + 1} for question ${qIndex + 1}`}
                        className={`size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isCorrect
                            ? "border-[#e05638] bg-[#e05638]"
                            : "border-muted-foreground/40 bg-background"
                        }`}
                      >
                        {isCorrect && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          updateQuestionOption(qIndex, optIndex, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Option ${optIndex + 1}`}
                        className="w-full bg-transparent text-xs text-foreground outline-none font-normal"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Step 4: Round -4: Finals (teacher_quiz_question_edit.png)                  */
/* ========================================================================= */
function Step4RoundFinals({
  formData,
  setFormData,
}: {
  formData: GamePackFormData;
  setFormData: React.Dispatch<React.SetStateAction<GamePackFormData>>;
}) {
  const updateQuestionPrompt = (qIndex: number, prompt: string) => {
    setFormData((prev) => {
      const next = [...prev.round4];
      next[qIndex] = { ...next[qIndex], prompt };
      return { ...prev, round4: next };
    });
  };

  const updateQuestionOption = (
    qIndex: number,
    optIndex: number,
    optValue: string,
  ) => {
    setFormData((prev) => {
      const next = [...prev.round4];
      const opts = [...next[qIndex].options];
      opts[optIndex] = optValue;
      next[qIndex] = { ...next[qIndex], options: opts };
      return { ...prev, round4: next };
    });
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setFormData((prev) => {
      const next = [...prev.round4];
      next[qIndex] = { ...next[qIndex], correctIndex: optIndex };
      return { ...prev, round4: next };
    });
  };

  return (
    <div className="space-y-8">
      {/* Round Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Round -4
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Answer four multiple-choice questions to begin your adventure.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary self-start">
          MCQ · 4 Options
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">
          One Team. One Challenge.
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Use your understanding and reasoning skills to answer the question.
        </p>
      </div>

      {/* 2x2 Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {formData.round4.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4 rounded-xl border p-5 bg-card/50">
            <div className="space-y-1.5">
              <label
                htmlFor={`round4-prompt-${qIndex}`}
                className="text-xs font-semibold text-foreground"
              >
                {qIndex + 1}. Question
              </label>
              <Input
                id={`round4-prompt-${qIndex}`}
                value={q.prompt}
                onChange={(e) => updateQuestionPrompt(qIndex, e.target.value)}
                placeholder="Enter question prompt..."
                className="h-10 rounded-xl bg-background border-input text-xs"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Answers · select the correct one
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctIndex === optIndex;
                  return (
                    <div
                      key={optIndex}
                      onClick={() => setCorrectOption(qIndex, optIndex)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-pointer transition-all ${
                        isCorrect
                          ? "border-[#e05638] bg-[#e05638]/5 ring-1 ring-[#e05638]"
                          : "border-input bg-background hover:border-primary/50"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Option ${optIndex + 1} for question ${qIndex + 1}`}
                        className={`size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isCorrect
                            ? "border-[#e05638] bg-[#e05638]"
                            : "border-muted-foreground/40 bg-background"
                        }`}
                      >
                        {isCorrect && (
                          <span className="size-1.5 rounded-full bg-white" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          updateQuestionOption(qIndex, optIndex, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Option ${optIndex + 1}`}
                        className="w-full bg-transparent text-xs text-foreground outline-none font-normal"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
