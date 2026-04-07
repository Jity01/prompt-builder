"use client";

import type { DiffChunk } from "@/lib/types";

type DiffViewerProps = {
  explanation: string;
  diffs: DiffChunk[];
  onApply: () => void;
  disabled?: boolean;
};

export function DiffViewer({
  explanation,
  diffs,
  onApply,
  disabled,
}: DiffViewerProps) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-zinc-200">
        Diff suggestion
      </h3>
      <div className="mb-3 max-h-64 overflow-auto rounded border border-zinc-800 bg-zinc-950 font-mono text-xs leading-relaxed">
        {diffs.map((chunk, i) => {
          const lineClass =
            chunk.type === "added"
              ? "bg-emerald-950/80 text-emerald-100"
              : chunk.type === "removed"
                ? "bg-rose-950/80 text-rose-100"
                : "text-zinc-300";
          const prefix =
            chunk.type === "added" ? "+ " : chunk.type === "removed" ? "- " : "  ";
          return (
            <div key={i} className={`whitespace-pre-wrap px-2 py-0.5 ${lineClass}`}>
              <span className="select-none text-zinc-500">{prefix}</span>
              {chunk.text}
            </div>
          );
        })}
      </div>
      <p className="mb-3 text-sm text-zinc-400">{explanation}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={onApply}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Apply diff →
      </button>
    </div>
  );
}
