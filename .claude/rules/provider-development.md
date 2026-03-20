---
paths:
  - "core/providers/**/*.ts"
---

# Provider Development Rules

## Provider Structure
Every provider package follows this exact structure:
- `src/configs/` — Model configuration objects defining supported parameters
- `src/models/` — Model schema definitions using Zod validators
- `src/provider/` — Provider class implementing the base interface from `@adaline/provider`

## Adding a New Provider
1. Copy an existing provider (prefer `core/providers/openai/` as template)
2. Implement the provider interface from `@adaline/provider`
3. Define all model configs with Zod schemas in `src/configs/`
4. Export the provider from `src/provider/`
5. Add the package to `pnpm-workspace.yaml` if not already covered by `core/providers/*`
6. Add `@adaline/types` and `@adaline/provider` as `workspace:*` dependencies

## Adding a New Model to an Existing Provider
1. Add model config in `src/configs/`
2. Add model schema in `src/models/`
3. Export from the provider's barrel file
4. Ensure the model config matches Zod schemas from `@adaline/types`

## Type Safety
- Always use Zod schemas from `@adaline/types` for message, content, tool, and config types
- Export both the Zod schema and inferred TypeScript type
- Never use `any` — use `unknown` with Zod `.parse()` at boundaries
- Validate all provider API responses against schemas

## Error Handling
- Use custom error classes extending `GatewayError`
- Include provider name and status code in all error messages
- Map provider-specific errors to standardized gateway errors
