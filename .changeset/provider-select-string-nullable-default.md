---
"@adaline/provider": minor
---

`SelectStringConfigItemDefType.default` is `string | null` (null means the upstream provider documents no default). This type widening shipped in v1.12.1 as a patch; this minor bump records it as the API change it is for TypeScript consumers that read `def.default` as a `string`.
