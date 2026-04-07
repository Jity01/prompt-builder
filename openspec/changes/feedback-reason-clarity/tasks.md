## 1. Run card feedback UI

- [x] 1.1 Refactor `RunCard` to always show the feedback block (title, helper, Good/Bad, reason textarea, submit) when feedback is not submitted
- [x] 1.2 Wire `aria-pressed` / labels so Good and Bad toggles and the reason field are clearly named for assistive tech
- [x] 1.3 Keep submit disabled until rating selected and reason non-empty; preserve post-submit border colors and “Reason:” display

## 2. Verify

- [x] 2.1 Smoke-test in browser: reason visible without clicking thumb; submit only when both present; Get suggestion still enables with ≥1 submitted feedback
