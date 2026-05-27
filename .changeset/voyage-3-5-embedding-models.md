---
"@adaline/anthropic": patch
"@adaline/provider": patch
"@adaline/types": patch
---

Add current-generation Voyage embedding models and full embedding pricing + config support.

- New models registered under the Anthropic provider: `voyage-3.5`, `voyage-3.5-lite`, `voyage-3-large`, `voyage-code-3` (32K context; default output dimension 1024, configurable to 256/512/1024/2048).
- Embedding-model pricing: new `EmbeddingModelPrice` type (`@adaline/types`), optional `price` field on `EmbeddingModelSchema` and optional `getModelPricing()` on `EmbeddingModelV1` (`@adaline/provider`), and per-model USD-per-1M-token pricing for all ten Voyage models.
- Embedding config now supports `output_dimension` and `output_dtype` (float/int8/uint8/binary/ubinary) on the flexible-dimension models, in addition to `input_type`, `encoding_format`, and `truncation`. `output_dimension` is forwarded to the Voyage API as an integer.

Fully backwards compatible: legacy fixed-dimension models keep their existing config (no `output_dimension`/`output_dtype`), the new `price`/`getModelPricing` surfaces are optional, and existing `getEmbeddings` calls are unaffected.
