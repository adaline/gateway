---
"@adaline/open-router": patch
"@adaline/together-ai": patch
---

Regenerate the OpenRouter and Together AI pricing catalogs from their live sources (2026-11-20).

- OpenRouter: rebuilt from `https://openrouter.ai/api/v1/models` — 469 priced models (412 added, 244 de-listed models dropped, 34 price changes on retained ids). Long-context price tiers are now carried as token ranges. Variable-price routers (`openrouter/auto` and friends) are omitted rather than stored as `-1000000`, which previously produced negative costs.
- Together AI: rebuilt from the serverless models documentation — 26 current serverless chat models; all 77 previous entries (retired chat models plus image, audio, embedding and rerank models misfiled in the chat catalog) are dropped.
- Added `scripts/pricing/regenerate-openrouter-together.py` to make future refreshes repeatable.
