# @adaline/azure

## 1.11.0

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

## 1.10.10

### Patch Changes

- Updated dependencies [28355f9]
  - @adaline/openai@1.22.4

## 1.10.9

### Patch Changes

- ab5f7df: Add current-generation Voyage embedding models and full embedding pricing + config support.

  - New models registered under the Anthropic provider: `voyage-3.5`, `voyage-3.5-lite`, `voyage-3-large`, `voyage-code-3` (32K context; default output dimension 1024, configurable to 256/512/1024/2048).
  - Embedding-model pricing: new `EmbeddingModelPrice` type (`@adaline/types`), a `price` field on `EmbeddingModelSchema` and a now-required `getModelPricing()` on `EmbeddingModelV1` (`@adaline/provider`), and per-model USD-per-1M-token pricing for all ten Voyage models.
  - `getModelPricing()` is now required on every embedding model. Every provider implements it: OpenAI, Google, Vertex and Together AI return per-model pricing (Together AI does a runtime model-name lookup and throws for unknown models, like its chat models), while Azure throws "Pricing configuration not supported azure provider." (mirroring its chat models).
  - Embedding config now supports `output_dimension` and `output_dtype` (float/int8/uint8/binary/ubinary) on the flexible-dimension models, in addition to `input_type`, `encoding_format`, and `truncation`. `output_dimension` is forwarded to the Voyage API as an integer.

  Fully backwards compatible: legacy fixed-dimension models keep their existing config (no `output_dimension`/`output_dtype`), `EmbeddingModelSchema.price` is runtime-permissive so dynamic base schemas can omit it, and existing `getEmbeddings` calls are unaffected.

- Updated dependencies [ab5f7df]
  - @adaline/openai@1.22.3
  - @adaline/provider@1.10.5
  - @adaline/types@1.15.1

## 1.10.8

### Patch Changes

- Updated dependencies [ccb8cd7]
  - @adaline/openai@1.22.2

## 1.10.7

### Patch Changes

- Updated dependencies [26be93c]
  - @adaline/openai@1.22.1

## 1.10.6

### Patch Changes

- Updated dependencies [4f55295]
  - @adaline/openai@1.22.0
  - @adaline/types@1.15.0
  - @adaline/provider@1.10.4

## 1.10.5

### Patch Changes

- Updated dependencies [99f839a]
  - @adaline/openai@1.21.0

## 1.10.4

### Patch Changes

- Updated dependencies [a336aef]
  - @adaline/openai@1.20.2

## 1.10.3

### Patch Changes

- 48702e8: Fix top dependabot vulnerabilities
- Updated dependencies [48702e8]
  - @adaline/openai@1.20.1
  - @adaline/provider@1.10.3
  - @adaline/types@1.14.1

## 1.10.2

### Patch Changes

- 5b21690: Remove the redundant 'type' union on 'search-result' modality, not a discriminanted union anynmore
- Updated dependencies [5b21690]
  - @adaline/openai@1.20.0
  - @adaline/types@1.14.0
  - @adaline/provider@1.10.2

## 1.10.1

### Patch Changes

- Updated dependencies [3cab885]
  - @adaline/openai@1.19.0
  - @adaline/types@1.13.0
  - @adaline/provider@1.10.1

## 1.10.0

### Minor Changes

- 6db4812: Add 25 missing OpenAI models to Azure provider: GPT-4.1 series (gpt-4.1, gpt-4.1-mini, gpt-4.1-nano), o-series (o1, o1-2024-12-17, o3, o3-2025-04-16, o3-mini, o3-mini-2025-01-31, o4-mini, o4-mini-2025-04-16), GPT-5 family (gpt-5, gpt-5.1, gpt-5.2, gpt-5.2-codex, gpt-5.2-chat-latest, gpt-5.3-codex, gpt-5-chat-latest, gpt-5-mini, gpt-5-nano, chatgpt-5.2), and remaining GPT-4 variants (gpt-4-turbo, gpt-4-turbo-preview, gpt-4-0125-preview, chatgpt-4o-latest).

## 1.9.3

### Patch Changes

- e98e85e: bump rollup to >=4.59.0 to resolve CVE (Arbitrary File Write via Path Traversal)
- Updated dependencies [e98e85e]
  - @adaline/openai@1.18.2

## 1.9.2

### Patch Changes

- Updated dependencies [5b588c2]
- Updated dependencies [f49f783]
- Updated dependencies [27ecde1]
  - @adaline/openai@1.18.1

## 1.9.1

### Patch Changes

- Updated dependencies [ba6ea54]
  - @adaline/openai@1.18.0
  - @adaline/provider@1.10.0

## 1.9.0

### Minor Changes

- f50ecbb: add thoughtsignature

### Patch Changes

- Updated dependencies [f50ecbb]
  - @adaline/openai@1.17.0
  - @adaline/provider@1.9.0
  - @adaline/types@1.12.0

## 1.8.5

### Patch Changes

- Updated dependencies [283793f]
  - @adaline/openai@1.16.0

## 1.8.4

### Patch Changes

- Updated dependencies [8ffe29e]
  - @adaline/provider@1.8.0
  - @adaline/types@1.11.0
  - @adaline/openai@1.15.1

## 1.8.3

### Patch Changes

- Updated dependencies [3c8f677]
  - @adaline/openai@1.15.0

## 1.8.2

### Patch Changes

- Updated dependencies [0998d54]
  - @adaline/openai@1.14.0

## 1.8.1

### Patch Changes

- Updated dependencies [d92112f]
  - @adaline/openai@1.13.0

## 1.8.0

### Minor Changes

- 14d8a3d: bump minor version

### Patch Changes

- Updated dependencies [14d8a3d]
  - @adaline/openai@1.12.0
  - @adaline/provider@1.7.0
  - @adaline/types@1.10.0

## 1.7.1

### Patch Changes

- Updated dependencies [ac10b6b]
  - @adaline/provider@1.6.0
  - @adaline/openai@1.11.1

## 1.7.0

### Minor Changes

- f10fa98: Add gpt-5-1 and gemini-3-pro

### Patch Changes

- Updated dependencies [f10fa98]
  - @adaline/openai@1.11.0

## 1.6.2

### Patch Changes

- Updated dependencies [3a0cbdf]
  - @adaline/openai@1.10.0

## 1.6.1

### Patch Changes

- aa2f870: gpt5 config
- Updated dependencies [aa2f870]
  - @adaline/openai@1.9.1
  - @adaline/provider@1.5.1
  - @adaline/types@1.9.1

## 1.6.0

### Minor Changes

- fix
- 762415a: add mcp

### Patch Changes

- Updated dependencies
- Updated dependencies [762415a]
  - @adaline/provider@1.5.0
  - @adaline/types@1.9.0
  - @adaline/openai@1.9.0

## 1.5.0

### Minor Changes

- ce81194: Add file name in PDF modality

### Patch Changes

- Updated dependencies [ce81194]
  - @adaline/openai@1.8.0
  - @adaline/types@1.8.0
  - @adaline/provider@1.4.0

## 1.4.0

### Minor Changes

- 349b6d6: Update 'pdf' modality support across Gateway

### Patch Changes

- Updated dependencies [349b6d6]
  - @adaline/types@1.7.0
  - @adaline/provider@1.3.0
  - @adaline/openai@1.7.1

## 1.3.0

### Minor Changes

- 7732146: Support PDF modality content, add Google provider support

### Patch Changes

- Updated dependencies [7732146]
  - @adaline/openai@1.7.0
  - @adaline/types@1.6.0
  - @adaline/provider@1.2.4

## 1.2.5

### Patch Changes

- Updated dependencies [c02e3f3]
  - @adaline/openai@1.6.0

## 1.2.4

### Patch Changes

- Updated dependencies [c7af267]
  - @adaline/types@1.5.0
  - @adaline/openai@1.5.3
  - @adaline/provider@1.2.3

## 1.2.3

### Patch Changes

- Updated dependencies [239ebe7]
  - @adaline/types@1.4.0
  - @adaline/openai@1.5.2
  - @adaline/provider@1.2.2

## 1.2.2

### Patch Changes

- Updated dependencies [84a5ff4]
  - @adaline/types@1.3.0
  - @adaline/openai@1.5.1
  - @adaline/provider@1.2.1

## 1.2.1

### Patch Changes

- Updated dependencies [4bc1952]
  - @adaline/openai@1.5.0

## 1.2.0

### Minor Changes

- bfa8adf: Add Claude 4 models, new docs

### Patch Changes

- Updated dependencies [bfa8adf]
  - @adaline/types@1.2.0
  - @adaline/openai@1.4.0
  - @adaline/provider@1.2.0

## 1.1.1

### Patch Changes

- Updated dependencies [07e196a]
  - @adaline/openai@1.3.0

## 1.1.0

### Minor Changes

- fe8d747: Rename image modality media_type to mediaType

### Patch Changes

- Updated dependencies [fe8d747]
  - @adaline/openai@1.2.0
  - @adaline/provider@1.1.0
  - @adaline/types@1.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [76beeca]
  - @adaline/openai@1.1.0

## 1.0.0

### Major Changes

- e74908d: first stable, major release

### Patch Changes

- Updated dependencies [e74908d]
  - @adaline/openai@1.0.0
  - @adaline/provider@1.0.0
  - @adaline/types@1.0.0

## 0.17.0

### Minor Changes

- 4d02433: Add model pricing to all providers

### Patch Changes

- Updated dependencies [4d02433]
  - @adaline/openai@0.31.0
  - @adaline/provider@0.25.0
  - @adaline/types@0.23.0

## 0.16.0

### Minor Changes

- a17494d: Add unit tests, claude sonnet 3.7 extended thinking

### Patch Changes

- Updated dependencies [a17494d]
  - @adaline/provider@0.24.0
  - @adaline/types@0.22.0
  - @adaline/openai@0.30.0

## 0.15.0

### Minor Changes

- c0e688e: fixes

### Patch Changes

- Updated dependencies [c0e688e]
  - @adaline/openai@0.29.0
  - @adaline/provider@0.23.0
  - @adaline/types@0.21.0

## 0.14.0

### Minor Changes

- c3ac896: fixes

### Patch Changes

- Updated dependencies [c3ac896]
  - @adaline/openai@0.28.0
  - @adaline/provider@0.22.0
  - @adaline/types@0.20.0

## 0.13.0

### Minor Changes

- 1936d9b: First release for custom provider, abortSignal in stream

### Patch Changes

- Updated dependencies [1936d9b]
  - @adaline/openai@0.27.0
  - @adaline/provider@0.21.0
  - @adaline/types@0.19.0

## 0.12.0

### Minor Changes

- ab5b072: fixes

### Patch Changes

- Updated dependencies [ab5b072]
  - @adaline/openai@0.26.0
  - @adaline/provider@0.20.0
  - @adaline/types@0.18.0

## 0.11.0

### Minor Changes

- 749462f: minor changes

### Patch Changes

- Updated dependencies [749462f]
  - @adaline/openai@0.25.0
  - @adaline/provider@0.19.0
  - @adaline/types@0.17.0

## 0.10.0

### Minor Changes

- 2b8b3a0: Pre-release for Gateway Proxy Service

### Patch Changes

- Updated dependencies [2b8b3a0]
  - @adaline/openai@0.24.0
  - @adaline/provider@0.18.0
  - @adaline/types@0.16.0

## 0.9.3

### Patch Changes

- Updated dependencies [5086c86]
  - @adaline/openai@0.23.0

## 0.9.2

### Patch Changes

- Updated dependencies [06a8f0e]
  - @adaline/openai@0.22.0

## 0.9.1

### Patch Changes

- Updated dependencies [10b4f03]
  - @adaline/openai@0.21.0
