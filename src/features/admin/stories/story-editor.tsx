"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/feedback/states";
import { StatusBadge } from "@/components/feedback/status-badge";
import { toastSuccess } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/envelope";
import {
  addChapter,
  createStory,
  getStory,
  putAudio,
  replacePages,
  updateStory,
} from "./api";
import { FileUploadDropzone } from "./file-upload-dropzone";
import {
  AGE_GROUPS,
  buildCreateStoryPayload,
  createChapterSchema,
  createStorySchema,
  STORY_CATEGORIES,
  storyStatusVariant,
  toApiAgeGroup,
  type CreateStoryValues,
  type StoryChapter,
  type StoryChapterPage,
  type StoryListItem,
} from "./model";

type Step = "details" | "curriculum";

export function StoryEditor({
  mode,
  id,
}: {
  mode: "create" | "edit";
  id?: string;
}) {
  const query = useQuery({
    queryKey: ["admin-story", id],
    queryFn: () => getStory(id!),
    enabled: mode === "edit" && Boolean(id),
    retry: false,
  });

  if (mode === "edit" && query.isPending) {
    return <LoadingState kind="cards" count={3} />;
  }

  if (mode === "edit" && query.isError) {
    return (
      <ErrorState
        message={
          query.error instanceof ApiError ? query.error.message : "Story not found."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <StoryEditorForm
      key={query.data?.id ?? "new"}
      mode={mode}
      id={id}
      initialStory={query.data}
    />
  );
}

function StoryEditorForm({
  mode,
  id,
  initialStory,
}: {
  mode: "create" | "edit";
  id?: string;
  initialStory?: StoryListItem & { chapters: StoryChapter[] };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const initialStep = (searchParams.get("step") as Step) || "details";
  const [activeStep, setActiveStep] = useState<Step>(initialStep);

  const story = initialStory;

  // Step 1: Form state initialized from initialStory
  const [title, setTitle] = useState(story?.title ?? "");
  const [author, setAuthor] = useState(story?.author ?? "");
  const [category, setCategory] = useState(story?.category ?? "KINDNESS");

  function parseInitialAgeGroup(age?: string): "6-9" | "10-13" | "adults" {
    if (age === "AGE_10_13" || age === "10-13") return "10-13";
    if (age === "ADULTS" || age === "adults") return "adults";
    return "6-9";
  }

  const [ageGroup, setAgeGroup] = useState<"6-9" | "10-13" | "adults">(
    parseInitialAgeGroup(story?.ageGroup),
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | string>(
    story?.estimatedMinutes ?? "",
  );
  const [synopsis, setSynopsis] = useState(story?.synopsis ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(story?.coverUrl ?? null);
  const [detailsSaving, setDetailsSaving] = useState(false);

  // Curriculum state
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    story?.chapters?.[0]?.id ?? null,
  );
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);
  const [addChapterOpen, setAddChapterOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterNumber, setNewChapterNumber] = useState<number | string>("");
  const [addingChapter, setAddingChapter] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const activeChapter: StoryChapter | undefined = story?.chapters?.find(
    (c) => c.id === selectedChapterId,
  ) ?? story?.chapters?.[0];

  const activePage: StoryChapterPage | undefined = activeChapter?.pages?.find(
    (p) => p.number === selectedPageNumber,
  ) ?? activeChapter?.pages?.[0];

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    const parseResult = createStorySchema.safeParse({
      title,
      author,
      category,
      ageGroup,
      estimatedMinutes: estimatedMinutes === "" ? null : Number(estimatedMinutes),
      synopsis,
      coverUrl,
    });

    if (!parseResult.success) {
      const err = parseResult.error.issues[0]?.message ?? "Invalid form input";
      toast.error(err);
      return;
    }

    setDetailsSaving(true);
    try {
      if (mode === "create") {
        const payload = buildCreateStoryPayload(parseResult.data as CreateStoryValues);
        const created = await createStory(payload);
        toastSuccess({
          title: "Story created",
          description: `"${created.title}" was created as a draft.`,
        });
        await queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
        router.push(`/admin/stories/${created.id}?step=curriculum`);
      } else if (id) {
        await updateStory(id, {
          title: title.trim(),
          author: author.trim() || undefined,
          category,
          ageGroup: toApiAgeGroup(ageGroup),
          estimatedMinutes: estimatedMinutes === "" ? undefined : Number(estimatedMinutes),
          synopsis: synopsis.trim() || undefined,
          coverUrl: coverUrl || undefined,
        });
        toastSuccess({
          title: "Story updated",
          description: "Story details were saved.",
        });
        await queryClient.invalidateQueries({ queryKey: ["admin-story", id] });
        await queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
        setActiveStep("curriculum");
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to save story details.",
      );
    } finally {
      setDetailsSaving(false);
    }
  }

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const parseResult = createChapterSchema.safeParse({
      title: newChapterTitle,
      number: newChapterNumber === "" ? undefined : Number(newChapterNumber),
    });
    if (!parseResult.success) {
      toast.error(parseResult.error.issues[0]?.message ?? "Chapter title is required");
      return;
    }

    setAddingChapter(true);
    try {
      const created = await addChapter(id, {
        title: newChapterTitle.trim(),
        number: newChapterNumber === "" ? undefined : Number(newChapterNumber),
      });
      toastSuccess({
        title: "Chapter added",
        description: `"${created.title}" was added.`,
      });
      setNewChapterTitle("");
      setNewChapterNumber("");
      setAddChapterOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-story", id] });
      setSelectedChapterId(created.id);
      setSelectedPageNumber(1);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not add chapter.",
      );
    } finally {
      setAddingChapter(false);
    }
  }

  async function handleAddPage() {
    if (!activeChapter || !id) return;
    const currentPages = activeChapter.pages ?? [];
    const nextNumber = currentPages.length + 1;
    const nextPages = [
      ...currentPages.map((p) => ({
        number: p.number,
        bodyText: p.bodyText ?? undefined,
        imageUrl: p.imageUrl ?? undefined,
      })),
      {
        number: nextNumber,
        bodyText: "",
        imageUrl: undefined,
      },
    ];

    try {
      await replacePages(activeChapter.id, nextPages);
      toastSuccess({
        title: "Page added",
        description: `Page ${nextNumber} added to Chapter ${activeChapter.number}.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-story", id] });
      setSelectedPageNumber(nextNumber);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not add page.",
      );
    }
  }

  async function handleDeletePage(pageNumber: number) {
    if (!activeChapter || !id) return;
    const remaining = (activeChapter.pages ?? []).filter((p) => p.number !== pageNumber);
    const renumbered = remaining.map((p, index) => ({
      number: index + 1,
      bodyText: p.bodyText ?? undefined,
      imageUrl: p.imageUrl ?? undefined,
    }));

    try {
      await replacePages(activeChapter.id, renumbered);
      toastSuccess({
        title: "Page deleted",
        description: `Page ${pageNumber} was removed.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-story", id] });
      setSelectedPageNumber(1);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not delete page.",
      );
    }
  }

  async function handleSetStatus(newStatus: "PUBLISHED" | "DRAFT") {
    if (!id) return;
    setStatusUpdating(true);
    try {
      await updateStory(id, { status: newStatus });
      toastSuccess({
        title: newStatus === "PUBLISHED" ? "Story published" : "Saved as draft",
        description:
          newStatus === "PUBLISHED"
            ? `"${title}" is now published.`
            : `"${title}" is saved as draft.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-story", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update story status.",
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/admin/stories" className="hover:text-foreground">
            Stories
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">
            {mode === "create" ? "Create Storie" : title || "Edit Storie"}
          </span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">
                {mode === "create" ? "Create New Storie" : title || "Edit Storie"}
              </h2>
              {story ? (
                <StatusBadge variant={storyStatusVariant(story.status)} />
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Configure storie details, cover illustration, and ordered chapters for Reading &amp; Listening modes.
            </p>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveStep("details")}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeStep === "details"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-background/20 text-xs">
                1
              </span>
              Storie Details
            </button>

            <button
              type="button"
              disabled={mode === "create" && !story}
              onClick={() => setActiveStep("curriculum")}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeStep === "curriculum"
                  ? "border-primary bg-primary text-primary-foreground"
                  : mode === "create" && !story
                    ? "cursor-not-allowed border-border/50 bg-background/50 text-muted-foreground/50"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-background/20 text-xs">
                2
              </span>
              Curriculum
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Details */}
      {activeStep === "details" ? (
        <form onSubmit={handleSaveDetails} className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Storie Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Storie Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. The Golden Pearl Book 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="author">Written By / Author</Label>
                <Input
                  id="author"
                  placeholder="e.g. Audrey Cuff Ed. D."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {STORY_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ageGroup">Age Group (Decision 2)</Label>
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) =>
                    setAgeGroup(e.target.value as "6-9" | "10-13" | "adults")
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {AGE_GROUPS.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="estimatedMinutes">Estimated Reading Time (mins)</Label>
                <Input
                  id="estimatedMinutes"
                  type="number"
                  min="1"
                  placeholder="e.g. 20"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="synopsis">Description / Synopsis</Label>
                <textarea
                  id="synopsis"
                  rows={4}
                  placeholder="Short description of the story..."
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="sm:col-span-2">
                <FileUploadDropzone
                  purpose="STORY_COVER"
                  label="Upload Thumbnail / Book Cover"
                  currentUrl={coverUrl}
                  onUploaded={(url) => setCoverUrl(url)}
                  onClear={() => setCoverUrl(null)}
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              render={<Link href="/admin/stories" />}
            >
              <ArrowLeft className="size-4" />
              Back to Stories
            </Button>

            <Button type="submit" disabled={detailsSaving}>
              {detailsSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {mode === "create" ? "Save & Continue to Curriculum" : "Save Changes"}
            </Button>
          </div>
        </form>
      ) : null}

      {/* STEP 2: Curriculum */}
      {activeStep === "curriculum" && id ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Chapters & Pages list */}
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Curriculum</h3>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => setAddChapterOpen(true)}
                  >
                    <Plus className="size-4" />
                    Add Chapter
                  </Button>
                </div>

                {story?.chapters?.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No chapters added yet. Click &quot;Add Chapter&quot; above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {story?.chapters?.map((chapter) => {
                      const isSelected = chapter.id === (activeChapter?.id ?? selectedChapterId);
                      return (
                        <div
                          key={chapter.id}
                          className={`rounded-lg border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/30"
                          }`}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedChapterId(chapter.id);
                              setSelectedPageNumber(1);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setSelectedChapterId(chapter.id);
                                setSelectedPageNumber(1);
                              }
                            }}
                            className="flex cursor-pointer items-center justify-between p-3"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                Chapter {chapter.number}: {chapter.title}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{chapter.pages?.length ?? 0} pages</span>
                                <span>•</span>
                                <span>
                                  {chapter.audio ? "Audio added" : "No audio"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`size-4 text-muted-foreground transition-transform ${
                                isSelected ? "rotate-90 text-primary" : ""
                              }`}
                            />
                          </div>

                          {/* Expanded pages in this chapter */}
                          {isSelected ? (
                            <div className="border-t bg-muted/20 p-2 space-y-1">
                              {chapter.pages?.map((p) => {
                                const isPageSelected = p.number === selectedPageNumber;
                                return (
                                  <div
                                    key={p.number}
                                    onClick={() => setSelectedPageNumber(p.number)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") setSelectedPageNumber(p.number);
                                    }}
                                    className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                                      isPageSelected
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "hover:bg-muted text-foreground"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText className="size-3.5 shrink-0" />
                                      <span className="font-semibold">
                                        Page {p.number < 10 ? `0${p.number}` : p.number}
                                      </span>
                                      <span className="truncate opacity-80">
                                        {p.bodyText ? `— ${p.bodyText}` : ""}
                                      </span>
                                    </div>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-6 text-current hover:bg-black/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handleDeletePage(p.number);
                                      }}
                                      aria-label={`Delete Page ${p.number}`}
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>
                                );
                              })}

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void handleAddPage()}
                                className="mt-2 w-full text-xs"
                              >
                                <Plus className="size-3.5" />
                                Add Page
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column: Page Content Details Panel */}
            <div className="space-y-4 lg:col-span-5">
              <PageEditorPanel
                key={`${activeChapter?.id ?? "none"}-${activePage?.number ?? selectedPageNumber}`}
                storyId={id}
                chapter={activeChapter}
                page={activePage}
                pageNumber={selectedPageNumber}
              />
            </div>

            {/* Right Column: Chapter Audio Panel */}
            <div className="space-y-4 lg:col-span-3">
              <ChapterAudioPanel
                key={activeChapter?.id ?? "none"}
                storyId={id}
                chapter={activeChapter}
              />
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStep("details")}
            >
              <ArrowLeft className="size-4" />
              Back to Details
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={statusUpdating}
                onClick={() => void handleSetStatus("DRAFT")}
              >
                {statusUpdating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Draft
              </Button>

              <Button
                type="button"
                disabled={statusUpdating}
                onClick={() => void handleSetStatus("PUBLISHED")}
              >
                {statusUpdating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Chapter Dialog */}
      <Dialog open={addChapterOpen} onOpenChange={setAddChapterOpen}>
        <DialogContent>
          <form onSubmit={handleAddChapter}>
            <DialogHeader>
              <DialogTitle>Add New Chapter</DialogTitle>
              <DialogDescription>
                Provide a title and optional number for this chapter.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="chapterTitle">Chapter Title *</Label>
                <Input
                  id="chapterTitle"
                  placeholder="e.g. The Girl Who Believed"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chapterNumber">Chapter Number (optional)</Label>
                <Input
                  id="chapterNumber"
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  value={newChapterNumber}
                  onChange={(e) => setNewChapterNumber(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddChapterOpen(false)}
                disabled={addingChapter}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addingChapter}>
                {addingChapter ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add Chapter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PageEditorPanel({
  storyId,
  chapter,
  page,
  pageNumber,
}: {
  storyId: string;
  chapter?: StoryChapter;
  page?: StoryChapterPage;
  pageNumber: number;
}) {
  const queryClient = useQueryClient();
  const [pageBodyText, setPageBodyText] = useState(page?.bodyText ?? "");
  const [pageImageUrl, setPageImageUrl] = useState<string | null>(page?.imageUrl ?? null);
  const [saving, setSaving] = useState(false);

  async function handleSavePage() {
    if (!chapter) return;
    const currentPages = chapter.pages ?? [];
    let updatedPages: { number: number; bodyText?: string; imageUrl?: string }[];

    const exists = currentPages.some((p) => p.number === pageNumber);
    if (exists) {
      updatedPages = currentPages.map((p) => {
        if (p.number === pageNumber) {
          return {
            number: p.number,
            bodyText: pageBodyText.trim() || undefined,
            imageUrl: pageImageUrl || undefined,
          };
        }
        return {
          number: p.number,
          bodyText: p.bodyText ?? undefined,
          imageUrl: p.imageUrl ?? undefined,
        };
      });
    } else {
      updatedPages = [
        ...currentPages.map((p) => ({
          number: p.number,
          bodyText: p.bodyText ?? undefined,
          imageUrl: p.imageUrl ?? undefined,
        })),
        {
          number: pageNumber,
          bodyText: pageBodyText.trim() || undefined,
          imageUrl: pageImageUrl || undefined,
        },
      ];
    }

    setSaving(true);
    try {
      await replacePages(chapter.id, updatedPages);
      toastSuccess({
        title: "Page saved",
        description: `Page ${pageNumber} content was saved.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-story", storyId] });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not save page content.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {chapter
            ? `Page ${pageNumber < 10 ? `0${pageNumber}` : pageNumber} · Content Details`
            : "Page Details"}
        </h3>
        {chapter ? (
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSavePage()}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save Page
          </Button>
        ) : null}
      </div>

      {chapter ? (
        <div className="space-y-4">
          <FileUploadDropzone
            purpose="PAGE_IMAGE"
            label="Upload Page Image (optional)"
            currentUrl={pageImageUrl}
            onUploaded={(url) => setPageImageUrl(url)}
            onClear={() => setPageImageUrl(null)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="pageText">Page Text</Label>
            <textarea
              id="pageText"
              rows={8}
              placeholder="Write the page text here..."
              value={pageBodyText}
              onChange={(e) => setPageBodyText(e.target.value)}
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Select or create a chapter first to edit page contents.
        </div>
      )}
    </div>
  );
}

function ChapterAudioPanel({
  storyId,
  chapter,
}: {
  storyId: string;
  chapter?: StoryChapter;
}) {
  const queryClient = useQueryClient();
  const [audioUrl, setAudioUrl] = useState<string | null>(chapter?.audio?.audioUrl ?? null);
  const [saving, setSaving] = useState(false);

  async function handleSaveAudio() {
    if (!chapter || !audioUrl) return;
    setSaving(true);
    try {
      await putAudio(chapter.id, { audioUrl });
      toastSuccess({
        title: "Audio saved",
        description: `Audio updated for Chapter ${chapter.number}.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-story", storyId] });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not save audio file.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {chapter
            ? `Chapter ${chapter.number} Audio`
            : "Chapter Audio"}
        </h3>
        {chapter && audioUrl ? (
          <Button
            type="button"
            size="sm"
            onClick={() => void handleSaveAudio()}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save Audio
          </Button>
        ) : null}
      </div>

      {chapter ? (
        <div className="space-y-4">
          <FileUploadDropzone
            purpose="CHAPTER_AUDIO"
            label="Upload Audio File (optional)"
            currentUrl={audioUrl}
            onUploaded={(url) => setAudioUrl(url)}
            onClear={() => setAudioUrl(null)}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Select a chapter to upload its audio file.
        </div>
      )}
    </div>
  );
}
