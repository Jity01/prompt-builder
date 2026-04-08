export const SUPPORTED_MODELS = [
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4.5-preview",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-3.5-turbo",
] as const;

export type SupportedModel = (typeof SUPPORTED_MODELS)[number];

export const DEFAULT_MODEL: SupportedModel = "gpt-4o";

export function isSupportedModel(value: unknown): value is SupportedModel {
  return (
    typeof value === "string" &&
    (SUPPORTED_MODELS as readonly string[]).includes(value)
  );
}
