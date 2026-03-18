---
name: add-model
description: Add a new model to an existing provider
user-invocable: true
argument-hint: "<provider-name> <model-name>"
---

Add a new model to provider `$ARGUMENTS[0]`:

1. Look at existing model configs in `core/providers/$ARGUMENTS[0]/src/configs/` to understand the pattern
2. Look at existing model schemas in `core/providers/$ARGUMENTS[0]/src/models/` for schema patterns
3. Create the new model config following the established pattern
4. Create the model schema with proper Zod validators
5. Export the new model from the provider's barrel file
6. Run `pnpm run build` from the provider directory to verify
7. Run `pnpm run test` from the provider directory to verify
