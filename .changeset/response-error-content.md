---
"@adaline/types": minor
---

feat(types): add response_error variant to ErrorContent modality

Providers can now surface model-level failures (incomplete responses, cancellations, non-safety errors) as content items instead of throwing. Existing SafetyErrorContent unchanged.

New helpers: `createResponseErrorContent`, `createPartialResponseErrorContent`, `createPartialResponseErrorMessage`. The `ErrorContent` and `PartialErrorContent` discriminated unions are extended with a new `response_error` variant carrying `{code, message, provider?}`.

`mergePartialMessages` now delta-concatenates the `message` field on consecutive `response_error` partials (keeping the first-seen `code` and `provider`), so streamed refusal text — e.g. OpenAI Responses API `response.refusal.delta` chunks — accumulates into one final `ResponseErrorContent` instead of being overwritten by the last chunk. `safety` partials continue to behave as complete, non-accumulating blocks (unchanged).
