# @adaline/types

## 1.16.0

### Minor Changes

- ab5da39: Parity sync 2026-11-20 for Claude on the Claude API and AWS Bedrock (verified against Anthropic's models, pricing, thinking and effort docs, AWS model cards and the AWS pricing feed).

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

## 1.15.1

### Patch Changes

- ab5f7df: Add current-generation Voyage embedding models and full embedding pricing + config support.

  - New models registered under the Anthropic provider: `voyage-3.5`, `voyage-3.5-lite`, `voyage-3-large`, `voyage-code-3` (32K context; default output dimension 1024, configurable to 256/512/1024/2048).
  - Embedding-model pricing: new `EmbeddingModelPrice` type (`@adaline/types`), a `price` field on `EmbeddingModelSchema` and a now-required `getModelPricing()` on `EmbeddingModelV1` (`@adaline/provider`), and per-model USD-per-1M-token pricing for all ten Voyage models.
  - `getModelPricing()` is now required on every embedding model. Every provider implements it: OpenAI, Google, Vertex and Together AI return per-model pricing (Together AI does a runtime model-name lookup and throws for unknown models, like its chat models), while Azure throws "Pricing configuration not supported azure provider." (mirroring its chat models).
  - Embedding config now supports `output_dimension` and `output_dtype` (float/int8/uint8/binary/ubinary) on the flexible-dimension models, in addition to `input_type`, `encoding_format`, and `truncation`. `output_dimension` is forwarded to the Voyage API as an integer.

  Fully backwards compatible: legacy fixed-dimension models keep their existing config (no `output_dimension`/`output_dtype`), `EmbeddingModelSchema.price` is runtime-permissive so dynamic base schemas can omit it, and existing `getEmbeddings` calls are unaffected.

## 1.15.0

### Minor Changes

- 4f55295:

## 1.14.1

### Patch Changes

- 48702e8: Fix top dependabot vulnerabilities

## 1.14.0

### Minor Changes

- 5b21690: Remove the redundant 'type' union on 'search-result' modality, not a discriminanted union anynmore

## 1.13.0

### Minor Changes

- 3cab885: Add web_search_options to OpenAI Provider

## 1.12.0

### Minor Changes

- f50ecbb: add thoughtsignature

## 1.11.0

### Minor Changes

- 8ffe29e: Add support for Google Search Tool across Gemini models

## 1.10.0

### Minor Changes

- 14d8a3d: bump minor version

## 1.9.1

### Patch Changes

- aa2f870: gpt5 config

## 1.9.0

### Minor Changes

- fix
- 762415a: add mcp

## 1.8.0

### Minor Changes

- ce81194: Add file name in PDF modality

## 1.7.0

### Minor Changes

- 349b6d6: Update 'pdf' modality support across Gateway

## 1.6.0

### Minor Changes

- 7732146: Support PDF modality content, add Google provider support

## 1.5.0

### Minor Changes

- c7af267: Update schema for tool request

## 1.4.0

### Minor Changes

- 239ebe7: Add proxyHeaders in tools for routing get responses request via a proxy

## 1.3.0

### Minor Changes

- 84a5ff4: support auto tool calls with custom tool api, proxy routing, telemetry, etc.

## 1.2.0

### Minor Changes

- bfa8adf: Add Claude 4 models, new docs

## 1.1.0

### Minor Changes

- fe8d747: Rename image modality media_type to mediaType

## 1.0.0

### Major Changes

- e74908d: first stable, major release

## 0.23.0

### Minor Changes

- 4d02433: Add model pricing to all providers

## 0.22.0

### Minor Changes

- a17494d: Add unit tests, claude sonnet 3.7 extended thinking

## 0.21.0

### Minor Changes

- c0e688e: fixes

## 0.20.0

### Minor Changes

- c3ac896: fixes

## 0.19.0

### Minor Changes

- 1936d9b: First release for custom provider, abortSignal in stream

## 0.18.0

### Minor Changes

- ab5b072: fixes

## 0.17.0

### Minor Changes

- 749462f: minor changes

## 0.16.0

### Minor Changes

- 2b8b3a0: Pre-release for Gateway Proxy Service
