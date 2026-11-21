---
"@adaline/groq": minor
"@adaline/xai": minor
---

Groq + xAI parity sync (verified against official provider pages, 2026-11-20).

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
