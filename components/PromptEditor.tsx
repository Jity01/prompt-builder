"use client";

import type { TestInputRow } from "@/lib/types";

type PromptEditorProps = {
  taskDescription: string;
  onTaskDescriptionChange: (v: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  testInputs: TestInputRow[];
  onTestInputChange: (index: number, value: string) => void;
  onExpectedOutputChange: (index: number, value: string) => void;
  onAddInput: () => void;
  onRemoveTestInput: (index: number) => void;
  onGenerateSystemPrompt: () => void;
  generateDisabled: boolean;
  generateLoading: boolean;
  generateError: string | null;
  onRunAll: () => void;
  runAllDisabled: boolean;
  emptyStateSlot?: React.ReactNode;
};

export function PromptEditor({
  taskDescription,
  onTaskDescriptionChange,
  systemPrompt,
  onSystemPromptChange,
  testInputs,
  onTestInputChange,
  onExpectedOutputChange,
  onAddInput,
  onRemoveTestInput,
  onGenerateSystemPrompt,
  generateDisabled,
  generateLoading,
  generateError,
  onRunAll,
  runAllDisabled,
  emptyStateSlot,
}: PromptEditorProps) {
  const canRemoveRow = testInputs.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {emptyStateSlot}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          What the model should do
        </label>
        <textarea
          value={taskDescription}
          onChange={(e) => onTaskDescriptionChange(e.target.value)}
          placeholder="Describe the task in plain language (used to draft a system prompt from your examples)"
          rows={3}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            Input / output examples
          </label>
          <button
            type="button"
            onClick={onAddInput}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            + Add row
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {testInputs.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3"
            >
              <div className="mb-2 flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Input
                  </label>
                  <textarea
                    value={row.value}
                    onChange={(e) => onTestInputChange(index, e.target.value)}
                    placeholder={`Input ${index + 1}`}
                    rows={3}
                    className="min-h-[4.5rem] w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                {canRemoveRow ? (
                  <button
                    type="button"
                    onClick={() => onRemoveTestInput(index)}
                    className="shrink-0 rounded-lg border border-zinc-600 px-2.5 py-1.5 text-sm leading-none text-zinc-400 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                    aria-label={`Remove example row ${index + 1}`}
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Expected output
                </label>
                <textarea
                  value={row.expectedOutput}
                  onChange={(e) =>
                    onExpectedOutputChange(index, e.target.value)
                  }
                  placeholder="What you want the model to return for this input"
                  rows={3}
                  className="min-h-[4.5rem] w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={generateDisabled || generateLoading}
          onClick={onGenerateSystemPrompt}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700/80 bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {generateLoading ? "Generating…" : "Generate base system prompt"}
        </button>
        {generateError ? (
          <p className="text-sm text-rose-400">{generateError}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          System prompt
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          placeholder="The system prompt you are refining"
          rows={10}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <button
        type="button"
        disabled={runAllDisabled}
        onClick={onRunAll}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ▶ Run all
      </button>
    </div>
  );
}
