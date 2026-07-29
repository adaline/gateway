---
"@adaline/anthropic": minor
"@adaline/bedrock": minor
"@adaline/google": minor
"@adaline/vertex": minor
"@adaline/xai": minor
"@adaline/openai": patch
"@adaline/groq": patch
"@adaline/provider": patch
---

Add the latest provider models and correct spec/pricing drift (verified against official provider pages, 2026-07-29).

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
