# @adaline/openai

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
