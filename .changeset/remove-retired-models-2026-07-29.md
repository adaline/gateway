---
"@adaline/openai": minor
"@adaline/groq": minor
"@adaline/google": minor
"@adaline/vertex": minor
"@adaline/bedrock": minor
---

Remove models the providers no longer serve, per official deprecation/retirement pages (retrieved 2026-07-29).

BREAKING (for consumers pinning these literals or importing their classes):

- OpenAI: `gpt-5-chat-latest`, `gpt-4o-search-preview`(+2025-03-11), `gpt-4o-mini-search-preview`(+2025-03-11) — shut down 2026-07-23; `chatgpt-4o-latest`, `gpt-4-0125-preview`, `gpt-4-turbo-preview` — already shut down earlier in 2026. `gpt-5.2-codex` is unregistered from openai routing (shut down on the OpenAI API) but its schema remains exported for `@adaline/azure`, where it stays GA until 2027-01-14.
- Groq: `qwen/qwen3-32b`, `meta-llama/llama-4-scout-17b-16e-instruct` — shut down 2026-07-17.
- Google & Vertex: the dated Gemini previews (`gemini-2.5-flash-preview-04-17`, `gemini-2.5-flash-lite-preview-09-2025`, `gemini-2.5-pro-preview-03-25`, `gemini-3-pro-preview`) — retirement now confirmed on both platforms; the schemas previously retained for Vertex are fully deleted.
- Bedrock: `anthropic.claude-3-sonnet-20240229-v1:0`, `anthropic.claude-3-5-sonnet-20240620-v1:0`, `anthropic.claude-3-5-sonnet-20241022-v2:0`, `anthropic.claude-3-7-sonnet-20250219-v1:0` — AWS EOL 2026-07-30.

Note: `gemini-embedding-001` is NOT removed — the previously annotated 2026-07-14 shutdown was a misreading of its release date; Google's deprecations table gives 2028-05-14 (annotation corrected in the follow-up release).
