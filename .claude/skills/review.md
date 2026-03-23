---
name: review
description: Pre-landing code review — catch structural issues, type safety problems, and missing tests.
allowed-tools: Bash, Read, Grep, Glob
user-invocable: true
disable-model-invocation: false
---

# /review — Pre-landing review

1. Get full diff: `git diff origin/main...HEAD`
2. **Type safety**: No `any` casts, no missing return types, no unsafe assertions
3. **Provider consistency**: If provider files changed, verify they match other providers
4. **Test coverage**: Every changed function has a corresponding test
5. **Breaking changes**: Flag any public API modifications without changeset
6. **Import hygiene**: No circular deps, no unused imports
7. **Error handling**: All async calls have proper error handling

## Output
For each finding:
- **[CRITICAL]** or **[INFO]** severity
- File:line reference
- Problem description
- Suggested fix

Auto-fix mechanical issues (unused imports, missing types). Ask for judgment calls.
