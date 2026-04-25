---
"@adaline/openai": patch
---

Add `gpt-5.5` to the OpenAI provider — the first fully retrained base model since GPT-4.5 (5.1–5.4 were post-training iterations on the same base; 5.5 is a new base, retrieved from the OpenAI docs on 2026-04-25).

- 1,050,000 input / 128,000 output token window, knowledge cutoff December 2025.
- Reuses the shared `gpt5_2PlusWithWebSearch` config: `reasoning_effort` (none/low/medium/high/xhigh, default `none`), `verbosity`, structured outputs, function calling, and web search via the Responses API. Same modalities as gpt-5.4 (text + image input, text output).
- Tiered pricing: $5/$30 per 1M input/output up to 272K tokens; $10/$45 per 1M above 272K (2x input, 1.5x output, per OpenAI's pricing page).
