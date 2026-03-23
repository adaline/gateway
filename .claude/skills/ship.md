---
name: ship
description: Create PR with full test validation, changeset check, and review. Use when ready to ship a feature or fix.
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
user-invocable: true
disable-model-invocation: true
---

# /ship — Ship current branch as a PR

## Steps

1. **Detect base branch**: `gh pr view --json baseRefName 2>/dev/null || echo main`
2. **Verify not on base**: abort if on main/master
3. **Run full validation**:
   - `pnpm run build` — must pass
   - `pnpm run test` — must pass
   - `pnpm run lint` — must pass
4. **Check changeset**: if any package under core/ or packages/ was modified, ensure a changeset exists
   - If missing: create one with `pnpm run changeset`
5. **Review diff**: `git diff origin/main...HEAD --stat` — summarize changes
6. **Commit any pending changes**
7. **Push branch**: `git push origin HEAD`
8. **Create PR**: `gh pr create` with title (<70 chars), Summary, Changes, Test Plan
9. **Output**: Print PR URL

## Rules
- If tests fail, fix them before shipping — never skip
- If lint fails on files you didn't touch, note in PR but don't block
- Always include changeset for public API changes
