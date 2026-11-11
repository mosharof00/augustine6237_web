export type AgeGroup = "6-9" | "10-13" | "adults";
export type AgeGroupEnum = "AGE_6_9" | "AGE_10_13" | "ADULTS";
export type PublishStatus = "DRAFT" | "PUBLISHED";
export type RoundType = "Q1_WARMUP" | "Q2_DEFENSE" | "Q3_HOBBY" | "Q4_FINALS";
export type QuestionType = "MCQ" | "FREE_TEXT" | "TRUE_FALSE";

export type McqQuestion = {
  id?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type WrittenQuestion = {
  id?: string;
  prompt: string;
  storyText: string;
  sampleAnswer: string;
};

export type StorySelection = {
  storyId: string;
  storyTitle: string;
  chapters: string;
};

export type GamePackFormData = {
  title: string;
  ageGroup: AgeGroup;
  status: PublishStatus;
  stories: StorySelection[];
  round1: McqQuestion[];
  round2: WrittenQuestion;
  round3: McqQuestion[];
  round4: McqQuestion[];
};

export type GamePackRow = {
  id: string;
  title: string;
  ageGroup: string;
  ageGroupLabel: string;
  status: PublishStatus;
  questionCount: number;
  storyCount: number;
  storiesSummary: string;
  createdAt: string;
  updatedAt: string;
};

export type GamePackDetailQuestion = {
  id: string;
  roundType: RoundType;
  sortOrder: number;
  type: QuestionType;
  prompt: string;
  optionsJson?: {
    options?: string[];
    correctIndex?: number;
    sampleAnswer?: string;
  };
  metaJson?: {
    storyText?: string;
    sampleAnswer?: string;
    chapter?: string;
    [key: string]: unknown;
  };
};

export type GamePackDetailStory = {
  id: string;
  storyId: string;
  story?: {
    id: string;
    title: string;
    coverUrl?: string;
    category?: string;
    ageGroup?: string;
    status?: string;
  };
};

export type GamePackDetail = {
  id: string;
  title: string;
  ageGroup: string;
  status: PublishStatus;
  schoolId?: string;
  createdById?: string;
  stories: GamePackDetailStory[];
  questions: GamePackDetailQuestion[];
  createdAt: string;
  updatedAt: string;
};

export const AVAILABLE_STORIES = [
  {
    id: "story-lantern-keeper",
    title: "The Lantern Keeper of Marrow Bay",
    ageGroup: "6-9",
    chapters: ["All Chapter", "Chapter 1", "Chapter 2", "Chapter 3"],
  },
  {
    id: "story-river-sings",
    title: "Why the River Sings",
    ageGroup: "6-9",
    chapters: ["All Chapter", "1,2", "Chapter 1", "Chapter 2"],
  },
  {
    id: "story-courage",
    title: "The Courage to Speak Up",
    ageGroup: "6-9",
    chapters: ["All Chapter", "Chapter 1", "Chapter 2"],
  },
  {
    id: "story-willow-creek",
    title: "Wings Over Willow Creek",
    ageGroup: "10-13",
    chapters: ["All Chapter", "Chapter 1", "Chapter 2", "Chapter 3"],
  },
  {
    id: "story-stand-tall",
    title: "Standing Tall Together",
    ageGroup: "adults",
    chapters: ["All Chapter", "Chapter 1"],
  },
];

export function formatAgeGroup(ag?: string): string {
  if (!ag) return "6–9";
  const s = ag.toLowerCase().replace(/_/g, "-");
  if (s.includes("6-9") || s.includes("6_9")) return "6–9";
  if (s.includes("10-13") || s.includes("10_13")) return "10–13";
  if (s.includes("adult")) return "Adults";
  return ag;
}

export function toAgeGroupEnum(ag?: string): AgeGroupEnum {
  if (!ag) return "AGE_6_9";
  const s = ag.toUpperCase().replace(/-/g, "_");
  if (s.includes("6_9")) return "AGE_6_9";
  if (s.includes("10_13")) return "AGE_10_13";
  if (s.includes("ADULT")) return "ADULTS";
  return "AGE_6_9";
}

export function toAgeGroupFormValue(ag?: string): AgeGroup {
  if (!ag) return "6-9";
  const s = ag.toLowerCase().replace(/_/g, "-");
  if (s.includes("6-9")) return "6-9";
  if (s.includes("10-13")) return "10-13";
  if (s.includes("adult")) return "adults";
  return "6-9";
}

export function createDefaultRound1Questions(): McqQuestion[] {
  return [
    {
      prompt: "What is the main role of a lighthouse keeper?",
      options: [
        "Guiding ships safely through coastal waters",
        "The Lantern Keeper of Marrow Bay",
        "Calm weather navigation",
        "Maintaining communication with the port",
      ],
      correctIndex: 0,
    },
    {
      prompt: "What helps ships find their way at night?",
      options: [
        "A lighthouse beam",
        "A street sign",
        "A campfire",
        "A window light",
      ],
      correctIndex: 0,
    },
    {
      prompt: "What can make sailing dangerous near the coast?",
      options: [
        "Calm weather",
        "Rocky shores",
        "Clear skies",
        "Bright sunshine",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Why is teamwork important during an emergency?",
      options: [
        "It helps people work together",
        "It makes tasks harder",
        "It wastes time",
        "It prevents communication",
      ],
      correctIndex: 0,
    },
  ];
}

export function createDefaultRound2Question(): WrittenQuestion {
  return {
    storyText:
      "Every night, an old keeper lit the lantern to guide ships through the foggy bay. One stormy evening, he spotted a tiny boat drifting toward the rocks. He raised the lantern high, guiding the boat safely to shore. From that night on, the people of Marrow Bay called him their guardian of the sea.",
    prompt: "How did the lantern keeper save the boat?",
    sampleAnswer:
      "The lantern keeper ensured the lighthouse remained lit, guiding ships safely through the dark waters of Marrow Bay.",
  };
}

export function createDefaultRound3Questions(): McqQuestion[] {
  return [
    {
      prompt: "What is the main role of a lighthouse keeper?",
      options: [
        "The Lantern Keeper of Marrow Bay",
        "The Lantern Keeper of Marrow Bay",
        "The Lantern Keeper of Marrow Bay",
        "The Lantern Keeper of Marrow Bay",
      ],
      correctIndex: 0,
    },
    {
      prompt: "What helps ships find their way at night?",
      options: [
        "A lighthouse beam",
        "A street sign",
        "A campfire",
        "A window light",
      ],
      correctIndex: 0,
    },
    {
      prompt: "What can make sailing dangerous near the coast?",
      options: [
        "Calm weather",
        "Rocky shores",
        "Clear skies",
        "Bright sunshine",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Why is teamwork important during an emergency?",
      options: [
        "It helps people work together",
        "It makes tasks harder",
        "It wastes time",
        "It prevents communication",
      ],
      correctIndex: 0,
    },
  ];
}

export function createDefaultRound4Questions(): McqQuestion[] {
  return [
    {
      prompt: "What is the main role of a lighthouse keeper?",
      options: [
        "The Lantern Keeper of Marrow Bay",
        "The Lantern Keeper of Marrow Bay",
        "The Lantern Keeper of Marrow Bay",
        "The Lantern Keeper of Marrow Bay",
      ],
      correctIndex: 0,
    },
    {
      prompt: "What helps ships find their way at night?",
      options: [
        "A lighthouse beam",
        "A street sign",
        "A campfire",
        "A window light",
      ],
      correctIndex: 0,
    },
    {
      prompt: "What can make sailing dangerous near the coast?",
      options: [
        "Calm weather",
        "Rocky shores",
        "Clear skies",
        "Bright sunshine",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Why is teamwork important during an emergency?",
      options: [
        "It helps people work together",
        "It makes tasks harder",
        "It wastes time",
        "It prevents communication",
      ],
      correctIndex: 0,
    },
  ];
}

export function createDefaultPackFormData(): GamePackFormData {
  return {
    title: "Anti-Bullying Game Pack",
    ageGroup: "6-9",
    status: "DRAFT",
    stories: [
      {
        storyId: "story-lantern-keeper",
        storyTitle: "The Lantern Keeper of Marrow Bay",
        chapters: "All Chapter",
      },
      {
        storyId: "story-river-sings",
        storyTitle: "Why the River Sings",
        chapters: "1,2",
      },
    ],
    round1: createDefaultRound1Questions(),
    round2: createDefaultRound2Question(),
    round3: createDefaultRound3Questions(),
    round4: createDefaultRound4Questions(),
  };
}

export const ROUND_STEPS = [
  {
    stepIndex: 0,
    roundNumber: 0,
    name: "Pack Details",
    title: "Create a New Game",
    subtitle:
      "Choose your stories, select chapters, and set the age group to create an engaging quiz experience.",
    badge: "Setup",
  },
  {
    stepIndex: 1,
    roundNumber: 1,
    roundType: "Q1_WARMUP" as RoundType,
    name: "Round -1",
    title: "Test Your Knowledge",
    subtitle: "Answer four multiple-choice questions to begin your adventure.",
    badge: "4 Questions · MCQ",
    description: "Answer four multiple-choice questions to begin your adventure.",
  },
  {
    stepIndex: 2,
    roundNumber: 2,
    roundType: "Q2_DEFENSE" as RoundType,
    name: "Round -2",
    title: "Story Challenge",
    subtitle: "Read the story carefully and answer the question based on what you discover.",
    badge: "1 Story · 1 Question",
    description: "Answer four multiple-choice questions to begin your adventure.",
  },
  {
    stepIndex: 3,
    roundNumber: 3,
    roundType: "Q3_HOBBY" as RoundType,
    name: "Round -3",
    title: "Think Beyond the Story",
    subtitle: "Use your understanding and reasoning skills to answer the question.",
    badge: "MCQ · 4 Options",
    description: "Answer four multiple-choice questions to begin your adventure.",
  },
  {
    stepIndex: 4,
    roundNumber: 4,
    roundType: "Q4_FINALS" as RoundType,
    name: "Round -4",
    title: "One Team. One Challenge.",
    subtitle: "Use your understanding and reasoning skills to answer the question.",
    badge: "MCQ · 4 Options",
    description: "Answer four multiple-choice questions to begin your adventure.",
  },
];

export function normalizeGamePackRow(raw: unknown, idx = 0): GamePackRow {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : `pack-${idx + 1}`;
  const title = typeof item.title === "string" ? item.title : `Game Pack #${idx + 1}`;
  const rawAge = typeof item.ageGroup === "string" ? item.ageGroup : (typeof item.age_group === "string" ? item.age_group : "AGE_6_9");
  const ageGroupLabel = formatAgeGroup(rawAge);
  const status: PublishStatus = item.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  
  const stories = Array.isArray(item.stories) ? item.stories : [];
  const storyCount = stories.length;
  const storyTitles = stories
    .map((s) => {
      if (s && typeof s === "object") {
        const obj = s as Record<string, unknown>;
        if (obj.story && typeof obj.story === "object") {
          const st = obj.story as Record<string, unknown>;
          return typeof st.title === "string" ? st.title : null;
        }
      }
      return null;
    })
    .filter(Boolean) as string[];

  const storiesSummary =
    storyTitles.length > 0
      ? storyTitles.slice(0, 2).join(", ") + (storyTitles.length > 2 ? ` +${storyTitles.length - 2}` : "")
      : storyCount > 0
      ? `${storyCount} stories`
      : "No stories linked";

  const questions = Array.isArray(item.questions) ? item.questions : [];
  const questionCount =
    typeof item.questionCount === "number"
      ? item.questionCount
      : questions.length;

  const createdAt = typeof item.createdAt === "string" ? item.createdAt : (typeof item.created_at === "string" ? item.created_at : new Date().toISOString());
  const updatedAt = typeof item.updatedAt === "string" ? item.updatedAt : (typeof item.updated_at === "string" ? item.updated_at : createdAt);

  return {
    id,
    title,
    ageGroup: rawAge,
    ageGroupLabel,
    status,
    questionCount,
    storyCount,
    storiesSummary,
    createdAt,
    updatedAt,
  };
}

export function normalizeGamePackDetail(raw: unknown): GamePackDetail {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const data = (obj.data && typeof obj.data === "object" ? obj.data : obj) as Record<string, unknown>;

  const id = typeof data.id === "string" ? data.id : "pack-1";
  const title = typeof data.title === "string" ? data.title : "Game Pack";
  const ageGroup = typeof data.ageGroup === "string" ? data.ageGroup : (typeof data.age_group === "string" ? data.age_group : "AGE_6_9");
  const status: PublishStatus = data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const schoolId = typeof data.schoolId === "string" ? data.schoolId : (typeof data.school_id === "string" ? data.school_id : undefined);
  const createdById = typeof data.createdById === "string" ? data.createdById : (typeof data.created_by_id === "string" ? data.created_by_id : undefined);

  const rawStories = Array.isArray(data.stories) ? data.stories : [];
  const stories: GamePackDetailStory[] = rawStories.map((s, idx) => {
    const sObj = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
    const stObj = (sObj.story && typeof sObj.story === "object" ? sObj.story : {}) as Record<string, unknown>;
    return {
      id: typeof sObj.id === "string" ? sObj.id : `story-ref-${idx}`,
      storyId: typeof sObj.storyId === "string" ? sObj.storyId : (typeof sObj.story_id === "string" ? sObj.story_id : ""),
      story: sObj.story
        ? {
            id: typeof stObj.id === "string" ? stObj.id : "",
            title: typeof stObj.title === "string" ? stObj.title : "Untitled Story",
            coverUrl: typeof stObj.coverUrl === "string" ? stObj.coverUrl : (typeof stObj.cover_url === "string" ? stObj.cover_url : undefined),
            category: typeof stObj.category === "string" ? stObj.category : undefined,
            ageGroup: typeof stObj.ageGroup === "string" ? stObj.ageGroup : (typeof stObj.age_group === "string" ? stObj.age_group : undefined),
            status: typeof stObj.status === "string" ? stObj.status : undefined,
          }
        : undefined,
    };
  });

  const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
  const questions: GamePackDetailQuestion[] = rawQuestions.map((q, idx) => {
    const qObj = (q && typeof q === "object" ? q : {}) as Record<string, unknown>;
    const rawRound = typeof qObj.roundType === "string" ? qObj.roundType : (typeof qObj.round_type === "string" ? qObj.round_type : "Q1_WARMUP");
    const roundType = (["Q1_WARMUP", "Q2_DEFENSE", "Q3_HOBBY", "Q4_FINALS"].includes(rawRound)
      ? rawRound
      : "Q1_WARMUP") as RoundType;

    const sortOrder = typeof qObj.sortOrder === "number" ? qObj.sortOrder : (typeof qObj.sort_order === "number" ? qObj.sort_order : idx + 1);
    const type = (typeof qObj.type === "string" ? qObj.type : "MCQ") as QuestionType;
    const prompt = typeof qObj.prompt === "string" ? qObj.prompt : "";

    const optionsJson = (qObj.optionsJson ?? qObj.options_json ?? {}) as Record<string, unknown>;
    const metaJson = (qObj.metaJson ?? qObj.meta_json ?? {}) as Record<string, unknown>;

    return {
      id: typeof qObj.id === "string" ? qObj.id : `q-${idx}`,
      roundType,
      sortOrder,
      type,
      prompt,
      optionsJson: {
        options: Array.isArray(optionsJson.options) ? (optionsJson.options as string[]) : undefined,
        correctIndex: typeof optionsJson.correctIndex === "number" ? optionsJson.correctIndex : undefined,
        sampleAnswer: typeof optionsJson.sampleAnswer === "string" ? optionsJson.sampleAnswer : undefined,
      },
      metaJson: metaJson as GamePackDetailQuestion["metaJson"],
    };
  });

  const createdAt = typeof data.createdAt === "string" ? data.createdAt : (typeof data.created_at === "string" ? data.created_at : new Date().toISOString());
  const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : (typeof data.updated_at === "string" ? data.updated_at : createdAt);

  return {
    id,
    title,
    ageGroup,
    status,
    schoolId,
    createdById,
    stories,
    questions,
    createdAt,
    updatedAt,
  };
}

export function detailToFormData(detail: GamePackDetail): GamePackFormData {
  const ageGroup = toAgeGroupFormValue(detail.ageGroup);
  const status = detail.status;

  const stories: StorySelection[] = detail.stories.map((s) => ({
    storyId: s.storyId || s.id,
    storyTitle: s.story?.title || "Story",
    chapters: "All Chapter",
  }));

  const round1Questions = detail.questions
    .filter((q) => q.roundType === "Q1_WARMUP")
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.optionsJson?.options?.length ? q.optionsJson.options : ["", "", "", ""],
      correctIndex: q.optionsJson?.correctIndex ?? 0,
    }));

  const round2Q = detail.questions.find((q) => q.roundType === "Q2_DEFENSE");
  const round2: WrittenQuestion = round2Q
    ? {
        id: round2Q.id,
        prompt: round2Q.prompt,
        storyText: round2Q.metaJson?.storyText || "",
        sampleAnswer:
          round2Q.metaJson?.sampleAnswer ||
          round2Q.optionsJson?.sampleAnswer ||
          "",
      }
    : createDefaultRound2Question();

  const round3Questions = detail.questions
    .filter((q) => q.roundType === "Q3_HOBBY")
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.optionsJson?.options?.length ? q.optionsJson.options : ["", "", "", ""],
      correctIndex: q.optionsJson?.correctIndex ?? 0,
    }));

  const round4Questions = detail.questions
    .filter((q) => q.roundType === "Q4_FINALS")
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.optionsJson?.options?.length ? q.optionsJson.options : ["", "", "", ""],
      correctIndex: q.optionsJson?.correctIndex ?? 0,
    }));

  return {
    title: detail.title,
    ageGroup,
    status,
    stories: stories.length > 0 ? stories : createDefaultPackFormData().stories,
    round1: round1Questions.length > 0 ? round1Questions : createDefaultRound1Questions(),
    round2,
    round3: round3Questions.length > 0 ? round3Questions : createDefaultRound3Questions(),
    round4: round4Questions.length > 0 ? round4Questions : createDefaultRound4Questions(),
  };
}

export function toSavePackPayload(
  data: GamePackFormData,
  statusOverride?: PublishStatus,
) {
  const status = statusOverride ?? data.status;
  const age_group = toAgeGroupEnum(data.ageGroup);
  const story_ids = data.stories.map((s) => s.storyId).filter(Boolean);

  const questions: Array<{
    round_type: RoundType;
    sort_order: number;
    type: QuestionType;
    prompt: string;
    options_json: Record<string, unknown>;
    meta_json?: Record<string, unknown>;
  }> = [];

  // Round 1
  data.round1.forEach((q, idx) => {
    questions.push({
      round_type: "Q1_WARMUP",
      sort_order: idx + 1,
      type: "MCQ",
      prompt: q.prompt.trim() || `Round 1 Question ${idx + 1}`,
      options_json: {
        options: q.options.map((opt) => opt.trim()),
        correctIndex: q.correctIndex,
      },
    });
  });

  // Round 2
  questions.push({
    round_type: "Q2_DEFENSE",
    sort_order: 1,
    type: "FREE_TEXT",
    prompt: data.round2.prompt.trim() || "Round 2 Question",
    options_json: {
      sampleAnswer: data.round2.sampleAnswer.trim(),
    },
    meta_json: {
      storyText: data.round2.storyText.trim(),
      sampleAnswer: data.round2.sampleAnswer.trim(),
    },
  });

  // Round 3
  data.round3.forEach((q, idx) => {
    questions.push({
      round_type: "Q3_HOBBY",
      sort_order: idx + 1,
      type: "MCQ",
      prompt: q.prompt.trim() || `Round 3 Question ${idx + 1}`,
      options_json: {
        options: q.options.map((opt) => opt.trim()),
        correctIndex: q.correctIndex,
      },
    });
  });

  // Round 4
  data.round4.forEach((q, idx) => {
    questions.push({
      round_type: "Q4_FINALS",
      sort_order: idx + 1,
      type: "MCQ",
      prompt: q.prompt.trim() || `Round 4 Question ${idx + 1}`,
      options_json: {
        options: q.options.map((opt) => opt.trim()),
        correctIndex: q.correctIndex,
      },
    });
  });

  return {
    title: data.title.trim(),
    age_group,
    status,
    story_ids,
    questions,
  };
}

export function validatePackForm(
  data: GamePackFormData,
  targetStatus: PublishStatus,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push("Game pack title is required.");
  }

  if (targetStatus === "PUBLISHED") {
    if (data.round1.length === 0 || data.round1.some((q) => !q.prompt.trim())) {
      errors.push("Round 1 requires complete question prompts.");
    }
    if (!data.round2.prompt.trim() || !data.round2.storyText.trim()) {
      errors.push("Round 2 requires both a story excerpt and question prompt.");
    }
    if (data.round3.length === 0 || data.round3.some((q) => !q.prompt.trim())) {
      errors.push("Round 3 requires complete question prompts.");
    }
    if (data.round4.length === 0 || data.round4.some((q) => !q.prompt.trim())) {
      errors.push("Round 4 requires complete question prompts.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const FALLBACK_GAME_PACKS: GamePackRow[] = [
  {
    id: "pack-lantern-keeper",
    title: "The Lantern Keeper Pack",
    ageGroup: "AGE_6_9",
    ageGroupLabel: "6–9",
    status: "PUBLISHED",
    questionCount: 13,
    storyCount: 2,
    storiesSummary: "The Lantern Keeper of Marrow Bay, Why the River Sings",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pack-courage-draft",
    title: "Courage & Upstanders Pack",
    ageGroup: "AGE_10_13",
    ageGroupLabel: "10–13",
    status: "DRAFT",
    questionCount: 9,
    storyCount: 1,
    storiesSummary: "Wings Over Willow Creek",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
