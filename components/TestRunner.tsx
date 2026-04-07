"use client";

import type { TestRun } from "@/lib/types";
import { RunCard } from "@/components/RunCard";

type TestRunnerProps = {
  runs: TestRun[];
  onSubmitFeedback: (
    runId: string,
    rating: "good" | "bad",
    reason: string,
  ) => void;
};

export function TestRunner({ runs, onSubmitFeedback }: TestRunnerProps) {
  if (runs.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Run all test inputs to see outputs here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {runs.map((run) => (
        <RunCard key={run.id} run={run} onSubmitFeedback={onSubmitFeedback} />
      ))}
    </div>
  );
}
