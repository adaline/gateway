# @adaline/openai

## 1.23.0

### Minor Changes

- 173dbff: Remove models the providers no longer serve, per official deprecation/retirement pages (retrieved 2026-07-29).

  BREAKING (for consumers pinning these literals or importing their classes):

  - OpenAI: `gpt-5-chat-latest`, `gpt-4o-search-preview`(+2025-03-11), `gpt-4o-mini-search-preview`(+2025-03-11) — shut down 2026-07-23; `chatgpt-4o-latest`, `gpt-4-0125-preview`, `gpt-4-turbo-preview` — already shut down earlier in 2026. `gpt-5.2-codex` is unregistered from openai routing (shut down on the OpenAI API) but its schema remains exported for `@adaline/azure`, where it stays GA until 2027-01-14.
  - Groq: `qwen/qwen3-32b`, `meta-llama/llama-4-scout-17b-16e-instruct` — shut down 2026-07-17.
  - Google & Vertex: the dated Gemini previews (`gemini-2.5-flash-preview-04-17`, `gemini-2.5-flash-lite-preview-09-2025`, `gemini-2.5-pro-preview-03-25`, `gemini-3-pro-preview`) — retirement now confirmed on both platforms; the schemas previously retained for Vertex are fully deleted.
  - Bedrock: `anthropic.claude-3-sonnet-20240229-v1:0`, `anthropic.claude-3-5-sonnet-20240620-v1:0`, `anthropic.claude-3-5-sonnet-20241022-v2:0`, `anthropic.claude-3-7-sonnet-20250219-v1:0` — AWS EOL 2026-07-30.

  Note: `gemini-embedding-001` is NOT removed — the previously annotated 2026-07-14 shutdown was a misreading of its release date; Google's deprecations table gives 2028-05-14 (annotation corrected in the follow-up release).

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

- Updated dependencies [173dbff]
  - @adaline/provider@1.10.6

## 1.22.5

### Patch Changes

- c4b114e: Add the latest provider models (researched 2026-07-10 from official docs, pricing, and deprecation pages).

  Added:

  - OpenAI: `gpt-5.6-sol`, `gpt-5.6-terra` (tiered pricing @272k), `gpt-5.6-luna`, with new `reasoning_effort: xhigh` and `reasoning_mode: standard|pro` config support (reasoningMode routes via the Responses API; the gpt-5.6 web-search bundle is default-deny on live web access).
  - Anthropic: `claude-sonnet-5` (1M context, 128K output).
  - Azure OpenAI: `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `gpt-5.5`, `gpt-5-pro`, `o3-pro`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`.
  - Bedrock: `anthropic.claude-sonnet-5`, `anthropic.claude-opus-4-8`.
  - Vertex: `gemini-3.5-flash`, `gemini-3.1-flash-lite`.
  - Groq: `qwen/qwen3.6-27b`, `meta-llama/llama-prompt-guard-2-86m`, `meta-llama/llama-prompt-guard-2-22m`.
  - xAI: `grok-4.5`, `grok-4.3`, `grok-4.20-0309-reasoning`, `grok-4.20-0309-non-reasoning`, `grok-4.20-multi-agent-0309`, `grok-build-0.1` — the replacement catalog for the models retired in the previous release.

  Fixed:

  - Bedrock (minor): corrected model IDs `anthropic.claude-opus-4-7-v1` → `anthropic.claude-opus-4-7` and `anthropic.claude-sonnet-4-6-v1` → `anthropic.claude-sonnet-4-6` (old IDs were never served), plus wrong 200K context limits (now 1M per AWS model cards).
  - OpenAI: `chatgpt-5.2` was missing its pricing entry, so runtime cost lookup threw.
  - Google: `gemini-2.5-pro` pricing is now context-tiered @200k; `gemini-embedding-2` corrected to $0.20/M.
  - xAI (minor): request schema narrows `reasoning_effort` to the documented values (`none`, `low`).
  - Deprecation notes added to descriptions of deprecated-but-live models across OpenAI, Google, and Groq (notably `gemini-embedding-001` shuts down 2026-07-14).

## 1.22.4

### Patch Changes

- 28355f9: Add latest provider chat models with pricing and configs:

  - OpenAI: `gpt-5.5-pro`, `gpt-5.4-nano`, `gpt-5-pro`, `o3-pro`, and register the previously-unexposed `gpt-5.5` base model.
  - Anthropic: `claude-opus-4-8`, `claude-fable-5`.
  - Google: `gemini-3.5-flash`, `gemini-3.1-flash-lite`.

## 1.22.3

### Patch Changes

- ab5f7df: Add current-generation Voyage embedding models and full embedding pricing + config support.

  - New models registered under the Anthropic provider: `voyage-3.5`, `voyage-3.5-lite`, `voyage-3-large`, `voyage-code-3` (32K context; default output dimension 1024, configurable to 256/512/1024/2048).
  - Embedding-model pricing: new `EmbeddingModelPrice` type (`@adaline/types`), a `price` field on `EmbeddingModelSchema` and a now-required `getModelPricing()` on `EmbeddingModelV1` (`@adaline/provider`), and per-model USD-per-1M-token pricing for all ten Voyage models.
  - `getModelPricing()` is now required on every embedding model. Every provider implements it: OpenAI, Google, Vertex and Together AI return per-model pricing (Together AI does a runtime model-name lookup and throws for unknown models, like its chat models), while Azure throws "Pricing configuration not supported azure provider." (mirroring its chat models).
  - Embedding config now supports `output_dimension` and `output_dtype` (float/int8/uint8/binary/ubinary) on the flexible-dimension models, in addition to `input_type`, `encoding_format`, and `truncation`. `output_dimension` is forwarded to the Voyage API as an integer.

  Fully backwards compatible: legacy fixed-dimension models keep their existing config (no `output_dimension`/`output_dtype`), `EmbeddingModelSchema.price` is runtime-permissive so dynamic base schemas can omit it, and existing `getEmbeddings` calls are unaffected.

- Updated dependencies [ab5f7df]
  - @adaline/provider@1.10.5
  - @adaline/types@1.15.1

## 1.22.2

### Patch Changes

- ccb8cd7: Add `gpt-5.5` to the OpenAI provider — the first fully retrained base model since GPT-4.5 (5.1–5.4 were post-training iterations on the same base; 5.5 is a new base, retrieved from the OpenAI docs on 2026-04-25).

  - 1,050,000 input / 128,000 output token window, knowledge cutoff December 2025.
  - Reuses the shared `gpt5_2PlusWithWebSearch` config: `reasoning_effort` (none/low/medium/high/xhigh, default `none`), `verbosity`, structured outputs, function calling, and web search via the Responses API. Same modalities as gpt-5.4 (text + image input, text output).
  - Tiered pricing: $5/$30 per 1M input/output up to 272K tokens; $10/$45 per 1M above 272K (2x input, 1.5x output, per OpenAI's pricing page).

## 1.22.1

### Patch Changes

- 26be93c: Clean up the OpenAI web-search surface:

  - Remove `webSearchUserLocation` config entirely. It was half-implemented and emitted `user_location` inside the Responses API `web_search` tool; it has been dropped to keep the web-search surface lean. If you were passing `webSearchUserLocation` in your Gateway config, remove it — it is no longer accepted.
  - Remove `webSearchTool` from the 5 CC search-preview SKUs (`gpt-4o-search-preview`, `gpt-4o-search-preview-2025-03-11`, `gpt-4o-mini-search-preview`, `gpt-4o-mini-search-preview-2025-03-11`, `gpt-5-search-api`). These models always search server-side and are CC-only — the toggle was causing them to be routed to the Responses API, which does not accept those model names. Their built-in search remains available as before; users simply should not pass `webSearchTool`.
  - Delete the now-unused `webSearch` preset and dead `webSearch`-key handling code in `BaseChatModel`.

## 1.22.0

### Minor Changes

- 4f55295:

### Patch Changes

- Updated dependencies [4f55295]
  - @adaline/types@1.15.0
  - @adaline/provider@1.10.4

## 1.21.0

### Minor Changes

- 99f839a: Align `reasoning_effort` enums across the gpt-5.x family with OpenAI's current docs, and add the `gpt-5.4-pro` model.

  - `gpt-5.1` now uses `none, low, medium, high` (default `none`) — previously `minimal, low, medium, high`.
  - `gpt-5.2`, `gpt-5.2-chat-latest`, `chatgpt-5.2`, `gpt-5.4`, `gpt-5.4-mini` now use `none, low, medium, high, xhigh` (default `none`).
  - `gpt-5.2-codex`, `gpt-5.3-codex` now use `low, medium, high, xhigh` (default `medium`).
  - `gpt-5.2-pro` and the newly added `gpt-5.4-pro` use `medium, high, xhigh` (default `medium`) via the Responses API.
  - Legacy `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5-chat-latest`, `gpt-5-search-api` retain `minimal, low, medium, high` (default `medium`) per OpenAI's docs for the original gpt-5 tier.

## 1.20.2

### Patch Changes

- a336aef: Add doc-backed model coverage for `gpt-5.4` and `gpt-5.4-mini` with pricing metadata.

## 1.20.1

### Patch Changes

- 48702e8: Fix top dependabot vulnerabilities
- Updated dependencies [48702e8]
  - @adaline/provider@1.10.3
  - @adaline/types@1.14.1

## 1.20.0

### Minor Changes

- 5b21690: Remove the redundant 'type' union on 'search-result' modality, not a discriminanted union anynmore

### Patch Changes

- Updated dependencies [5b21690]
  - @adaline/types@1.14.0
  - @adaline/provider@1.10.2

## 1.19.0

### Minor Changes

- 3cab885: Add web_search_options to OpenAI Provider

### Patch Changes

- Updated dependencies [3cab885]
  - @adaline/types@1.13.0
  - @adaline/provider@1.10.1

## 1.18.2

### Patch Changes

- e98e85e: bump rollup to >=4.59.0 to resolve CVE (Arbitrary File Write via Path Traversal)

## 1.18.1

### Patch Changes

- 5b588c2: Sync provider model registries with current docs by adding missing OpenAI, Google/Vertex, Anthropic/Bedrock, and Groq model IDs plus pricing updates.
- f49f783: Enable ChatGPT-5.2 response-format config wiring and allow decimal temperatures for `o4-mini` while keeping `o1` models fixed-temperature.
- 27ecde1: Add doc-backed model coverage for `gpt-5.2-codex`, `gpt-5.3-codex`, and `gemini-3.1-pro-preview` with pricing metadata.

## 1.18.0

### Minor Changes

- ba6ea54: Implement retry with delay (response based) + jitter in case of 429 errors

### Patch Changes

- Updated dependencies [ba6ea54]
  - @adaline/provider@1.10.0

## 1.17.0

### Minor Changes

- f50ecbb: add thoughtsignature

### Patch Changes

- Updated dependencies [f50ecbb]
  - @adaline/provider@1.9.0
  - @adaline/types@1.12.0

## 1.16.0

### Minor Changes

- 283793f: Handle output only modalities in multi turn chats

## 1.15.1

### Patch Changes

- Updated dependencies [8ffe29e]
  - @adaline/provider@1.8.0
  - @adaline/types@1.11.0

## 1.15.0

### Minor Changes

- 3c8f677: Add gemini-3-flash-preview, gpt-5.2-pro

## 1.14.0

### Minor Changes

- 0998d54: Adding the GPT 5.2 chat latest model for openai

## 1.13.0

### Minor Changes

- d92112f: Introducing Openai GPT 5.2 model

## 1.12.0

### Minor Changes

- 14d8a3d: bump minor version

### Patch Changes

- Updated dependencies [14d8a3d]
  - @adaline/provider@1.7.0
  - @adaline/types@1.10.0

## 1.11.1

### Patch Changes

- Updated dependencies [ac10b6b]
  - @adaline/provider@1.6.0

## 1.11.0

### Minor Changes

- f10fa98: Add gpt-5-1 and gemini-3-pro

## 1.10.0

### Minor Changes

- 3a0cbdf: add response

## 1.9.1

### Patch Changes

- aa2f870: gpt5 config
- Updated dependencies [aa2f870]
  - @adaline/provider@1.5.1
  - @adaline/types@1.9.1

## 1.9.0

### Minor Changes

- fix
- 762415a: add mcp

### Patch Changes

- Updated dependencies
- Updated dependencies [762415a]
  - @adaline/provider@1.5.0
  - @adaline/types@1.9.0

## 1.8.0

### Minor Changes

- ce81194: Add file name in PDF modality

### Patch Changes

- Updated dependencies [ce81194]
  - @adaline/types@1.8.0
  - @adaline/provider@1.4.0

## 1.7.1

### Patch Changes

- Updated dependencies [349b6d6]
  - @adaline/types@1.7.0
  - @adaline/provider@1.3.0

## 1.7.0

### Minor Changes

- 7732146: Support PDF modality content, add Google provider support

### Patch Changes

- Updated dependencies [7732146]
  - @adaline/types@1.6.0
  - @adaline/provider@1.2.4

## 1.6.0

### Minor Changes

- c02e3f3: Add GPT-5 model family support (gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-chat-latest)

## 1.5.3

### Patch Changes

- Updated dependencies [c7af267]
  - @adaline/types@1.5.0
  - @adaline/provider@1.2.3

## 1.5.2

### Patch Changes

- Updated dependencies [239ebe7]
  - @adaline/types@1.4.0
  - @adaline/provider@1.2.2

## 1.5.1

### Patch Changes

- Updated dependencies [84a5ff4]
  - @adaline/types@1.3.0
  - @adaline/provider@1.2.1

## 1.5.0

### Minor Changes

- 4bc1952: Add GPT-4.1 models

## 1.4.0

### Minor Changes

- bfa8adf: Add Claude 4 models, new docs

### Patch Changes

- Updated dependencies [bfa8adf]
  - @adaline/types@1.2.0
  - @adaline/provider@1.2.0

## 1.3.0

### Minor Changes

- 07e196a: Fix openai o-series models stream complete chat

## 1.2.0

### Minor Changes

- fe8d747: Rename image modality media_type to mediaType

### Patch Changes

- Updated dependencies [fe8d747]
  - @adaline/provider@1.1.0
  - @adaline/types@1.1.0

## 1.1.0

### Minor Changes

- 76beeca: add 03, o4-mini models

## 1.0.0

### Major Changes

- e74908d: first stable, major release

### Patch Changes

- Updated dependencies [e74908d]
  - @adaline/provider@1.0.0
  - @adaline/types@1.0.0

## 0.31.0

### Minor Changes

- 4d02433: Add model pricing to all providers

### Patch Changes

- Updated dependencies [4d02433]
  - @adaline/provider@0.25.0
  - @adaline/types@0.23.0

## 0.30.0

### Minor Changes

- a17494d: Add unit tests, claude sonnet 3.7 extended thinking

### Patch Changes

- Updated dependencies [a17494d]
  - @adaline/provider@0.24.0
  - @adaline/types@0.22.0

## 0.29.0

### Minor Changes

- c0e688e: fixes

### Patch Changes

- Updated dependencies [c0e688e]
  - @adaline/provider@0.23.0
  - @adaline/types@0.21.0

## 0.28.0

### Minor Changes

- c3ac896: fixes

### Patch Changes

- Updated dependencies [c3ac896]
  - @adaline/provider@0.22.0
  - @adaline/types@0.20.0

## 0.27.0

### Minor Changes

- 1936d9b: First release for custom provider, abortSignal in stream

### Patch Changes

- Updated dependencies [1936d9b]
  - @adaline/provider@0.21.0
  - @adaline/types@0.19.0

## 0.26.0

### Minor Changes

- ab5b072: fixes

### Patch Changes

- Updated dependencies [ab5b072]
  - @adaline/provider@0.20.0
  - @adaline/types@0.18.0

## 0.25.0

### Minor Changes

- 749462f: minor changes

### Patch Changes

- Updated dependencies [749462f]
  - @adaline/provider@0.19.0
  - @adaline/types@0.17.0

## 0.24.0

### Minor Changes

- 2b8b3a0: Pre-release for Gateway Proxy Service

### Patch Changes

- Updated dependencies [2b8b3a0]
  - @adaline/provider@0.18.0
  - @adaline/types@0.16.0

## 0.23.0

### Minor Changes

- 5086c86: fixes to max_tokens changes

## 0.22.0

### Minor Changes

- 06a8f0e: Add support for more models and fixes for openai

## 0.21.0

### Minor Changes

- 10b4f03: aggregate parallel tool call responses in a single assistant message
