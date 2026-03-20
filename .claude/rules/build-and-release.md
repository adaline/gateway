---
paths:
  - "package.json"
  - "turbo.json"
  - "tsup.config.ts"
  - "**/tsup.config.ts"
  - ".changeset/**"
---

# Build and Release Rules

## Build System
- All packages build via `tsup` producing dual ESM/CJS output
- Turbo orchestrates builds respecting the dependency graph
- Never modify `turbo.json` task dependencies without understanding the full graph

## Package Publishing
- Use Changesets for version management: `pnpm run changeset`
- Never manually edit package versions in `package.json`
- Never run `changeset publish` locally — releases happen via GitHub Actions

## Internal Dependencies
- Always use `workspace:*` for internal package references
- The dependency graph: providers → types + provider; gateway → types + provider
- Circular dependencies are forbidden
