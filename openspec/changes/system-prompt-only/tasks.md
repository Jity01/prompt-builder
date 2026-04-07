## 1. UI and state

- [x] 1.1 Remove `behaviorDescription` state, props, and textarea from `PromptEditor` and `PromptRefinerApp`
- [x] 1.2 Update empty-state helper: drop “behavior” example; adjust `showEmptyHint` and `fillExample()` to use only system prompt + test input(s)

## 2. API

- [x] 2.1 Update `app/api/refine/route.ts`: accept body without `behaviorDescription`; adjust meta-prompt so refinement uses `currentPrompt` and `feedback` only

## 3. Verify

- [x] 3.1 Run `npm run build` and smoke-test: run → feedback → get suggestion → apply diff
