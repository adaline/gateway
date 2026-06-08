---
"@adaline/anthropic": minor
"@adaline/google": minor
"@adaline/vertex": minor
---

Add latest-generation embedding models — Gemini Embedding 2 (Google + Vertex), Voyage 4 family (Anthropic), text-embedding-005 (Vertex) — and fix Gemini Embedding 001 registration.

### Google (Generative Language API)
- `gemini-embedding-001` — Matryoshka, default 3072 dims, recommended 768/1536/3072 via `outputDimensionality`, max input 2048 tokens. (Was added to the source tree earlier but never registered in `provider.google.ts`'s `embeddingModelFactories` — corrected here so `getEmbeddingModel("gemini-embedding-001")` dispatches.)
- `gemini-embedding-2` — successor with max input bumped to **8192 tokens** (4× v1), same MRL config (default 3072, supports 768/1536/3072). Multimodal API surface exists; the text path is wired in this change.

### Vertex AI
- `gemini-embedding-001` — same model on the Vertex surface (also corrects the missing registration).
- `gemini-embedding-2` — same as above.
- `text-embedding-005` — English-only general-purpose text embedding, default 768 dims, configurable via `outputDimensionality`. Drop-in successor to `text-embedding-004`.

### Anthropic (Voyage)
- `voyage-4-large` — top-quality general purpose, 1024 default, 32K input tokens. $0.18/M.
- `voyage-4` — balanced cost/quality, 1024, 32K. $0.06/M.
- `voyage-4-lite` — lower latency, lower cost, 1024, 32K. $0.02/M.
- `voyage-4-nano` — open-weight, smallest tier, 1024, 32K. $0.01/M.

All five new model literals are verified against the official docs at PR-creation time (`ai.google.dev/gemini-api/docs/embeddings`, `docs.voyageai.com/docs/embeddings`). Pricing entries match the published list prices.

Each new model is wired through three layers: source file, `index.ts` export, `embedding-pricing.json` entry, and `embeddingModelFactories` registration on the provider class.
