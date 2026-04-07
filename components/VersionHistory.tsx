"use client";

import type { PromptVersion, TestRun } from "@/lib/types";
import { aggregateFeedbackForVersion } from "@/lib/score";

type VersionHistoryProps = {
  history: PromptVersion[];
  testRuns: TestRun[];
  activePromptVersionId: string;
  onRestore: (version: PromptVersion) => void;
};

export function VersionHistory({
  history,
  testRuns,
  activePromptVersionId,
  onRestore,
}: VersionHistoryProps) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Version chips appear after you apply a refinement (previous prompts are
        saved here).
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Version history
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((v, index) => {
          const label = `v${index + 1}`;
          const score =
            v.score ?? aggregateFeedbackForVersion(testRuns, v.id);
          const isActive = v.id === activePromptVersionId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onRestore(v)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-200"
                  : "border-zinc-600 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {label}
              <span className="ml-1 text-zinc-500">
                · {score.good}👍 {score.bad}👎
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
