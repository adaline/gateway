---
"@adaline/google": patch
---

fix(google): enable tool_config.include_server_side_tool_invocations when combining googleSearchTool with function tools

Gemini rejects requests that mix the built-in google_search tool with user-provided function_declarations unless tool_config.include_server_side_tool_invocations is set to true. The provider now emits that flag automatically whenever googleSearchTool is enabled alongside function tools, preventing the 400 INVALID_ARGUMENT response.
