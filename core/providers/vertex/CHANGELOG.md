# @adaline/vertex

## 1.15.0

### Minor Changes

- 6209467: Remove models the providers no longer serve, per official deprecation/retirement pages (retrieved 2026-07-10).

  BREAKING (for consumers pinning these literals or importing their classes):

  - Anthropic: all Claude 3.x models and the Claude 4 20250514 snapshots (9 models, retired on the first-party API).
  - Google: the Gemini 1.5 and 2.0 families, `text-embedding-004`, `text-embedding-001` (13 models removed); the retired 2.5/3 preview models are unregistered from routing but their schemas remain exported for `@adaline/vertex` (4 models).
  - Vertex: the Gemini 1.5 and 2.0 families, `text-embedding-004`, `textembedding-gecko@003`, `textembedding-gecko-multilingual@001` (14 models).
  - Azure OpenAI: the GPT-3.5/GPT-4 legacy family and retired chat aliases (`gpt-5-chat-latest`, `gpt-5.2-chat-latest`, `chatgpt-5.2`, `chatgpt-4o-latest`) (13 models).
  - Bedrock: `anthropic.claude-3-opus-20240229-v1:0`, `anthropic.claude-opus-4-20250514-v1:0`.
  - Groq: `gemma2-9b-it`, `deepseek-r1-distill-llama-70b`, `moonshotai/kimi-k2-instruct(-0905)`, `meta-llama/llama-4-maverick-17b-128e-instruct`, `meta-llama/llama-guard-4-12b`.
  - xAI: the entire previous catalog (grok-2/grok-3/grok-4/grok-4.1-fast families and `grok-code-fast-1`, 14 models retired by xAI on 2026-05-15). Replacement models land in the follow-up release.

  Also:

  - Sweeps orphan pricing-only keys with no model files across google, vertex, groq, xai, and anthropic.
  - Vertex: `text-multilingual-embedding-002` had a model file but was never registered with the provider; now routable.
  - Bedrock: legacy models still served (Claude 3 Haiku/Sonnet, 3.5 Sonnet v1+v2, 3.7 Sonnet, Sonnet 4) are annotated with their AWS EOL dates.

### Patch Changes

- Updated dependencies [6209467]
  - @adaline/google@1.18.0

## 1.14.10

### Patch Changes

- Updated dependencies [28355f9]
  - @adaline/google@1.17.13

## 1.14.9

### Patch Changes

- ba89b82:
- Updated dependencies [ba89b82]
  - @adaline/google@1.17.12

## 1.14.8

### Patch Changes

- 233d4e4: New embedding models shipped in #217 (catalog top-up, no breaking changes):

  **Google (Generative Language API)**

  - `gemini-embedding-001` registered in `provider.google.ts` so `getEmbeddingModel("gemini-embedding-001")` dispatches correctly. (Model file was added in a prior commit but not wired into `embeddingModelFactories`.)
  - `gemini-embedding-2` — Matryoshka, default 3072 dims (configurable to 768 / 1536 / 3072 via `outputDimensionality`), max input 8192 tokens (4× v1).

  **Vertex AI**

  - `gemini-embedding-001` registered (same fix as Google).
  - `gemini-embedding-2` — same model on the Vertex surface.
  - `text-embedding-005` — English-only general-purpose text embedding, default 768 dims, drop-in successor to `text-embedding-004`.

  **Anthropic (Voyage)**

  - `voyage-4-large` — top-quality general purpose, 1024 default dims, 32K input tokens. $0.18/M.
  - `voyage-4` — balanced cost/quality, 1024, 32K. $0.06/M.
  - `voyage-4-lite` — lower latency, lower cost, 1024, 32K. $0.02/M.
  - `voyage-4-nano` — open-weight, smallest tier, 1024, 32K. $0.01/M.

  All literals verified against the official docs at PR-creation time (`ai.google.dev/gemini-api/docs/embeddings`, `docs.voyageai.com/docs/embeddings`).

- Updated dependencies [233d4e4]
  - @adaline/google@1.17.11

## 1.14.7

### Patch Changes

- ab5f7df: Add current-generation Voyage embedding models and full embedding pricing + config support.

  - New models registered under the Anthropic provider: `voyage-3.5`, `voyage-3.5-lite`, `voyage-3-large`, `voyage-code-3` (32K context; default output dimension 1024, configurable to 256/512/1024/2048).
  - Embedding-model pricing: new `EmbeddingModelPrice` type (`@adaline/types`), a `price` field on `EmbeddingModelSchema` and a now-required `getModelPricing()` on `EmbeddingModelV1` (`@adaline/provider`), and per-model USD-per-1M-token pricing for all ten Voyage models.
  - `getModelPricing()` is now required on every embedding model. Every provider implements it: OpenAI, Google, Vertex and Together AI return per-model pricing (Together AI does a runtime model-name lookup and throws for unknown models, like its chat models), while Azure throws "Pricing configuration not supported azure provider." (mirroring its chat models).
  - Embedding config now supports `output_dimension` and `output_dtype` (float/int8/uint8/binary/ubinary) on the flexible-dimension models, in addition to `input_type`, `encoding_format`, and `truncation`. `output_dimension` is forwarded to the Voyage API as an integer.

  Fully backwards compatible: legacy fixed-dimension models keep their existing config (no `output_dimension`/`output_dtype`), `EmbeddingModelSchema.price` is runtime-permissive so dynamic base schemas can omit it, and existing `getEmbeddings` calls are unaffected.

- Updated dependencies [ab5f7df]
  - @adaline/google@1.17.10
  - @adaline/provider@1.10.5
  - @adaline/types@1.15.1

## 1.14.6

### Patch Changes

- Updated dependencies [4f55295]
  - @adaline/types@1.15.0
  - @adaline/google@1.17.9
  - @adaline/provider@1.10.4

## 1.14.5

### Patch Changes

- Updated dependencies [05d0d28]
  - @adaline/google@1.17.8

## 1.14.4

### Patch Changes

- Updated dependencies [579f9fb]
  - @adaline/google@1.17.7

## 1.14.3

### Patch Changes

- 48702e8: Fix top dependabot vulnerabilities
- Updated dependencies [48702e8]
  - @adaline/google@1.17.6
  - @adaline/provider@1.10.3
  - @adaline/types@1.14.1

## 1.14.2

### Patch Changes

- 5b21690: Remove the redundant 'type' union on 'search-result' modality, not a discriminanted union anynmore
- Updated dependencies [5b21690]
  - @adaline/types@1.14.0
  - @adaline/google@1.17.5
  - @adaline/provider@1.10.2

## 1.14.1

### Patch Changes

- Updated dependencies [3cab885]
  - @adaline/types@1.13.0
  - @adaline/google@1.17.4
  - @adaline/provider@1.10.1

## 1.14.0

### Minor Changes

- 6db4812: Add gemini-3.1-pro-preview-customtools model to Vertex provider with pricing, achieving parity with the Google provider's customtools variant.

## 1.13.3

### Patch Changes

- e98e85e: bump rollup to >=4.59.0 to resolve CVE (Arbitrary File Write via Path Traversal)
- Updated dependencies [e98e85e]
  - @adaline/google@1.17.3

## 1.13.2

### Patch Changes

- Updated dependencies [0285f23]
  - @adaline/google@1.17.2

## 1.13.1

### Patch Changes

- 5b588c2: Sync provider model registries with current docs by adding missing OpenAI, Google/Vertex, Anthropic/Bedrock, and Groq model IDs plus pricing updates.
- 27ecde1: Add doc-backed model coverage for `gpt-5.2-codex`, `gpt-5.3-codex`, and `gemini-3.1-pro-preview` with pricing metadata.
- Updated dependencies [5b588c2]
- Updated dependencies [b4a6dd4]
- Updated dependencies [f49f783]
  - @adaline/google@1.17.1

## 1.13.0

### Minor Changes

- ba6ea54: Implement retry with delay (response based) + jitter in case of 429 errors

### Patch Changes

- Updated dependencies [b1b32c9]
- Updated dependencies [ba6ea54]
  - @adaline/google@1.17.0
  - @adaline/provider@1.10.0

## 1.12.0

### Minor Changes

- f50ecbb: add thoughtsignature

### Patch Changes

- Updated dependencies [f50ecbb]
  - @adaline/google@1.16.0
  - @adaline/provider@1.9.0
  - @adaline/types@1.12.0

## 1.11.0

### Minor Changes

- adfdfbe: add reasoning to flash

### Patch Changes

- Updated dependencies [adfdfbe]
  - @adaline/google@1.15.0

## 1.10.7

### Patch Changes

- Updated dependencies [c5904e1]
  - @adaline/google@1.14.3

## 1.10.6

### Patch Changes

- Updated dependencies [693c463]
  - @adaline/google@1.14.2

## 1.10.5

### Patch Changes

- Updated dependencies [55403a3]
  - @adaline/google@1.14.1

## 1.10.4

### Patch Changes

- Updated dependencies [283793f]
  - @adaline/google@1.14.0

## 1.10.3

### Patch Changes

- Updated dependencies [8ffe29e]
  - @adaline/google@1.13.0
  - @adaline/provider@1.8.0
  - @adaline/types@1.11.0

## 1.10.2

### Patch Changes

- 3c8f677: Add gemini-3-flash-preview, gpt-5.2-pro
- Updated dependencies [3c8f677]
  - @adaline/google@1.12.2

## 1.10.1

### Patch Changes

- Updated dependencies [4c45f48]
  - @adaline/google@1.12.1

## 1.10.0

### Minor Changes

- 14d8a3d: bump minor version

### Patch Changes

- Updated dependencies [14d8a3d]
  - @adaline/google@1.12.0
  - @adaline/provider@1.7.0
  - @adaline/types@1.10.0

## 1.9.1

### Patch Changes

- Updated dependencies [ac10b6b]
  - @adaline/google@1.11.0
  - @adaline/provider@1.6.0

## 1.9.0

### Minor Changes

- 0c44a3b: add models

## 1.8.0

### Minor Changes

- f10fa98: Add gpt-5-1 and gemini-3-pro

### Patch Changes

- Updated dependencies [f10fa98]
  - @adaline/google@1.10.0

## 1.7.2

### Patch Changes

- Updated dependencies [c2a0bf9]
  - @adaline/google@1.9.0

## 1.7.1

### Patch Changes

- aa2f870: gpt5 config
- Updated dependencies [aa2f870]
  - @adaline/google@1.8.1
  - @adaline/provider@1.5.1
  - @adaline/types@1.9.1

## 1.7.0

### Minor Changes

- 1b4e8d4: Add service account auth support for Vertex

## 1.6.0

### Minor Changes

- fix
- 762415a: add mcp

### Patch Changes

- Updated dependencies
- Updated dependencies [762415a]
  - @adaline/provider@1.5.0
  - @adaline/types@1.9.0
  - @adaline/google@1.8.0

## 1.5.0

### Minor Changes

- ce81194: Add file name in PDF modality

### Patch Changes

- Updated dependencies [ce81194]
  - @adaline/google@1.7.0
  - @adaline/types@1.8.0
  - @adaline/provider@1.4.0

## 1.4.2

### Patch Changes

- Updated dependencies [7b42304]
  - @adaline/google@1.6.0

## 1.4.1

### Patch Changes

- Updated dependencies [349b6d6]
  - @adaline/types@1.7.0
  - @adaline/provider@1.3.0
  - @adaline/google@1.5.1

## 1.4.0

### Minor Changes

- 7732146: Support PDF modality content, add Google provider support

### Patch Changes

- Updated dependencies [7732146]
  - @adaline/google@1.5.0
  - @adaline/types@1.6.0
  - @adaline/provider@1.2.4

## 1.3.4

### Patch Changes

- Updated dependencies [3dfe48c]
  - @adaline/google@1.4.0

## 1.3.3

### Patch Changes

- Updated dependencies [c7af267]
  - @adaline/types@1.5.0
  - @adaline/google@1.3.3
  - @adaline/provider@1.2.3

## 1.3.2

### Patch Changes

- Updated dependencies [239ebe7]
  - @adaline/types@1.4.0
  - @adaline/google@1.3.2
  - @adaline/provider@1.2.2

## 1.3.1

### Patch Changes

- Updated dependencies [84a5ff4]
  - @adaline/types@1.3.0
  - @adaline/google@1.3.1
  - @adaline/provider@1.2.1

## 1.3.0

### Minor Changes

- c885d34: Add response schema support for Gemini models

### Patch Changes

- Updated dependencies [c885d34]
  - @adaline/google@1.3.0

## 1.2.0

### Minor Changes

- bfa8adf: Add Claude 4 models, new docs

### Patch Changes

- Updated dependencies [bfa8adf]
  - @adaline/types@1.2.0
  - @adaline/google@1.2.0
  - @adaline/provider@1.2.0

## 1.1.0

### Minor Changes

- fe8d747: Rename image modality media_type to mediaType

### Patch Changes

- Updated dependencies [fe8d747]
  - @adaline/google@1.1.0
  - @adaline/provider@1.1.0
  - @adaline/types@1.1.0

## 1.0.0

### Major Changes

- e74908d: first stable, major release

### Patch Changes

- Updated dependencies [e74908d]
  - @adaline/google@1.0.0
  - @adaline/provider@1.0.0
  - @adaline/types@1.0.0

## 0.17.0

### Minor Changes

- 4d02433: Add model pricing to all providers

### Patch Changes

- Updated dependencies [4d02433]
  - @adaline/google@0.17.0
  - @adaline/provider@0.25.0
  - @adaline/types@0.23.0

## 0.16.0

### Minor Changes

- a17494d: Add unit tests, claude sonnet 3.7 extended thinking

### Patch Changes

- Updated dependencies [a17494d]
  - @adaline/provider@0.24.0
  - @adaline/types@0.22.0
  - @adaline/google@0.16.0

## 0.15.0

### Minor Changes

- c0e688e: fixes

### Patch Changes

- Updated dependencies [c0e688e]
  - @adaline/google@0.15.0
  - @adaline/provider@0.23.0
  - @adaline/types@0.21.0

## 0.14.0

### Minor Changes

- c3ac896: fixes

### Patch Changes

- Updated dependencies [c3ac896]
  - @adaline/google@0.14.0
  - @adaline/provider@0.22.0
  - @adaline/types@0.20.0

## 0.13.0

### Minor Changes

- 1936d9b: First release for custom provider, abortSignal in stream

### Patch Changes

- Updated dependencies [1936d9b]
  - @adaline/google@0.13.0
  - @adaline/provider@0.21.0
  - @adaline/types@0.19.0

## 0.12.0

### Minor Changes

- ab5b072: fixes

### Patch Changes

- Updated dependencies [ab5b072]
  - @adaline/google@0.12.0
  - @adaline/provider@0.20.0
  - @adaline/types@0.18.0

## 0.11.0

### Minor Changes

- 749462f: minor changes

### Patch Changes

- Updated dependencies [749462f]
  - @adaline/google@0.11.0
  - @adaline/provider@0.19.0
  - @adaline/types@0.17.0

## 0.10.0

### Minor Changes

- 2b8b3a0: Pre-release for Gateway Proxy Service

### Patch Changes

- Updated dependencies [2b8b3a0]
  - @adaline/google@0.10.0
  - @adaline/provider@0.18.0
  - @adaline/types@0.16.0

## 0.9.0

### Minor Changes

- 06a8f0e: Add support for more models and fixes for openai

## 0.8.2

### Patch Changes

- Updated dependencies [e9a64ad]
  - @adaline/google@0.9.0

## 0.8.1

### Patch Changes

- Updated dependencies [10b4f03]
  - @adaline/google@0.8.0
