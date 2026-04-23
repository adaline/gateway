---
"@adaline/openai": minor
"@adaline/gateway": minor
---

feat(openai): route to Responses API when webSearchTool is enabled

The OpenAI provider now routes to the Responses API (`POST /v1/responses`) whenever `config.webSearchTool === true` is set, and remains on Chat Completions (`POST /v1/chat/completions`) otherwise. This unlocks the built-in `web_search` tool on general chat models (gpt-4o, gpt-4.1, gpt-5 family, o-series) without requiring a specialized search-preview model.

**New capability — web search via the Responses API**

- 25 general chat models (gpt-4o family, gpt-4.1, gpt-4.1-mini, gpt-5, gpt-5-mini, gpt-5-nano, gpt-5.1, gpt-5.2, gpt-5.4, gpt-5.4-mini, chatgpt-5.2, gpt-5-chat-latest, gpt-5.2-chat-latest, o1, o3, o3-mini, o4-mini, and their dated variants) gained the `webSearchTool` + `webSearchContextSize` config keys.
- When `webSearchTool: true` is set on any of these models, the provider injects `{type: "web_search"}` into the Responses API tools array, regardless of whether the caller also passed user function tools.
- Citations from the Responses API are translated to the Gateway's existing `SearchResultContent` shape (same schema as Chat Completions citations), so consumers see a uniform output envelope regardless of which API was used.
- Streaming is fully supported: text deltas, citation annotations, and reasoning summaries all surface as Gateway partial messages. A buffer-sidecar state mechanism preserves `item_id → synthetic-index` mappings for function-call argument streams across chunk boundaries.

**Models excluded from the new path (intentional)**

- `gpt-4.1-nano` — OpenAI does not support web_search on this model.
- `chatgpt-4o-latest` — does not support function calling, so built-in tools cannot be invoked.
- Codex variants (`gpt-5.2-codex`, `gpt-5.3-codex`) — tool-free by design.
- CC always-on search SKUs (`gpt-4o-search-preview*`, `gpt-4o-mini-search-preview*`, `gpt-5-search-api`) — these remain on Chat Completions with their existing `web_search_options` parameter; they are a separate OpenAI product tier.

**Pro-model bug fixes shipped alongside (previously silent regressions)**

`gpt-5.2-pro` and `gpt-5.4-pro` migrated from the deprecated `BaseChatModelResponsesApi` scaffold to the unified `BaseChatModel` (with `forceResponsesApi: true`). The scaffold emitted several Chat-Completions-shaped fields that the Responses API silently discarded. The following are now correct:

- `fix(openai)` image content on Pro models: `input_image.image_url.detail` placement now matches the Responses API contract.
- `fix(openai)` assistant tool-call replay on Pro models: history containing `tool_calls` no longer throws; emits `function_call` items at the top of `input[]`.
- `fix(openai)` tool-response turns on Pro models: emits `function_call_output` items at the top of `input[]` instead of a Chat-Completions-shaped `tool` role message.
- `fix(openai)` function-tool schema on Pro models: flat `{type, name, description, parameters, strict}` instead of the Chat-Completions nested `function: {}` wrapper.
- `fix(openai)` URL-citation parsing on Pro models: annotations on `output_text` content parts now surface as `SearchResultContent`.

**Breaking change — public type removal**

The `BaseChatModelResponsesApi` class and its `BaseChatModelResponsesApiOptions` export are removed. Consumers who extended or typed against these symbols should switch to `BaseChatModel` + `BaseChatModelOptions` and pass `{ forceResponsesApi: true }` in the constructor options to preserve "always use Responses API" behavior.

**Out of scope (tracked for follow-up)**

- Stateful conversation features: `previous_response_id`, `store`, server-managed reasoning history.
- `reasoning.summary` and `include: ["reasoning.encrypted_content"]`.
- Built-in tools beyond `web_search`: `file_search`, `code_interpreter`, `computer_use`, `mcp`.
- Azure OpenAI provider parity.
- `transformModelRequest` inverse for Responses-shaped external requests.
