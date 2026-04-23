---
"@adaline/openai": patch
---

Clean up the OpenAI web-search surface:

- Remove `webSearchUserLocation` config entirely. It was half-implemented and emitted `user_location` inside the Responses API `web_search` tool; it has been dropped to keep the web-search surface lean. If you were passing `webSearchUserLocation` in your Gateway config, remove it — it is no longer accepted.
- Remove `webSearchTool` from the 5 CC search-preview SKUs (`gpt-4o-search-preview`, `gpt-4o-search-preview-2025-03-11`, `gpt-4o-mini-search-preview`, `gpt-4o-mini-search-preview-2025-03-11`, `gpt-5-search-api`). These models always search server-side and are CC-only — the toggle was causing them to be routed to the Responses API, which does not accept those model names. Their built-in search remains available as before; users simply should not pass `webSearchTool`.
- Delete the now-unused `webSearch` preset and dead `webSearch`-key handling code in `BaseChatModel`.
