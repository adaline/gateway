---
"@adaline/openai": minor
---

Align `reasoning_effort` enums across the gpt-5.x family with OpenAI's current docs, and add the `gpt-5.4-pro` model.

- `gpt-5.1` now uses `none, low, medium, high` (default `none`) — previously `minimal, low, medium, high`.
- `gpt-5.2`, `gpt-5.2-chat-latest`, `chatgpt-5.2`, `gpt-5.4`, `gpt-5.4-mini` now use `none, low, medium, high, xhigh` (default `none`).
- `gpt-5.2-codex`, `gpt-5.3-codex` now use `low, medium, high, xhigh` (default `medium`).
- `gpt-5.2-pro` and the newly added `gpt-5.4-pro` use `medium, high, xhigh` (default `medium`) via the Responses API.
- Legacy `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5-chat-latest`, `gpt-5-search-api` retain `minimal, low, medium, high` (default `medium`) per OpenAI's docs for the original gpt-5 tier.
