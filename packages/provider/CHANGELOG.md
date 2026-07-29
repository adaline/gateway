# @adaline/provider

## 1.10.6

### Patch Changes

- 173dbff: Add the latest provider models and correct spec/pricing drift (verified against official provider pages, 2026-07-29).

  Added:

  - Anthropic: `claude-opus-5` (1M context, 128K output, adaptive thinking).
  - Bedrock: `anthropic.claude-opus-5` and `anthropic.claude-fable-5` — the fable-5 gap from the previous sync is closed (AWS pricing confirmed at $10/$50 via the AWS pricing feed; requires the provider_data_share opt-in).
  - Google: `gemini-3.6-flash`, `gemini-3.5-flash-lite` (both GA 2026-07-21).
  - Vertex: wrappers for both new Gemini models.
  - xAI: newly documented reasoning-effort controls for `grok-4.5` (low/medium/high, default high) and `grok-4.20-multi-agent-0309` (low/medium/high/xhigh, selecting agent count).

  Fixed:

  - OpenAI gpt-5.6 family: usable input corrected to 922K (was the 1.05M total context window); long-context pricing tiers added for `gpt-5.6-sol` and `gpt-5.6-luna`; reasoning-effort enum gains `max`.
  - Google: `gemini-embedding-001` deprecation annotation corrected — shutdown is 2028-05-14, not 2026-07-14 (release-date misread in the previous sync).
  - Vertex: `gemini-3.1-pro-preview`(+customtools) output pricing was understated ($8/$12 → $12/$18; >200K input $3.5 → $4).
  - Groq: `openai/gpt-oss-120b` was priced at gpt-oss-20b's rates ($0.075/$0.30 → $0.15/$0.60); documented max-output corrections for qwen3.6-27b (16,384) and the gpt-oss family (65,536).
  - Bedrock: `anthropic.claude-opus-4-8` $6/$30 → $5/$25; `anthropic.claude-3-5-haiku` $1/$5 → $0.80/$4.00 (standard on-demand rate, not latency-optimized).
  - Provider: `SelectStringConfigItem` def accepts `default: null` for params whose upstream documents no default.

## 1.10.5

### Patch Changes

- ab5f7df: Add current-generation Voyage embedding models and full embedding pricing + config support.

  - New models registered under the Anthropic provider: `voyage-3.5`, `voyage-3.5-lite`, `voyage-3-large`, `voyage-code-3` (32K context; default output dimension 1024, configurable to 256/512/1024/2048).
  - Embedding-model pricing: new `EmbeddingModelPrice` type (`@adaline/types`), a `price` field on `EmbeddingModelSchema` and a now-required `getModelPricing()` on `EmbeddingModelV1` (`@adaline/provider`), and per-model USD-per-1M-token pricing for all ten Voyage models.
  - `getModelPricing()` is now required on every embedding model. Every provider implements it: OpenAI, Google, Vertex and Together AI return per-model pricing (Together AI does a runtime model-name lookup and throws for unknown models, like its chat models), while Azure throws "Pricing configuration not supported azure provider." (mirroring its chat models).
  - Embedding config now supports `output_dimension` and `output_dtype` (float/int8/uint8/binary/ubinary) on the flexible-dimension models, in addition to `input_type`, `encoding_format`, and `truncation`. `output_dimension` is forwarded to the Voyage API as an integer.

  Fully backwards compatible: legacy fixed-dimension models keep their existing config (no `output_dimension`/`output_dtype`), `EmbeddingModelSchema.price` is runtime-permissive so dynamic base schemas can omit it, and existing `getEmbeddings` calls are unaffected.

- Updated dependencies [ab5f7df]
  - @adaline/types@1.15.1

## 1.10.4

### Patch Changes

- Updated dependencies [4f55295]
  - @adaline/types@1.15.0

## 1.10.3

### Patch Changes

- 48702e8: Fix top dependabot vulnerabilities
- Updated dependencies [48702e8]
  - @adaline/types@1.14.1

## 1.10.2

### Patch Changes

- 5b21690: Remove the redundant 'type' union on 'search-result' modality, not a discriminanted union anynmore
- Updated dependencies [5b21690]
  - @adaline/types@1.14.0

## 1.10.1

### Patch Changes

- Updated dependencies [3cab885]
  - @adaline/types@1.13.0

## 1.10.0

### Minor Changes

- ba6ea54: Implement retry with delay (response based) + jitter in case of 429 errors

## 1.9.0

### Minor Changes

- f50ecbb: add thoughtsignature

### Patch Changes

- Updated dependencies [f50ecbb]
  - @adaline/types@1.12.0

## 1.8.0

### Minor Changes

- 8ffe29e: Add support for Google Search Tool across Gemini models

### Patch Changes

- Updated dependencies [8ffe29e]
  - @adaline/types@1.11.0

## 1.7.0

### Minor Changes

- 14d8a3d: bump minor version

### Patch Changes

- Updated dependencies [14d8a3d]
  - @adaline/types@1.10.0

## 1.6.0

### Minor Changes

- ac10b6b: Add PairedSelectConfigItem for Gemini's safety setting configurations.

## 1.5.1

### Patch Changes

- aa2f870: gpt5 config
- Updated dependencies [aa2f870]
  - @adaline/types@1.9.1

## 1.5.0

### Minor Changes

- fix
- 762415a: add mcp

### Patch Changes

- Updated dependencies
- Updated dependencies [762415a]
  - @adaline/types@1.9.0

## 1.4.0

### Minor Changes

- ce81194: Add file name in PDF modality

### Patch Changes

- Updated dependencies [ce81194]
  - @adaline/types@1.8.0

## 1.3.0

### Minor Changes

- 349b6d6: Update 'pdf' modality support across Gateway

### Patch Changes

- Updated dependencies [349b6d6]
  - @adaline/types@1.7.0

## 1.2.4

### Patch Changes

- Updated dependencies [7732146]
  - @adaline/types@1.6.0

## 1.2.3

### Patch Changes

- Updated dependencies [c7af267]
  - @adaline/types@1.5.0

## 1.2.2

### Patch Changes

- Updated dependencies [239ebe7]
  - @adaline/types@1.4.0

## 1.2.1

### Patch Changes

- Updated dependencies [84a5ff4]
  - @adaline/types@1.3.0

## 1.2.0

### Minor Changes

- bfa8adf: Add Claude 4 models, new docs

### Patch Changes

- Updated dependencies [bfa8adf]
  - @adaline/types@1.2.0

## 1.1.0

### Minor Changes

- fe8d747: Rename image modality media_type to mediaType

### Patch Changes

- Updated dependencies [fe8d747]
  - @adaline/types@1.1.0

## 1.0.0

### Major Changes

- e74908d: first stable, major release

### Patch Changes

- Updated dependencies [e74908d]
  - @adaline/types@1.0.0

## 0.25.0

### Minor Changes

- 4d02433: Add model pricing to all providers

### Patch Changes

- Updated dependencies [4d02433]
  - @adaline/types@0.23.0

## 0.24.0

### Minor Changes

- a17494d: Add unit tests, claude sonnet 3.7 extended thinking

### Patch Changes

- Updated dependencies [a17494d]
  - @adaline/types@0.22.0

## 0.23.0

### Minor Changes

- c0e688e: fixes

### Patch Changes

- Updated dependencies [c0e688e]
  - @adaline/types@0.21.0

## 0.22.0

### Minor Changes

- c3ac896: fixes

### Patch Changes

- Updated dependencies [c3ac896]
  - @adaline/types@0.20.0

## 0.21.0

### Minor Changes

- 1936d9b: First release for custom provider, abortSignal in stream

### Patch Changes

- Updated dependencies [1936d9b]
  - @adaline/types@0.19.0

## 0.20.0

### Minor Changes

- ab5b072: fixes

### Patch Changes

- Updated dependencies [ab5b072]
  - @adaline/types@0.18.0

## 0.19.0

### Minor Changes

- 749462f: minor changes

### Patch Changes

- Updated dependencies [749462f]
  - @adaline/types@0.17.0

## 0.18.0

### Minor Changes

- 2b8b3a0: Pre-release for Gateway Proxy Service

### Patch Changes

- Updated dependencies [2b8b3a0]
  - @adaline/types@0.16.0
