---
"@adaline/anthropic": patch
"@adaline/google": patch
"@adaline/vertex": patch
---

New embedding models shipped in #217 (catalog top-up, no breaking changes):

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
