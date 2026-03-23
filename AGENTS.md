# AGENTS.md

This repository ships the Adaline Gateway SDK: a local, typed TypeScript SDK for calling many LLM providers through one interface.

## Stack

- Node.js 18+
- pnpm 9+ only
- Turborepo
- TypeScript + tsup
- Vitest
- ESLint + Prettier
- Changesets for releases

## Working Agreement

- Use `pnpm`, never `npm` or `yarn`.
- Prefer the smallest possible change in the relevant package instead of broad refactors.
- Preserve dual-output package behavior: ESM, CJS, and type declarations.
- Keep imports and exports aligned with existing package barrel patterns.
- Do not hand-edit release artifacts or `.changeset` files unless the task is explicitly about release/versioning.
- When changing provider behavior, review the matching provider package and shared contracts in `packages/types` and `packages/provider`.

## Repository Map

- `core/gateway/`: gateway orchestrator, plugins, handlers, errors
- `core/providers/`: provider implementations
- `packages/types/`: shared Zod schemas and inferred types
- `packages/provider/`: base provider contracts
- `tools/`: shared eslint and tsconfig packages

## Commands

- Install: `pnpm install`
- Build all: `pnpm run build`
- Test all: `pnpm run test`
- Lint all: `pnpm run lint`
- Format all: `pnpm run format`
- Clean: `pnpm run clean`

## Validation

- For provider or shared type changes, run the narrowest package test/build that proves the change works.
- Before finishing a non-trivial change, run at least `pnpm run lint` and the relevant `pnpm run test` scope.
- If a change affects published behavior or package surfaces, mention whether a changeset is required.

## Coding Rules

- Use Zod schemas at runtime boundaries and export both schema and inferred type when the package already follows that pattern.
- Prefer `unknown` plus validation over `any`.
- Add or update tests for public API behavior, edge cases, and provider-specific error handling.
- Mock external provider calls in tests. Do not hit live APIs from test code.

## Nested Instructions

- Read `core/providers/AGENTS.md` before editing any provider package.
- Read `packages/types/AGENTS.md` before changing shared schemas or message/content types.
