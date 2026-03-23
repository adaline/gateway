---
name: investigate
description: Root-cause debugging — systematic hypothesis testing before any fix. Use when something is broken.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
user-invocable: true
disable-model-invocation: false
---

# /investigate — Debug systematically

### 1. Gather symptoms
- Error message, stack trace, test output
- When did it start? `git log --oneline -20`
- What changed? `git diff HEAD~5...HEAD --stat`

### 2. Form hypothesis
- Testable theory about root cause
- Identify specific file and line

### 3. Verify
- Run failing test in isolation: `npx vitest run path/to/test`
- If 3 hypotheses fail, stop and ask the user

### 4. Fix root cause (not symptoms)
- Minimal change — don't refactor while debugging
- Write regression test that fails without fix
- Run full suite: `pnpm run test`

### 5. Report
Symptom → Root cause → Fix → Test evidence
