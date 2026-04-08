"use client";

import { useCallback, useMemo, useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { PromptEditor } from "@/components/PromptEditor";
import { TestRunner } from "@/components/TestRunner";
import { VersionHistory } from "@/components/VersionHistory";
import {
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
  type SupportedModel,
} from "@/lib/model-config";
import { aggregateFeedbackForVersion } from "@/lib/score";
import type {
  AutoRefineResponse,
  AutomationState,
  PromptRefinePhase,
  PromptVersion,
  RefineApiResponse,
  TestInputRow,
  TestRun,
} from "@/lib/types";

const EXAMPLE_TASK =
  "Answer science questions briefly and accurately; use plain language.";
const EXAMPLE_PROMPT =
  "You are a helpful assistant. Answer briefly in bullet points. Stay factual; say when unsure.";
const EXAMPLE_INPUT = "What causes rainbows?";
const EXAMPLE_EXPECTED =
  "Sunlight enters water droplets; light refracts, reflects inside the droplet, and disperses into colors we see as an arc.";

function emptyRow(): TestInputRow {
  return { id: crypto.randomUUID(), value: "", expectedOutput: "" };
}

export function PromptRefinerApp() {
  const [taskDescription, setTaskDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [testInputs, setTestInputs] = useState<TestInputRow[]>(() => [
    emptyRow(),
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
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [phase, setPhase] = useState<PromptRefinePhase>("auto_critic");
  const [automationState, setAutomationState] = useState<AutomationState>("idle");
  const [threshold, setThreshold] = useState(0.8);
  const [maxIterations, setMaxIterations] = useState(5);
  const [autoStatus, setAutoStatus] = useState<string | null>(null);
  const [autoError, setAutoError] = useState<string | null>(null);
  const [autoScoreTrend, setAutoScoreTrend] = useState<number[]>([]);
  const [autoIteration, setAutoIteration] = useState(0);
  const [autoAbortController, setAutoAbortController] =
    useState<AbortController | null>(null);
  const [selectedModel, setSelectedModel] =
    useState<SupportedModel>(DEFAULT_MODEL);
  const [activeResultsModel, setActiveResultsModel] =
    useState<SupportedModel | null>(null);

  const runAllDisabled =
    !systemPrompt.trim() || !testInputs.some((i) => i.value.trim());

  const generateDisabled = useMemo(() => {
    const taskOk = taskDescription.trim().length > 0;
    const hasCompletePair = testInputs.some(
      (r) => r.value.trim() && r.expectedOutput.trim(),
    );
    return !taskOk || !hasCompletePair;
  }, [taskDescription, testInputs]);

  const hasSubmittedFeedback = useMemo(
    () => testRuns.some((r) => r.feedbackSubmitted),
    [testRuns],
  );
  const hasExpectedRuns = useMemo(
    () =>
      testRuns.some(
        (r) => !r.loading && !r.error && r.expectedOutput && r.expectedOutput.trim(),
      ),
    [testRuns],
  );

  const showEmptyHint =
    testRuns.length === 0 &&
    !systemPrompt.trim() &&
    !taskDescription.trim() &&
    testInputs.every((t) => !t.value.trim() && !t.expectedOutput.trim());

  const handleTestInputChange = useCallback((index: number, value: string) => {
    setTestInputs((rows) => {
      const next = [...rows];
      const row = next[index];
      if (!row) return rows;
      next[index] = { ...row, value };
      return next;
    });
  }, []);

  const handleExpectedOutputChange = useCallback(
    (index: number, value: string) => {
      setTestInputs((rows) => {
        const next = [...rows];
        const row = next[index];
        if (!row) return rows;
        next[index] = { ...row, expectedOutput: value };
        return next;
      });
    },
    [],
  );

  const handleAddInput = useCallback(() => {
    setTestInputs((rows) => [...rows, emptyRow()]);
  }, []);

  const handleRemoveTestInput = useCallback((index: number) => {
    setTestInputs((rows) => {
      if (rows.length <= 1) return rows;
      return rows.filter((_, i) => i !== index);
    });
  }, []);

  const handleGenerateSystemPrompt = useCallback(async () => {
    if (generateDisabled) return;
    const examples = testInputs
      .map((r) => ({
        input: r.value.trim(),
        expectedOutput: r.expectedOutput.trim(),
      }))
      .filter((e) => e.input && e.expectedOutput);
    if (!taskDescription.trim() || examples.length === 0) return;

    setGenerateLoading(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate-system-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskDescription: taskDescription.trim(),
          examples,
        }),
      });
      const data = (await res.json()) as { systemPrompt?: string; error?: string };
      if (!res.ok) {
        setGenerateError(data.error ?? `Generate failed (${res.status})`);
        return;
      }
      if (data.systemPrompt) {
        setSystemPrompt(data.systemPrompt);
      }
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerateLoading(false);
    }
  }, [generateDisabled, taskDescription, testInputs]);

  const handleRunAll = useCallback(async () => {
    const rowsToRun = testInputs.filter((s) => s.value.trim());
    if (!systemPrompt.trim() || rowsToRun.length === 0) return;

    const versionId = promptVersionId;
    const initialRuns: TestRun[] = rowsToRun.map((row) => ({
      id: crypto.randomUUID(),
      promptVersionId: versionId,
      input: row.value.trim(),
      expectedOutput: row.expectedOutput.trim() || undefined,
      output: "",
      loading: true,
    }));
    setTestRuns(initialRuns);
    setRefineResult(null);
    setRefineError(null);
    setAutoError(null);
    setAutoStatus(null);

    const nextRuns = [...initialRuns];
    for (let i = 0; i < nextRuns.length; i++) {
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemPrompt,
            input: nextRuns[i].input,
            model: selectedModel,
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
    setActiveResultsModel(selectedModel);
  }, [promptVersionId, selectedModel, systemPrompt, testInputs]);

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
      .map((r) => {
        const base = {
          input: r.input,
          output: r.output,
          rating: r.feedback!.rating,
          reason: r.feedback!.reason,
        };
        const ex = r.expectedOutput?.trim();
        return ex
          ? { ...base, expectedOutput: ex }
          : base;
      });
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
          model: selectedModel,
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
  }, [selectedModel, systemPrompt, testRuns]);

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
    setPhase("manual_refine");
  }, [promptVersionId, refineResult, systemPrompt, testRuns]);

  const handleStartAutoRefine = useCallback(async () => {
    const runsForAuto = testRuns
      .filter((r) => !r.loading && !r.error && r.expectedOutput?.trim())
      .map((r) => ({
        input: r.input,
        output: r.output,
        expectedOutput: r.expectedOutput!,
      }));
    if (!systemPrompt.trim() || runsForAuto.length === 0) return;

    const controller = new AbortController();
    setAutoAbortController(controller);
    setAutomationState("running");
    setAutoError(null);
    setAutoStatus("Running auto-refine…");
    setAutoScoreTrend([]);
    setAutoIteration(0);

    try {
      const res = await fetch("/api/auto-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          taskDescription: taskDescription.trim(),
          currentPrompt: systemPrompt,
          runs: runsForAuto,
          threshold,
          maxIterations,
          model: selectedModel,
        }),
      });
      const data = (await res.json()) as
        | AutoRefineResponse
        | { error?: string; partial?: Partial<AutoRefineResponse> };

      if (!res.ok) {
        const partial = "partial" in data ? data.partial : undefined;
        const errorMessage =
          "error" in data ? data.error : undefined;
        if (partial?.finalPrompt) {
          setSystemPrompt(partial.finalPrompt);
        }
        setAutoError(errorMessage ?? `Auto-refine failed (${res.status})`);
        setAutomationState("stopped");
        setPhase("manual_refine");
        return;
      }

      const success = data as AutoRefineResponse;
      const trend = success.iterations.map((it) => it.aggregateScore);
      setAutoScoreTrend(trend);
      setAutoIteration(success.iterations.length);
      setAutoStatus(
        success.status === "threshold_met"
          ? "Auto-refine reached threshold. Handoff to manual refinement."
          : success.status === "cancelled"
            ? "Auto-refine cancelled."
            : "Auto-refine reached max iterations.",
      );

      const latest = success.iterations[success.iterations.length - 1];
      if (latest) {
        setTestRuns((runs) =>
          runs.map((r) => {
            const match = latest.runFeedback.find(
              (f) => f.input === r.input && f.output === r.output,
            );
            return match
              ? {
                  ...r,
                  autoScore: match.score,
                  autoMismatchReasons: match.mismatchReasons,
                  autoImprovementHints: match.improvementHints,
                }
              : r;
          }),
        );
      }

      if (success.finalPrompt && success.finalPrompt !== systemPrompt) {
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
        setSystemPrompt(success.finalPrompt);
        setPromptVersionId(crypto.randomUUID());
      }

      setAutomationState("stopped");
      setPhase("manual_refine");
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setAutoStatus("Auto-refine cancelled by user.");
      } else {
        setAutoError(e instanceof Error ? e.message : "Network error");
      }
      setAutomationState("stopped");
      setPhase("manual_refine");
    } finally {
      setAutoAbortController(null);
    }
  }, [
    maxIterations,
    promptVersionId,
    selectedModel,
    systemPrompt,
    taskDescription,
    testRuns,
    threshold,
  ]);

  const handleStopAutoRefine = useCallback(() => {
    autoAbortController?.abort();
    setAutomationState("stopped");
    setPhase("manual_refine");
  }, [autoAbortController]);

  const handleRestoreVersion = useCallback((version: PromptVersion) => {
    setSystemPrompt(version.prompt);
    setPromptVersionId(version.id);
  }, []);

  const fillExample = useCallback(() => {
    setTaskDescription(EXAMPLE_TASK);
    setSystemPrompt(EXAMPLE_PROMPT);
    setTestInputs([
      {
        id: crypto.randomUUID(),
        value: EXAMPLE_INPUT,
        expectedOutput: EXAMPLE_EXPECTED,
      },
    ]);
  }, []);

  const emptyStateSlot = showEmptyHint ? (
    <div className="rounded-lg border border-dashed border-zinc-600 bg-zinc-900/50 p-4 text-sm text-zinc-400">
      <p className="mb-2 font-medium text-zinc-300">Get started</p>
      <p className="mb-2">
        Add a short task, one or more input/expected-output pairs, then{" "}
        <strong className="text-zinc-300">Generate base system prompt</strong>.
        Edit the draft, <strong className="text-zinc-300">Run all</strong>, rate
        outputs, and use <strong className="text-zinc-300">Get suggestion</strong>{" "}
        to refine.
      </p>
      <p className="mb-1 text-xs text-zinc-500">Example task</p>
      <p className="mb-3 font-mono text-xs text-zinc-300">{EXAMPLE_TASK}</p>
      <p className="mb-1 text-xs text-zinc-500">Example pair</p>
      <p className="mb-1 font-mono text-xs text-zinc-300">
        In: {EXAMPLE_INPUT}
      </p>
      <p className="mb-3 font-mono text-xs text-zinc-300">
        Out: {EXAMPLE_EXPECTED}
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
            Define examples, draft a system prompt, then run, rate, and refine.
          </p>
        </header>

        <PromptEditor
          taskDescription={taskDescription}
          onTaskDescriptionChange={setTaskDescription}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          testInputs={testInputs}
          onTestInputChange={handleTestInputChange}
          onExpectedOutputChange={handleExpectedOutputChange}
          onAddInput={handleAddInput}
          onRemoveTestInput={handleRemoveTestInput}
          onGenerateSystemPrompt={handleGenerateSystemPrompt}
          generateDisabled={generateDisabled}
          generateLoading={generateLoading}
          generateError={generateError}
          onRunAll={handleRunAll}
          runAllDisabled={runAllDisabled}
          emptyStateSlot={emptyStateSlot}
          selectedModel={selectedModel}
          modelOptions={SUPPORTED_MODELS}
          onModelChange={setSelectedModel}
          activeResultsModel={activeResultsModel}
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
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3">
            <p className="text-sm font-semibold text-zinc-200">Auto-refine bootstrap</p>
            <p className="mb-3 mt-1 text-xs text-zinc-400">
              Let AI compare actual vs expected output and iterate prompt fixes until
              quality is close enough, then continue with manual feedback.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-zinc-400">
                Threshold
                <input
                  type="number"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  disabled={automationState === "running"}
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                />
              </label>
              <label className="text-xs text-zinc-400">
                Max iterations
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(Number(e.target.value))}
                  disabled={automationState === "running"}
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleStartAutoRefine}
                disabled={
                  automationState === "running" ||
                  !hasExpectedRuns ||
                  !systemPrompt.trim() ||
                  !taskDescription.trim()
                }
                className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start auto-refine
              </button>
              <button
                type="button"
                onClick={handleStopAutoRefine}
                disabled={automationState !== "running"}
                className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Stop
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Phase:{" "}
              <span className="font-medium text-zinc-300">
                {phase === "auto_critic" ? "auto_critic" : "manual_refine"}
              </span>{" "}
              • State:{" "}
              <span className="font-medium text-zinc-300">{automationState}</span>
            </p>
            {autoIteration > 0 ? (
              <p className="mt-1 text-xs text-zinc-400">
                Iterations: {autoIteration} • Score trend:{" "}
                {autoScoreTrend.map((s) => `${(s * 100).toFixed(0)}%`).join(" → ")}
              </p>
            ) : null}
            {autoStatus ? <p className="mt-1 text-xs text-indigo-300">{autoStatus}</p> : null}
            {autoError ? <p className="mt-1 text-xs text-rose-400">{autoError}</p> : null}
          </div>
          <button
            type="button"
            disabled={!hasSubmittedFeedback || refineLoading || automationState === "running"}
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
