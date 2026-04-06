---
"@adaline/openai": minor
"@adaline/types": minor
---

Add web_search_options to OpenAI Provider with search-result modality support.
Simplify SearchResultContent to a single unified schema with optional type field,
removing the discriminated union on type ("google" | "openai").
