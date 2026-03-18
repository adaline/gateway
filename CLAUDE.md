# CLAUDE.md - Adaline Gateway

## Project Overview

Adaline Gateway is a production-grade unified SDK ("Super SDK") for calling 300+ LLMs through a single TypeScript interface. It is fully local (not a proxy), strongly typed, and isomorphic. It supports batching, retries, caching, callbacks, OpenTelemetry, and tool calling.

**Repository:** https://github.com/adaline/gateway

## Tech Stack

- **Language:** TypeScript 5.6
- **Runtime:** Node.js >=18
- **Package Manager:** pnpm >=9 (strictly enforced — never use npm or yarn)
- **Build:** tsup (ESM + CJS dual output)
- **Monorepo:** Turborepo
- **Testing:** Vitest
- **Linting:** ESLint (extends `eslint-config-adaline`)
- **Formatting:** Prettier (140 char width, double quotes, ES5 trailing commas)
- **Validation:** Zod schemas for all runtime types
- **Git Hooks:** Husky (pre-commit runs lint + test)
- **Releases:** Changesets

## Repository Structure

```
core/
  gateway/          — Main @adaline/gateway package (orchestrator, plugins, handlers)
  providers/        — 12 LLM provider implementations (openai, anthropic, google, etc.)
packages/
  types/            — @adaline/types — shared Zod schemas (Config, Message, Tool, Content)
  provider/         — @adaline/provider — base provider interface and abstract classes
tools/
  tsconfig/         — @adaline/tsconfig — shared TypeScript config
  eslint-config/    — eslint-config-adaline — shared ESLint config
  gateway-experiments/ — experimental tools
```

## Common Commands

```bash
pnpm install              # Install all dependencies
pnpm run build            # Build all packages (turbo)
pnpm run test             # Run all tests (vitest)
pnpm run lint             # Lint all packages
pnpm run format           # Format with Prettier
pnpm run clean            # Remove node_modules, dist, .turbo
pnpm run dev              # Start dev mode (watch)
```

Per-package (run from package directory):
```bash
pnpm run test             # vitest run
pnpm run test:watch       # vitest watch
pnpm run build            # tsup
pnpm run lint             # eslint
```

## Architecture & Patterns

### Provider Pattern
Every LLM provider follows the same structure under `core/providers/<name>/`:
- `src/configs/` — model configuration objects
- `src/models/` — model schema definitions with Zod
- `src/provider/` — provider class implementing the base interface from `@adaline/provider`

When adding a new provider, follow existing providers (e.g., `core/providers/openai/`) as the template.

### Type System
- All types are defined as Zod schemas in `packages/types/`
- Always export both the Zod schema and the inferred TypeScript type
- Never use `any` — use `unknown` with Zod validation at boundaries

### Error Handling
- Use custom error classes extending `GatewayError` in `core/gateway/src/errors/`
- Always provide meaningful error messages with provider context

### Plugin System
The gateway supports plugins in `core/gateway/src/plugins/`:
- Cache plugins (custom cache implementations)
- Logger plugins (custom logging)
- Telemetry (OpenTelemetry integration)

### Build Output
Each package compiles via tsup to:
- `dist/index.js` (CJS)
- `dist/index.mjs` (ESM)
- `dist/index.d.ts` (types)

## Dependencies Between Packages

```
All providers → @adaline/types + @adaline/provider
@adaline/gateway → @adaline/types + @adaline/provider
All packages → @adaline/tsconfig (build config)
```

Internal dependencies use `workspace:*` protocol.

## Code Style

- **Prettier:** 140 char width, double quotes, 2-space indent, ES5 trailing commas, LF line endings
- **Import order** (enforced by prettier plugin): third-party → `@adaline/*` → relative imports
- **ESLint:** extends turbo + TypeScript + Prettier
- All packages use: `{ root: true, extends: ["adaline"] }` in `.eslintrc.js`

## Commit Convention

Commits follow conventional commits enforced by commitlint:
- Format: `type(scope): description`
- Types: feat, fix, chore, docs, refactor, test, perf, ci, build, style, revert

## Release Process

Releases are managed via Changesets + GitHub Actions:
1. Create changeset: `pnpm run changeset`
2. Version packages: `pnpm run version`
3. Release is triggered manually via GitHub Actions workflow on `main`

## Environment Variables

- `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` — proxy configuration
- `ADX_NODE_ENV` — environment mode
- `ADX_ANALYTICS_ENABLED` — analytics toggle
- Provider-specific API keys are passed at runtime, not via env vars

## Important Notes

- This is an npm-distributed library, not a deployed service — no Docker
- Pre-commit hooks run `pnpm run lint` and `pnpm run test` — ensure both pass
- Turbo caches build outputs in `dist/**` — run `pnpm run clean` if you see stale artifacts
- The `.changeset/` directory manages release versioning — don't modify manually
