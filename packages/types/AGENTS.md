# AGENTS.md

This package defines shared runtime schemas and types used across the gateway and providers.

## Rules

- Treat this package as a contract surface. Small edits can affect every provider.
- Prefer additive changes over breaking structural changes.
- Export both the Zod schema and the inferred TypeScript type when following an existing module pattern.
- Keep naming consistent with adjacent message, content, config, and tool schema files.
- Do not introduce `any`.

## Validation

- Run the local package build/test flow.
- Validate at least one downstream package if the change modifies a widely used schema.
