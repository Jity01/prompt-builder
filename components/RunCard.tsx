"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { TestRun } from "@/lib/types";

type RunCardProps = {
  run: TestRun;
  onSubmitFeedback: (
    runId: string,
    rating: "good" | "bad",
    reason: string,
  ) => void;
};

export function RunCard({ run, onSubmitFeedback }: RunCardProps) {
  const [pendingRating, setPendingRating] = useState<"good" | "bad" | null>(
    null,
  );
  const [reason, setReason] = useState("");

  const submitted = run.feedbackSubmitted;
  const borderClass = submitted
    ? run.feedback?.rating === "good"
      ? "border-emerald-600 ring-1 ring-emerald-900/50"
      : "border-rose-600 ring-1 ring-rose-900/50"
    : "border-zinc-700";

  function handleSubmit() {
    if (!pendingRating) return;
    onSubmitFeedback(run.id, pendingRating, reason.trim());
    setPendingRating(null);
    setReason("");
  }

  return (
    <div
      className={`rounded-lg border bg-zinc-900/80 p-3 ${borderClass}`}
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Input
      </div>
      <pre className="mb-3 whitespace-pre-wrap rounded bg-zinc-950 p-2 text-sm text-zinc-200">
        {run.input}
      </pre>

      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Output
      </div>
      <div className="prose prose-invert prose-sm mb-3 max-w-none">
        {run.loading ? (
          <p className="text-zinc-400">Running…</p>
        ) : run.error ? (
          <p className="text-rose-400">{run.error}</p>
        ) : (
          <ReactMarkdown>{run.output}</ReactMarkdown>
        )}
      </div>

      {!submitted && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPendingRating("good")}
            className={`rounded-lg border px-2 py-1 text-sm ${
              pendingRating === "good"
                ? "border-emerald-500 bg-emerald-950/50 text-emerald-200"
                : "border-zinc-600 text-zinc-300 hover:border-zinc-500"
            }`}
            aria-label="Good output"
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => setPendingRating("bad")}
            className={`rounded-lg border px-2 py-1 text-sm ${
              pendingRating === "bad"
                ? "border-rose-500 bg-rose-950/50 text-rose-200"
                : "border-zinc-600 text-zinc-300 hover:border-zinc-500"
            }`}
            aria-label="Bad output"
          >
            👎
          </button>
        </div>
      )}

      {pendingRating && !submitted && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why was this good or bad?"
            rows={2}
            className="w-full resize-y rounded border border-zinc-600 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="self-start rounded bg-zinc-700 px-3 py-1 text-sm text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit feedback
          </button>
        </div>
      )}

      {submitted && run.feedback && (
        <p className="mt-2 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">Reason: </span>
          {run.feedback.reason}
        </p>
      )}
    </div>
  );
}
