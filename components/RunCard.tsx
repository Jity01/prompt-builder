"use client";

import { useId, useState } from "react";
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
  const feedbackGroupId = useId();
  const reasonFieldId = `${feedbackGroupId}-reason`;

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

  const canRate = !run.loading && !run.error;

  function handleSubmit() {
    if (!pendingRating) return;
    onSubmitFeedback(run.id, pendingRating, reason.trim());
    setPendingRating(null);
    setReason("");
  }

  const submitDisabled = !pendingRating || !reason.trim();

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

      {canRate && !submitted && (
        <fieldset className="mt-3 border-t border-zinc-800 pt-3">
          <legend className="text-sm font-semibold text-zinc-200">Feedback</legend>
          <p
            id={`${feedbackGroupId}-hint`}
            className="mt-1 text-xs text-zinc-500"
          >
            Say whether this output worked for you, then explain why. A written
            reason is required so refinement can use your signal.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={pendingRating === "good"}
              aria-label="Good output: this response met your expectations"
              onClick={() => setPendingRating("good")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                pendingRating === "good"
                  ? "border-emerald-500 bg-emerald-950/50 text-emerald-200"
                  : "border-zinc-600 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <span aria-hidden>👍</span>
              Good
            </button>
            <button
              type="button"
              aria-pressed={pendingRating === "bad"}
              aria-label="Bad output: this response did not meet your expectations"
              onClick={() => setPendingRating("bad")}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                pendingRating === "bad"
                  ? "border-rose-500 bg-rose-950/50 text-rose-200"
                  : "border-zinc-600 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <span aria-hidden>👎</span>
              Bad
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <label
              htmlFor={reasonFieldId}
              className="text-sm font-medium text-zinc-300"
            >
              Why was this output good or bad?
            </label>
            <textarea
              id={reasonFieldId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain what worked or what to fix…"
              rows={3}
              aria-required="true"
              aria-describedby={`${feedbackGroupId}-hint`}
              className="w-full resize-y rounded border border-zinc-600 bg-zinc-950 px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitDisabled}
              className="self-start rounded bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit feedback
            </button>
          </div>
        </fieldset>
      )}

      {submitted && run.feedback && (
        <p className="mt-3 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">Reason: </span>
          {run.feedback.reason}
        </p>
      )}
    </div>
  );
}
