import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveAutoRefineStatus,
  resolvePhaseAfterAutomation,
  validateAutoRefineConfig,
} from "./auto-refine.ts";

test("validateAutoRefineConfig rejects invalid threshold", () => {
  assert.equal(validateAutoRefineConfig(0, 3), "threshold must be > 0 and <= 1.");
  assert.equal(validateAutoRefineConfig(1.2, 3), "threshold must be > 0 and <= 1.");
});

test("validateAutoRefineConfig rejects invalid maxIterations", () => {
  assert.equal(
    validateAutoRefineConfig(0.8, 0),
    "maxIterations must be an integer between 1 and 10.",
  );
  assert.equal(
    validateAutoRefineConfig(0.8, 12),
    "maxIterations must be an integer between 1 and 10.",
  );
});

test("resolveAutoRefineStatus order", () => {
  assert.equal(
    resolveAutoRefineStatus({
      aborted: true,
      score: 0.9,
      threshold: 0.8,
      iteration: 1,
      maxIterations: 5,
    }),
    "cancelled",
  );
  assert.equal(
    resolveAutoRefineStatus({
      aborted: false,
      score: 0.81,
      threshold: 0.8,
      iteration: 2,
      maxIterations: 5,
    }),
    "threshold_met",
  );
  assert.equal(
    resolveAutoRefineStatus({
      aborted: false,
      score: 0.4,
      threshold: 0.8,
      iteration: 5,
      maxIterations: 5,
    }),
    "max_iterations",
  );
});

test("resolvePhaseAfterAutomation hands off to manual", () => {
  assert.equal(resolvePhaseAfterAutomation("threshold_met"), "manual_refine");
  assert.equal(resolvePhaseAfterAutomation("max_iterations"), "manual_refine");
  assert.equal(resolvePhaseAfterAutomation("cancelled"), "manual_refine");
});
