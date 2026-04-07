"use client";

type PromptEditorProps = {
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  testInputs: string[];
  onTestInputChange: (index: number, value: string) => void;
  onAddInput: () => void;
  onRunAll: () => void;
  runAllDisabled: boolean;
  emptyStateSlot?: React.ReactNode;
};

export function PromptEditor({
  systemPrompt,
  onSystemPromptChange,
  testInputs,
  onTestInputChange,
  onAddInput,
  onRunAll,
  runAllDisabled,
  emptyStateSlot,
}: PromptEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      {emptyStateSlot}

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

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">Test inputs</label>
          <button
            type="button"
            onClick={onAddInput}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            + Add input
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {testInputs.map((value, index) => (
            <input
              key={index}
              type="text"
              value={value}
              onChange={(e) => onTestInputChange(index, e.target.value)}
              placeholder={`Input ${index + 1}`}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          ))}
        </div>
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
