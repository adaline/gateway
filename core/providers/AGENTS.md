# AGENTS.md

These packages implement provider-specific model catalogs and request/response behavior.

## Expectations

- Follow an existing provider in this directory as the template before introducing a new pattern.
- Keep provider changes self-contained unless a shared contract truly needs to move.
- Preserve provider naming, file layout, and export conventions.

## Standard Layout

- `src/configs/`: model config objects
- `src/models/`: model schemas and model catalog exports
- `src/provider/`: provider class implementation

## Change Rules

- Add models by following the current provider's naming and barrel export patterns exactly.
- Keep provider-specific validation close to the provider unless multiple providers truly share it.
- Prefer explicit model metadata over clever indirection. This repo values clarity in model catalogs.
- If a model family affects pricing, capability flags, or tool-calling behavior, verify all related config files are updated together.

## Validation

- Run the provider package build.
- Run the provider package tests or the narrowest relevant Turbo/Vitest scope.
- If shared types changed, also validate the affected shared package.
