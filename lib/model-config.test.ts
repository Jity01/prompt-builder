import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
  isSupportedModel,
} from "./model-config";

test("default model is in the allowlist", () => {
  assert.equal(SUPPORTED_MODELS.includes(DEFAULT_MODEL), true);
});

test("isSupportedModel accepts configured models", () => {
  for (const model of SUPPORTED_MODELS) {
    assert.equal(isSupportedModel(model), true);
  }
});

test("isSupportedModel rejects unsupported values", () => {
  assert.equal(isSupportedModel("gpt-does-not-exist"), false);
  assert.equal(isSupportedModel(""), false);
  assert.equal(isSupportedModel(undefined), false);
  assert.equal(isSupportedModel(null), false);
});
