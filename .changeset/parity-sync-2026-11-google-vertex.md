---
"@adaline/google": minor
"@adaline/vertex": minor
---

Google + Vertex parity sync (verified against official Google pages, 2026-11-20).

BREAKING (Vertex — for consumers pinning these literals or importing their classes):

- Vertex: removed `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` (retired on Vertex 2026-10-20) and `gemini-3.6-flash` (retired on Vertex 2026-11-19; replacement `gemini-3.8-flash`). The Google-side models are kept because the Gemini API still serves them.

Added:

- Google: `gemini-4-carbon`, `gemini-4-argon`, `gemini-4-neon`, `gemini-4-hydrogen`, `gemini-3.8-flash` (1M input / 65,536 output, text output, `thinking_level`-only reasoning).
- Vertex: wrappers for the same five models at Global Standard PayGo list prices.
- Google: new `GoogleChatModelConfigs.thinkingLevel(maxOutputTokens, maxSequences, levels, defaultLevel)` builder for Gemini 3.6+ models — no temperature/topP/topK, no thinking budget, per-model thinking-level choices and default. Its schema is strict, so removed keys are rejected instead of being silently dropped. `gemini-3.6-flash` and `gemini-3.5-flash-lite` now use it.
- Google: `XHIGH` added to the `thinkingLevel` request enum (Gemini 4 Neon / Hydrogen).

Fixed:

- Google: `gemini-2.5-pro` / `gemini-2.5-flash` descriptions wrongly said "shutdown 2026-10-16"; from 2026-12-01 their requests route to `gemini-3.8-flash` / `gemini-3.5-flash-lite`, billed at that model's rates. `gemini-2.5-flash-lite` is not deprecated (access limited to prior users since 2026-09-18).
- Google: per-model thinking-level UI defaults (`gemini-3.1-flash-lite` minimal, `gemini-3-flash-preview` high, `gemini-3.1-pro-preview`(+customtools) high with MINIMAL removed — also applied to the Vertex inline schemas).
- Google/Vertex: >200K pricing tiers were non-contiguous (`maxTokens: 200000` → `minTokens: 200001`), failing `ChatModelPrice` validation and leaving a 200,000-token prompt unpriced; the first tier now ends at 200001.
- Google/Vertex: thinking tokens (`usageMetadata.thoughtsTokenCount`) are now counted in `completionTokens`, as Google bills them as output.
- Vertex: `gemini-embedding-2` text price $0.15 → $0.20 per 1M; `text-multilingual-embedding-002` gets a real description.
- Annotations: Google `gemini-3.5-flash` auto-routes to `gemini-3.6-flash`; Vertex retirement dates for `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `text-embedding-005`, `text-multilingual-embedding-002` (2027-04-01) and `gemini-embedding-001`.
