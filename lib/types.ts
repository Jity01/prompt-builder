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
