---
paths:
  - "packages/types/**/*.ts"
  - "packages/provider/**/*.ts"
---

# Type System Rules

## Zod Schema Conventions
- Define the Zod schema first, then derive the TypeScript type with `z.infer<typeof Schema>`
- Always export both: `export { MySchema, type MySchemaType }`
- Use `.min()`, `.max()`, and other validators — don't rely on TypeScript alone
- Prefer `z.discriminatedUnion()` over `z.union()` when possible

## Breaking Changes
- Changes to `@adaline/types` affect ALL providers and the gateway
- Adding optional fields is safe; changing or removing fields is a breaking change
- Always run `pnpm run build` from root after changing types to verify all packages compile
- Run `pnpm run test` to confirm no regressions

## Naming
- Schema constants: PascalCase (e.g., `ChatMessage`, `ToolCall`)
- Type aliases: PascalCase with `Type` suffix (e.g., `ChatMessageType`, `ToolCallType`)
- Enum-like schemas: UPPER_SNAKE_CASE values
