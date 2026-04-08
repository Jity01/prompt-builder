import type { SupportedModel } from "@/lib/model-config";

export type TestInputRow = {
  id: string;
  /** User message sent to the model for this row */
  value: string;
  /** Desired output for this input (exemplar) */
  expectedOutput: string;
};

export type PromptVersion = {
  id: string;
  prompt: string;
  createdAt: Date;
  score?: { good: number; bad: number };
};

export type TestRun = {
  id: string;
  promptVersionId: string;
  input: string;
  /** Exemplar output from the example row (optional if user left it blank) */
  expectedOutput?: string;
  output: string;
  feedback?: {
    rating: "good" | "bad";
    reason: string;
  };
  /** True after user submits thumbs + reason */
  feedbackSubmitted?: boolean;
  /** Auto-critic similarity score for the latest evaluation cycle */
  autoScore?: number;
  /** Auto-critic mismatch reasons for this run */
  autoMismatchReasons?: string[];
  /** Auto-critic prompt-improvement hints for this run */
  autoImprovementHints?: string[];
  loading?: boolean;
  error?: string;
};

export type DiffChunk = {
  type: "added" | "removed" | "unchanged";
  text: string;
};

export type PromptDiff = {
  explanation: string;
  before: string;
  after: string;
  changes: DiffChunk[];
};

export type RefineApiResponse = {
  newPrompt: string;
  explanation: string;
  diffs: DiffChunk[];
};

export type RefineFeedbackItem = {
  input: string;
  output: string;
  expectedOutput?: string;
  rating: "good" | "bad";
  reason: string;
};

export type RunRequestBody = {
  systemPrompt?: string;
  input?: string;
  model?: SupportedModel;
};

export type RefineRequestBody = {
  currentPrompt?: string;
  feedback?: RefineFeedbackItem[];
  model?: SupportedModel;
};

export type AutoCriticRunFeedback = {
  input: string;
  output: string;
  expectedOutput: string;
  score: number;
  mismatchReasons: string[];
  improvementHints: string[];
};

export type AutoCriticEvaluation = {
  aggregateScore: number;
  summary: string;
  runs: AutoCriticRunFeedback[];
};

export type AutoRefineIteration = {
  iteration: number;
  aggregateScore: number;
  summary: string;
  runFeedback: AutoCriticRunFeedback[];
  refineExplanation: string;
};

export type AutoRefineStatus = "threshold_met" | "max_iterations" | "cancelled";

export type AutoRefineResponse = {
  status: AutoRefineStatus;
  finalPrompt: string;
  finalScore: number;
  iterations: AutoRefineIteration[];
};

export type PromptRefinePhase = "auto_critic" | "manual_refine";
export type AutomationState = "idle" | "running" | "stopped";
