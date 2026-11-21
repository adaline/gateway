# @adaline/xai

## 1.7.0

### Minor Changes

- 842c04b: Groq + xAI parity sync (verified against official provider pages, 2026-11-20).

  BREAKING (for consumers pinning these literals or importing their classes):

  - Groq: `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` removed (shut down 2026-08-16 for free/dev tiers, now Enterprise "Contact Sales" only); `qwen/qwen3.6-27b` removed (shut down 2026-09-14). The `Qwen3_6_27b*` exports are replaced by `Qwen3_8_27b*`.
  - xAI: `grok-build-0.1` removed (end of life 2026-11-19).
  - xAI: `logProbs` / `topLogProbs` removed from every model config (xAI documents them as unsupported and silently ignored on grok-4.20+). The `logProbs` / `topLogProbs` config items are no longer exported from `XAIChatModelConfigs`, and `reasoningEffortNoneLow` is renamed `reasoningEffortNoneLowMediumHighXhigh`.

  Added:

  - Groq: `qwen/qwen3.8-27b` (Preview; 131K context, 16K output, $0.80/$4.00).
  - Groq: `reasoningEffort` config for `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `openai/gpt-oss-safeguard-20b` (low/medium/high) and `qwen/qwen3.8-27b` (none/low/medium/high), with no default because Groq documents none.
  - xAI: `grok-4.7` and `grok-4.6` (500K context, reasoning_effort low/medium/high/xhigh with a high default; cannot be disabled).

  Fixed:

  - xAI pricing: every model now carries the 200K long-context tier, where all tokens bill at the higher rate once the prompt reaches 200K (grok-4.5 $2/$6 → $4/$12; grok-4.3 and the grok-4.20 family $1.25/$2.50 → $2.50/$5.00).
  - xAI `grok-4.3`: reasoning effort widened to none/low/medium/high/xhigh (default stays low), per its model page.
  - Groq: Preview status annotated on `gpt-oss-safeguard-20b`, `llama-prompt-guard-2-22m` and `llama-prompt-guard-2-86m`.

### Patch Changes

- Updated dependencies [ab5da39]
- Updated dependencies [f23fd75]
  - @adaline/types@1.16.0
  - @adaline/provider@1.11.0

## 1.6.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [173dbff]
  - @adaline/provider@1.10.6

## 1.5.0

### Minor Changes

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

## 1.4.0

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

## 1.3.6

### Patch Changes

- Updated dependencies [ab5f7df]
  - @adaline/provider@1.10.5
  - @adaline/types@1.15.1

## 1.3.5

### Patch Changes

- Updated dependencies [4f55295]
  - @adaline/types@1.15.0
  - @adaline/provider@1.10.4

## 1.3.4

### Patch Changes

- 48702e8: Fix top dependabot vulnerabilities
- Updated dependencies [48702e8]
  - @adaline/provider@1.10.3
  - @adaline/types@1.14.1

## 1.3.3

### Patch Changes

- 5b21690: Remove the redundant 'type' union on 'search-result' modality, not a discriminanted union anynmore
- Updated dependencies [5b21690]
  - @adaline/types@1.14.0
  - @adaline/provider@1.10.2

## 1.3.2

### Patch Changes

- Updated dependencies [3cab885]
  - @adaline/types@1.13.0
  - @adaline/provider@1.10.1

## 1.3.1

### Patch Changes

- e98e85e: bump rollup to >=4.59.0 to resolve CVE (Arbitrary File Write via Path Traversal)

## 1.3.0

### Minor Changes

- ba6ea54: Implement retry with delay (response based) + jitter in case of 429 errors

### Patch Changes

- Updated dependencies [ba6ea54]
  - @adaline/provider@1.10.0

## 1.2.0

### Minor Changes

- f50ecbb: add thoughtsignature

### Patch Changes

- Updated dependencies [f50ecbb]
  - @adaline/provider@1.9.0
  - @adaline/types@1.12.0

## 1.1.0

### Minor Changes

- b90c856: Add xAI/Grok provider with support for 17 Grok models
