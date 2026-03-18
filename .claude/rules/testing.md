---
paths:
  - "**/*.test.ts"
  - "**/tests/**/*.ts"
---

# Testing Rules

## Framework
- Use Vitest for all tests
- Test files go in a `tests/` directory within each package
- Name test files: `*.test.ts`

## Writing Tests
- Test the public API of each package, not internal implementation details
- Mock external HTTP calls (provider APIs) — never make real API calls in tests
- Use Zod schema validation to verify response shapes
- Test error cases and edge cases, not just happy paths

## Running Tests
- `pnpm run test` from root runs all tests via Turbo
- `pnpm run test` from a package directory runs only that package's tests
- `pnpm run test:watch` for development with hot reload
- Pre-commit hooks run all tests — ensure they pass before committing
