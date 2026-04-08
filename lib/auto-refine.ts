import type { AutoRefineStatus, PromptRefinePhase } from "@/lib/types";

export function validateAutoRefineConfig(threshold: number, maxIterations: number): string | null {
  if (!(threshold > 0 && threshold <= 1)) {
    return "threshold must be > 0 and <= 1.";
  }
  if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 10) {
    return "maxIterations must be an integer between 1 and 10.";
  }
  return null;
}

export function resolveAutoRefineStatus(params: {
  aborted: boolean;
  score: number;
  threshold: number;
  iteration: number;
  maxIterations: number;
}): AutoRefineStatus | null {
  const { aborted, score, threshold, iteration, maxIterations } = params;
  if (aborted) return "cancelled";
  if (score >= threshold) return "threshold_met";
  if (iteration >= maxIterations) return "max_iterations";
  return null;
}

export function resolvePhaseAfterAutomation(status: AutoRefineStatus): PromptRefinePhase {
  if (status === "threshold_met" || status === "cancelled" || status === "max_iterations") {
    return "manual_refine";
  }
  return "auto_critic";
}
