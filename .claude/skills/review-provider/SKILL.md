---
name: review-provider
description: Review a provider implementation for correctness and consistency with other providers
user-invocable: true
argument-hint: "[provider-name]"
---

Review the provider at `core/providers/$ARGUMENTS/` for:

1. **Structure compliance**: Verify it has `src/configs/`, `src/models/`, `src/provider/` directories
2. **Type safety**: Check all Zod schemas are properly defined and exported
3. **Error handling**: Verify provider errors are mapped to `GatewayError` subclasses
4. **Package.json**: Check `@adaline/types` and `@adaline/provider` are `workspace:*` dependencies
5. **Build**: Verify `tsup.config.ts` produces ESM + CJS + types output
6. **Exports**: Check the package exports from `src/index.ts` correctly

Compare with `core/providers/openai/` as the reference implementation and report any deviations or issues.
