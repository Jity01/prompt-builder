import type { TestRun } from "@/lib/types";

export function aggregateFeedbackForVersion(
  runs: TestRun[],
  promptVersionId: string,
): { good: number; bad: number } {
  let good = 0;
  let bad = 0;
  for (const r of runs) {
    if (r.promptVersionId !== promptVersionId || !r.feedbackSubmitted || !r.feedback) {
      continue;
    }
    if (r.feedback.rating === "good") good += 1;
    if (r.feedback.rating === "bad") bad += 1;
  }
  return { good, bad };
}
