"use client";

import { useCallback, useMemo, useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { PromptEditor } from "@/components/PromptEditor";
import { TestRunner } from "@/components/TestRunner";
import { VersionHistory } from "@/components/VersionHistory";
import { aggregateFeedbackForVersion } from "@/lib/score";
import type {
  PromptVersion,
  RefineApiResponse,
  TestInputRow,
  TestRun,
} from "@/lib/types";

const EXAMPLE_PROMPT =
  "You are a helpful assistant. Answer briefly in bullet points. Stay factual; say when unsure.";
const EXAMPLE_INPUT = "What causes rainbows?";

export function PromptRefinerApp() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testInputs, setTestInputs] = useState<TestInputRow[]>(() => [
    { id: crypto.randomUUID(), value: "" },
  ]);
  const [promptVersionId, setPromptVersionId] = useState(() =>
    crypto.randomUUID(),
  );
  const [versionHistory, setVersionHistory] = useState<PromptVersion[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [refineResult, setRefineResult] = useState<RefineApiResponse | null>(
    null,
  );
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const runAllDisabled =
    !systemPrompt.trim() || !testInputs.some((i) => i.value.trim());

  const hasSubmittedFeedback = useMemo(
    () => testRuns.some((r) => r.feedbackSubmitted),
    [testRuns],
  );

  const showEmptyHint =
    testRuns.length === 0 &&
    !systemPrompt.trim() &&
    testInputs.every((t) => !t.value.trim());

  const handleTestInputChange = useCallback((index: number, value: string) => {
    setTestInputs((rows) => {
      const next = [...rows];
      const row = next[index];
      if (!row) return rows;
      next[index] = { ...row, value };
      return next;
    });
  }, []);

  const handleAddInput = useCallback(() => {
    setTestInputs((rows) => [...rows, { id: crypto.randomUUID(), value: "" }]);
  }, []);

  const handleRemoveTestInput = useCallback((index: number) => {
    setTestInputs((rows) => {
      if (rows.length <= 1) return rows;
      return rows.filter((_, i) => i !== index);
    });
  }, []);

  const handleRunAll = useCallback(async () => {
    const inputs = testInputs.map((s) => s.value.trim()).filter(Boolean);
    if (!systemPrompt.trim() || inputs.length === 0) return;

    const versionId = promptVersionId;
    const initialRuns: TestRun[] = inputs.map((input) => ({
      id: crypto.randomUUID(),
      promptVersionId: versionId,
      input,
      output: "",
      loading: true,
    }));
    setTestRuns(initialRuns);
    setRefineResult(null);
    setRefineError(null);

    const nextRuns = [...initialRuns];
    for (let i = 0; i < nextRuns.length; i++) {
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemPrompt,
            input: nextRuns[i].input,
          }),
        });
        const data = (await res.json()) as { output?: string; error?: string };
        if (!res.ok) {
          nextRuns[i] = {
            ...nextRuns[i],
            loading: false,
            error: data.error ?? `Request failed (${res.status})`,
          };
        } else {
          nextRuns[i] = {
            ...nextRuns[i],
            loading: false,
            output: data.output ?? "",
          };
        }
      } catch (e) {
        nextRuns[i] = {
          ...nextRuns[i],
          loading: false,
          error: e instanceof Error ? e.message : "Network error",
        };
      }
      setTestRuns([...nextRuns]);
    }
  }, [promptVersionId, systemPrompt, testInputs]);

  const handleSubmitFeedback = useCallback(
    (runId: string, rating: "good" | "bad", reason: string) => {
      setTestRuns((runs) =>
        runs.map((r) =>
          r.id === runId
            ? {
                ...r,
                feedback: { rating, reason },
                feedbackSubmitted: true,
              }
            : r,
        ),
      );
      setRefineResult(null);
    },
    [],
  );

  const handleGetSuggestion = useCallback(async () => {
    const feedback = testRuns
      .filter((r) => r.feedbackSubmitted && r.feedback)
      .map((r) => ({
        input: r.input,
        output: r.output,
        rating: r.feedback!.rating,
        reason: r.feedback!.reason,
      }));
    if (feedback.length === 0) return;

    setRefineLoading(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPrompt: systemPrompt,
          feedback,
        }),
      });
      const data = (await res.json()) as RefineApiResponse & { error?: string };
      if (!res.ok) {
        setRefineError(data.error ?? `Refine failed (${res.status})`);
        setRefineResult(null);
        return;
      }
      setRefineResult({
        newPrompt: data.newPrompt,
        explanation: data.explanation,
        diffs: data.diffs,
      });
    } catch (e) {
      setRefineError(e instanceof Error ? e.message : "Network error");
      setRefineResult(null);
    } finally {
      setRefineLoading(false);
    }
  }, [systemPrompt, testRuns]);

  const handleApplyDiff = useCallback(() => {
    if (!refineResult) return;
    const score = aggregateFeedbackForVersion(testRuns, promptVersionId);
    setVersionHistory((h) => [
      ...h,
      {
        id: promptVersionId,
        prompt: systemPrompt,
        createdAt: new Date(),
        score,
      },
    ]);
    setSystemPrompt(refineResult.newPrompt);
    setPromptVersionId(crypto.randomUUID());
    setRefineResult(null);
    setRefineError(null);
  }, [promptVersionId, refineResult, systemPrompt, testRuns]);

  const handleRestoreVersion = useCallback((version: PromptVersion) => {
    setSystemPrompt(version.prompt);
    setPromptVersionId(version.id);
  }, []);

  const fillExample = useCallback(() => {
    setSystemPrompt(EXAMPLE_PROMPT);
    setTestInputs([{ id: crypto.randomUUID(), value: EXAMPLE_INPUT }]);
  }, []);

  const emptyStateSlot = showEmptyHint ? (
    <div className="rounded-lg border border-dashed border-zinc-600 bg-zinc-900/50 p-4 text-sm text-zinc-400">
      <p className="mb-2 font-medium text-zinc-300">Get started</p>
      <p className="mb-3">
        Example system prompt:{" "}
        <span className="font-mono text-xs text-zinc-300">
          {EXAMPLE_PROMPT}
        </span>
      </p>
      <p className="mb-3">
        Example input:{" "}
        <span className="font-mono text-xs text-zinc-300">
          {EXAMPLE_INPUT}
        </span>
      </p>
      <button
        type="button"
        onClick={fillExample}
        className="rounded-md bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600"
      >
        Use example
      </button>
    </div>
  ) : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-10">
      <section className="min-w-0 flex-1 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Prompt Refiner
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Run sample inputs, rate outputs, then get a targeted prompt update.
          </p>
        </header>

        <PromptEditor
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          testInputs={testInputs}
          onTestInputChange={handleTestInputChange}
          onAddInput={handleAddInput}
          onRemoveTestInput={handleRemoveTestInput}
          onRunAll={handleRunAll}
          runAllDisabled={runAllDisabled}
          emptyStateSlot={emptyStateSlot}
        />

        <VersionHistory
          history={versionHistory}
          testRuns={testRuns}
          activePromptVersionId={promptVersionId}
          onRestore={handleRestoreVersion}
        />
      </section>

      <section className="min-w-0 flex-1 space-y-6 lg:max-w-xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Test runs
        </h2>
        <TestRunner
          runs={testRuns}
          onSubmitFeedback={handleSubmitFeedback}
        />

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!hasSubmittedFeedback || refineLoading}
            onClick={handleGetSuggestion}
            className="rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {refineLoading ? "Getting suggestion…" : "Get suggestion"}
          </button>
          {refineError && (
            <p className="text-sm text-rose-400">{refineError}</p>
          )}
        </div>

        {refineResult && (
          <DiffViewer
            explanation={refineResult.explanation}
            diffs={refineResult.diffs}
            onApply={handleApplyDiff}
          />
        )}
      </section>
    </div>
  );
}
