---
"@adaline/anthropic": minor
"@adaline/bedrock": minor
"@adaline/types": minor
---

Parity sync 2026-11-20 for Claude on the Claude API and AWS Bedrock (verified against Anthropic's models, pricing, thinking and effort docs, AWS model cards and the AWS pricing feed).

**Adaptive thinking and effort (fixes broken thinking on current models).** Claude Opus 4.7, Opus 4.8 and every Claude 5.x model reject `thinking: { type: "enabled", budget_tokens }` with a 400 error, so these models now use a new `adaptiveThinking` config:

- `thinkingMode` → `thinking: { type: "adaptive", display: "summarized" }`, `{ type: "disabled" }` or `{ type: "between_tools" }`, limited to the values each model accepts.
- `reasoningEffort` → `output_config.effort` (`low`/`medium`/`high`/`xhigh`/`max`, per-model levels and defaults).
- `temperature` / `topP` / `topK` are no longer offered on models that reject non-default sampling values.
- `toolChoice` drops `any` and named tools on models that reject forced tool use (Opus 5.5, Sonnet 5.5, Fable 5.1, Fable 5.2) and offers `auto` / `none`.
- Opus 4.6 and Sonnet 4.6 move from deprecated budget thinking to adaptive thinking. **Breaking:** pass `thinkingMode` / `reasoningEffort` instead of `reasoningEnabled` / `maxReasoningTokens` for these models.
- Opus 4.5 keeps budget thinking and gains the `reasoningEffort` control.

**Stop reason.** `ChatResponse` and `PartialChatResponse` gain an optional `stopReason` string, and `mergePartialMessages` carries the last one reported. Anthropic and Bedrock populate it from `stop_reason`, so a `"refusal"` (HTTP 200 from the dual-use classifiers on Fable 5.x / Opus 5.5) can be told apart from an ordinary completion.

Added:

- Anthropic: `claude-fable-5-2`, `claude-fable-5-1`, `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5` (prompt-length tiered pricing), `voyage-code-4`.
- Bedrock: `anthropic.claude-fable-5-2`, `anthropic.claude-fable-5-1`, `anthropic.claude-opus-5-5`, `anthropic.claude-sonnet-5-5`, `anthropic.claude-haiku-5-5`. Bedrock Claude models now support thinking (adaptive or extended, matching the Claude API).
- Bedrock inference-profile prefixes `apac.`, `au.`, `jp.`, `ca.`, `in.` and `us-gov.` are now recognised.

Removed (Bedrock end of life) — **breaking** for consumers pinning these literals: `anthropic.claude-3-haiku-20240307-v1:0`, `anthropic.claude-3-5-haiku-20241022-v1:0`, `anthropic.claude-sonnet-4-20250514-v1:0`.

Corrected: `claude-sonnet-5` pricing $3/$15 → $2/$10 (the intro price became standard); `voyage-4-large` $0.18 → $0.12; Haiku 4.5 max output 8K → 64K with extended thinking; Sonnet 4.6 1M input / 128K output; Opus 4.6 and 4.7 1M input; Bedrock Opus 4.6 1M input and Haiku 4.5 64K output; descriptions and data-retention notes.
